import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { ClassPeriod, Student } from './types';

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
  });
  return classes.sort((a, b) => a.period.localeCompare(b.period));
}

export async function getClassById(uid: string, classId: string): Promise<ClassPeriod | null> {
  const snap = await getDoc(classDoc(uid, classId));
  if (!snap.exists()) return null;
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
  await updateDoc(classDoc(uid, classId), { students });
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
