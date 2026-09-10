import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { ClassPeriod, Student, HistoryEntry } from './types';
import type { User } from './auth';

// Keep authentication IDs stable; readable fields make users searchable in the console.
export async function syncUserProfile(user: Pick<User, 'uid' | 'displayName' | 'email'>): Promise<void> {
  await setDoc(doc(db, 'users', user.uid), {
    displayName: user.displayName || user.email || 'Teacher',
    email: user.email,
  }, { merge: true });
}

function rosterSummary(students: Student[]) {
  return {
    studentNames: students.map((student) => student.name).sort((a, b) => a.localeCompare(b)),
    studentCount: students.length,
    remainingCount: students.filter((student) => !student.called).length,
  };
}

function hasCurrentSummary(data: Record<string, unknown>) {
  const summary = rosterSummary(data.students as Student[]);
  return data.studentCount === summary.studentCount
    && data.remainingCount === summary.remainingCount
    && JSON.stringify(data.studentNames) === JSON.stringify(summary.studentNames);
}

// Add only derived fields. A transaction prevents a concurrent roster edit or
// class deletion from being overwritten by this optional console backfill.
async function refreshClassSummary(uid: string, classId: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const ref = classDoc(uid, classId);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists() || hasCurrentSummary(snapshot.data())) return;
    transaction.update(ref, rosterSummary(snapshot.data().students as Student[]));
  });
}

function backfillClassSummary(uid: string, classId: string, data: Record<string, unknown>) {
  if (hasCurrentSummary(data)) return;
  // Existing classes still load if optional metadata writes are denied or offline.
  void refreshClassSummary(uid, classId).catch((error) => {
    console.warn('Could not refresh the class console summary.', error);
  });
}

// Helper: generate a short unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// --- Classes ---

function classesCol(uid: string) {
  return collection(db, 'users', uid, 'classes');
}

function classDoc(uid: string, classId: string) {
  return doc(db, 'users', uid, 'classes', classId);
}

export async function getClasses(uid: string): Promise<ClassPeriod[]> {
  const snapshot = await getDocs(classesCol(uid));
  const classes: ClassPeriod[] = [];
  snapshot.forEach((doc) => {
    classes.push({ id: doc.id, ...doc.data() } as ClassPeriod);
    backfillClassSummary(uid, doc.id, doc.data());
  });
  return classes.sort((a, b) => a.period.localeCompare(b.period));
}

export async function getClassById(uid: string, classId: string): Promise<ClassPeriod | null> {
  const snap = await getDoc(classDoc(uid, classId));
  if (!snap.exists()) return null;
  backfillClassSummary(uid, snap.id, snap.data());
  return { id: snap.id, ...snap.data() } as ClassPeriod;
}

export async function addClass(uid: string, name: string, period: string): Promise<ClassPeriod> {
  const id = generateId();
  const newClass: ClassPeriod = {
    id,
    name,
    period,
    students: [],
    createdAt: new Date().toISOString(),
  };
  await setDoc(classDoc(uid, id), {
    name: newClass.name,
    period: newClass.period,
    students: newClass.students,
    createdAt: newClass.createdAt,
    ...rosterSummary(newClass.students),
  });
  return newClass;
}

export async function updateClass(uid: string, classId: string, updates: Partial<Pick<ClassPeriod, 'name' | 'period'>>): Promise<void> {
  await updateDoc(classDoc(uid, classId), updates);
}

export async function deleteClass(uid: string, classId: string): Promise<void> {
  await deleteDoc(classDoc(uid, classId));
}

// --- Students ---

async function updateStudents(uid: string, classId: string, students: Student[]): Promise<void> {
  await updateDoc(classDoc(uid, classId), { students, ...rosterSummary(students) });
}

export async function addStudent(uid: string, classId: string, name: string): Promise<void> {
  const cls = await getClassById(uid, classId);
  if (!cls) return;
  const student: Student = {
    id: generateId(),
    name,
    called: false,
  };
  cls.students.push(student);
  await updateStudents(uid, classId, cls.students);
}

export async function addStudentsBulk(uid: string, classId: string, names: string[]): Promise<void> {
  const cls = await getClassById(uid, classId);
  if (!cls) return;
  const newStudents: Student[] = names.map((name) => ({
    id: generateId(),
    name,
    called: false,
  }));
  cls.students.push(...newStudents);
  await updateStudents(uid, classId, cls.students);
}

export async function removeStudent(uid: string, classId: string, studentId: string): Promise<void> {
  const cls = await getClassById(uid, classId);
  if (!cls) return;
  cls.students = cls.students.filter((s) => s.id !== studentId);
  await updateStudents(uid, classId, cls.students);
}

export async function updateStudentName(uid: string, classId: string, studentId: string, name: string): Promise<void> {
  const cls = await getClassById(uid, classId);
  if (!cls) return;
  const student = cls.students.find((s) => s.id === studentId);
  if (student) {
    student.name = name;
    await updateStudents(uid, classId, cls.students);
  }
}

export async function markCalled(uid: string, classId: string, studentId: string): Promise<void> {
  const cls = await getClassById(uid, classId);
  if (!cls) return;
  const student = cls.students.find((s) => s.id === studentId);
  if (student) {
    student.called = true;
    student.calledAt = new Date().toISOString();
    await updateStudents(uid, classId, cls.students);
  }
}

export async function markUncalled(uid: string, classId: string, studentId: string): Promise<void> {
  const cls = await getClassById(uid, classId);
  if (!cls) return;
  const student = cls.students.find((s) => s.id === studentId);
  if (student) {
    student.called = false;
    delete student.calledAt;
    await updateStudents(uid, classId, cls.students);
  }
}

export async function resetCycle(uid: string, classId: string): Promise<void> {
  const cls = await getClassById(uid, classId);
  if (!cls) return;
  cls.students.forEach((s) => {
    s.called = false;
    delete s.calledAt;
  });
  await updateStudents(uid, classId, cls.students);
}

// --- History ---

function historyCol(uid: string, classId: string) {
  return collection(db, 'users', uid, 'classes', classId, 'history');
}

export async function addHistoryEntry(uid: string, classId: string, studentName: string): Promise<void> {
  await addDoc(historyCol(uid, classId), {
    studentName,
    pickedAt: new Date().toISOString(),
  });
}

export async function getHistory(uid: string, classId: string): Promise<HistoryEntry[]> {
  const q = query(historyCol(uid, classId), orderBy('pickedAt', 'desc'));
  const snapshot = await getDocs(q);
  const entries: HistoryEntry[] = [];
  snapshot.forEach((doc) => {
    entries.push({ id: doc.id, ...doc.data() } as HistoryEntry);
  });
  return entries;
}
