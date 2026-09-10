import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync('src/lib/storage.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

function setup({ denyTransactions = false } = {}) {
  const records = new Map();
  let writes = 0;
  const snapshot = (path) => ({
    id: path.split('/').at(-1),
    exists: () => records.has(path),
    data: () => structuredClone(records.get(path)),
  });
  const update = async (path, fields) => {
    assert.ok(records.has(path), 'must not recreate a missing class');
    writes++;
    records.set(path, { ...records.get(path), ...structuredClone(fields) });
  };
  const firestore = {
    doc: (_, ...parts) => parts.join('/'),
    collection: (_, ...parts) => parts.join('/'),
    getDoc: async (path) => snapshot(path),
    getDocs: async (path) => [...records.keys()]
      .filter((key) => key.startsWith(`${path}/`) && key.split('/').length === path.split('/').length + 1)
      .map(snapshot),
    setDoc: async (path, fields, options) => {
      writes++;
      records.set(path, { ...(options?.merge ? records.get(path) : {}), ...structuredClone(fields) });
    },
    updateDoc: update,
    runTransaction: async (_, callback) => {
      if (denyTransactions) throw new Error('permission-denied');
      return callback({ get: async (path) => snapshot(path), update });
    },
  };
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      if (name === 'firebase/firestore') return firestore;
      if (name === './firebase') return { db: {} };
      throw new Error(`Unexpected import: ${name}`);
    },
    console: { warn() {} },
  });
  return { storage: exports, records, writes: () => writes };
}

const path = 'users/teacher/classes/class-one';
const original = {
  name: 'Computer Science', period: '1', createdAt: '2026-01-01',
  students: [
    { id: 'a', name: 'Zoe', called: true, calledAt: '2026-09-01' },
    { id: 'b', name: 'Alex', called: false },
    { id: 'c', name: 'Alex', called: false },
  ],
};
const settle = () => new Promise((resolve) => setImmediate(resolve));

test('legacy reads add summaries without changing students, history, or class fields', async () => {
  const { storage, records, writes } = setup();
  records.set(path, structuredClone(original));
  records.set(`${path}/history/event`, { studentName: 'Zoe', pickedAt: '2026-09-01' });
  const history = structuredClone(records.get(`${path}/history/event`));
  const loaded = await storage.getClasses('teacher');
  assert.equal(loaded.length, 1);
  await settle();
  const saved = records.get(path);
  assert.deepEqual(saved.students, original.students);
  assert.equal(saved.name, original.name);
  assert.equal(saved.createdAt, original.createdAt);
  assert.deepEqual(saved.studentNames, ['Alex', 'Alex', 'Zoe']);
  assert.equal(saved.studentCount, 3);
  assert.equal(saved.remainingCount, 2);
  assert.deepEqual(records.get(`${path}/history/event`), history);
  const count = writes();
  await storage.getClassById('teacher', 'class-one');
  await settle();
  assert.equal(writes(), count, 'current summaries should not be rewritten');
});

test('profile merge preserves existing fields and classes', async () => {
  const { storage, records } = setup();
  records.set('users/teacher', { preference: 'saved' });
  records.set(path, structuredClone(original));
  await storage.syncUserProfile({ uid: 'teacher', email: 'teacher@example.com', displayName: null });
  assert.deepEqual(records.get('users/teacher'), {
    preference: 'saved', displayName: 'teacher@example.com', email: 'teacher@example.com',
  });
  assert.deepEqual(records.get(path), original);
});

test('denied backfills do not block legacy class reads', async () => {
  const { storage, records } = setup({ denyTransactions: true });
  records.set(path, structuredClone(original));
  assert.equal((await storage.getClassById('teacher', 'class-one')).students.length, 3);
  await settle();
  assert.deepEqual(records.get(path), original);
});

test('roster edits and called-state changes keep summaries and student IDs intact', async () => {
  const { storage, records } = setup();
  records.set(path, structuredClone(original));
  await storage.getClassById('teacher', 'class-one');
  await settle();
  await storage.markCalled('teacher', 'class-one', 'b');
  assert.equal(records.get(path).remainingCount, 1);
  await storage.markUncalled('teacher', 'class-one', 'a');
  assert.equal(records.get(path).remainingCount, 2);
  assert.equal(records.get(path).students[0].calledAt, undefined);
  await storage.updateStudentName('teacher', 'class-one', 'c', 'Bea');
  assert.deepEqual(records.get(path).studentNames, ['Alex', 'Bea', 'Zoe']);
  await storage.removeStudent('teacher', 'class-one', 'b');
  assert.equal(records.get(path).studentCount, 2);
  await storage.addStudentsBulk('teacher', 'class-one', ['Chris', 'Dana']);
  assert.equal(records.get(path).studentCount, 4);
  await storage.resetCycle('teacher', 'class-one');
  assert.equal(records.get(path).remainingCount, 4);
  assert.equal(records.get(path).students[0].id, 'a');
  assert.ok(records.get(path).students.every((student) => !student.called && !student.calledAt));
});

test('new classes start with empty summaries and missing classes stay missing', async () => {
  const { storage, records } = setup();
  const created = await storage.addClass('teacher', 'Math', '2');
  const saved = records.get(`users/teacher/classes/${created.id}`);
  assert.equal(saved.studentCount, 0);
  assert.equal(saved.remainingCount, 0);
  assert.deepEqual(saved.studentNames, []);
  assert.equal(await storage.getClassById('teacher', 'missing'), null);
  assert.equal(records.has('users/teacher/classes/missing'), false);
});
