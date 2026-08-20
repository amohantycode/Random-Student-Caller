import { ClassPeriod, Student } from './types';

const STORAGE_KEY = 'pickme-classes';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getClasses(): ClassPeriod[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse classes from localStorage:', error);
    return [];
  }
}

export function saveClasses(classes: ClassPeriod[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  } catch (error) {
    console.error('Failed to save classes to localStorage:', error);
  }
}

export function getClassById(id: string): ClassPeriod | undefined {
  const classes = getClasses();
  return classes.find(c => c.id === id);
}

export function addClass(name: string, period: string): ClassPeriod {
  const classes = getClasses();
  const newClass: ClassPeriod = {
    id: generateId(),
    name,
    period,
    students: [],
    createdAt: new Date().toISOString(),
  };
  classes.push(newClass);
  saveClasses(classes);
  return newClass;
}

export function updateClass(id: string, updates: Partial<Pick<ClassPeriod, 'name' | 'period'>>): void {
  const classes = getClasses();
  const index = classes.findIndex(c => c.id === id);
  if (index !== -1) {
    classes[index] = { ...classes[index], ...updates };
    saveClasses(classes);
  }
}

export function deleteClass(id: string): void {
  const classes = getClasses();
  const filtered = classes.filter(c => c.id !== id);
  saveClasses(filtered);
}

export function addStudent(classId: string, name: string): void {
  const classes = getClasses();
  const classIndex = classes.findIndex(c => c.id === classId);
  if (classIndex !== -1) {
    const student: Student = {
      id: generateId(),
      name,
      called: false,
    };
    classes[classIndex].students.push(student);
    saveClasses(classes);
  }
}

export function addStudentsBulk(classId: string, names: string[]): void {
  const classes = getClasses();
  const classIndex = classes.findIndex(c => c.id === classId);
  if (classIndex !== -1) {
    const newStudents: Student[] = names.map(name => ({
      id: generateId(),
      name,
      called: false,
    }));
    classes[classIndex].students.push(...newStudents);
    saveClasses(classes);
  }
}

export function removeStudent(classId: string, studentId: string): void {
  const classes = getClasses();
  const classIndex = classes.findIndex(c => c.id === classId);
  if (classIndex !== -1) {
    classes[classIndex].students = classes[classIndex].students.filter(s => s.id !== studentId);
    saveClasses(classes);
  }
}

export function updateStudentName(classId: string, studentId: string, name: string): void {
  const classes = getClasses();
  const classIndex = classes.findIndex(c => c.id === classId);
  if (classIndex !== -1) {
    const studentIndex = classes[classIndex].students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
      classes[classIndex].students[studentIndex].name = name;
      saveClasses(classes);
    }
  }
}

export function markCalled(classId: string, studentId: string): void {
  const classes = getClasses();
  const classIndex = classes.findIndex(c => c.id === classId);
  if (classIndex !== -1) {
    const studentIndex = classes[classIndex].students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
      classes[classIndex].students[studentIndex].called = true;
      classes[classIndex].students[studentIndex].calledAt = new Date().toISOString();
      saveClasses(classes);
    }
  }
}

export function markUncalled(classId: string, studentId: string): void {
  const classes = getClasses();
  const classIndex = classes.findIndex(c => c.id === classId);
  if (classIndex !== -1) {
    const studentIndex = classes[classIndex].students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
      classes[classIndex].students[studentIndex].called = false;
      delete classes[classIndex].students[studentIndex].calledAt;
      saveClasses(classes);
    }
  }
}

export function resetCycle(classId: string): void {
  const classes = getClasses();
  const classIndex = classes.findIndex(c => c.id === classId);
  if (classIndex !== -1) {
    classes[classIndex].students.forEach(s => {
      s.called = false;
      delete s.calledAt;
    });
    saveClasses(classes);
  }
}
