'use client';

import { useEffect, useRef, useState } from 'react';
import type { ClassPeriod, Student } from '@/lib/types';

interface RosterModalProps {
  isOpen: boolean;
  classPeriod: ClassPeriod | null;
  onClose: () => void;
  onAddStudent: (name: string) => void;
  onAddStudentsBulk: (names: string[]) => void;
  onRemoveStudent: (studentId: string) => void;
  onUpdateStudentName: (studentId: string, name: string) => void;
  onResetCycle: () => void;
}

export default function RosterModal({ isOpen, classPeriod, onClose, onAddStudent, onAddStudentsBulk, onRemoveStudent, onUpdateStudentName, onResetCycle }: RosterModalProps) {
  const [newName, setNewName] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkNames, setBulkNames] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  if (!isOpen || !classPeriod) return null;

  const students = classPeriod.students;
  const remainingCount = students.filter((student) => !student.called).length;
  const pickedCount = students.length - remainingCount;

  const closeModal = () => {
    setConfirmDeleteId(null);
    setConfirmReset(false);
    setIsBulkMode(false);
    setNewName('');
    setBulkNames('');
    setEditingId(null);
    onClose();
  };

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newName.trim()) return;
    onAddStudent(newName.trim());
    setNewName('');
  };

  const handleBulkAdd = () => {
    const names = bulkNames.split('\n').map((name) => name.trim()).filter(Boolean);
    if (!names.length) return;
    onAddStudentsBulk(names);
    setBulkNames('');
    setIsBulkMode(false);
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onRemoveStudent(id);
      setConfirmDeleteId(null);
      return;
    }
    setConfirmDeleteId(id);
    setTimeout(() => setConfirmDeleteId((current) => current === id ? null : current), 3000);
  };

  const handleEditStart = (student: Student) => {
    setEditingId(student.id);
    setEditName(student.name);
  };

  const handleEditSave = () => {
    if (editingId && editName.trim()) onUpdateStudentName(editingId, editName.trim());
    setEditingId(null);
  };

  const handleEditKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleEditSave();
    else if (event.key === 'Escape') setEditingId(null);
  };

  const handleReset = () => {
    if (confirmReset) {
      onResetCycle();
      setConfirmReset(false);
      return;
    }
    setConfirmReset(true);
    setTimeout(() => setConfirmReset(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/45 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[18px] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="roster-title">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--blue)]">Roster</p>
            <h2 id="roster-title" className="mt-1 truncate text-2xl font-semibold tracking-tight text-[var(--ink)]">{classPeriod.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{students.length} students · {remainingCount} left · {pickedCount} picked</p>
          </div>
          <button onClick={closeModal} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[#f4f3ef] hover:text-[var(--ink)]" aria-label="Close roster">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <section className="bg-[var(--blue-soft)]/65 px-4 py-4 sm:px-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-[var(--ink)]">Add students</h3>
              <button onClick={() => setIsBulkMode(!isBulkMode)} className="text-xs font-semibold text-[var(--blue)] hover:underline">
                {isBulkMode ? 'Add one name' : 'Paste a full roster'}
              </button>
            </div>
            {!isBulkMode ? (
              <form onSubmit={handleAdd} className="flex gap-2">
                <input type="text" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Student name" className="min-w-0 flex-1 rounded-xl border border-[#cbd6f3] bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-[#969ba8] focus:border-[var(--blue)]" />
                <button type="submit" disabled={!newName.trim()} className="rounded-full bg-[var(--blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--blue-dark)] disabled:cursor-not-allowed disabled:opacity-45">Add</button>
              </form>
            ) : (
              <div>
                <textarea value={bulkNames} onChange={(event) => setBulkNames(event.target.value)} placeholder={'Paste one name per line\nJordan Lee\nAvery Patel'} className="h-32 w-full resize-y rounded-xl border border-[#cbd6f3] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#969ba8] focus:border-[var(--blue)]" />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-[var(--muted)]">One student per line</p>
                  <button onClick={handleBulkAdd} disabled={!bulkNames.trim()} className="rounded-full bg-[var(--blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--blue-dark)] disabled:cursor-not-allowed disabled:opacity-45">Add roster</button>
                </div>
              </div>
            )}
          </section>

          <section className="mt-7">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-[var(--ink)]">Students</h3>
              {students.length > 0 && <p className="text-xs text-[var(--muted)]">Select a name to edit</p>}
            </div>

            {students.length === 0 ? (
              <div className="border-y border-[var(--line)] py-10 text-center">
                <p className="text-sm font-medium text-[var(--ink)]">No students yet</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Add a name above to get started.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {students.map((student) => (
                  <li key={student.id} className="group flex items-center justify-between gap-3 px-1 py-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${student.called ? 'bg-[#b9bbc2]' : 'bg-[var(--green)]'}`} title={student.called ? 'Already picked' : 'Still to pick'} />
                      {editingId === student.id ? (
                        <input ref={editInputRef} type="text" value={editName} onChange={(event) => setEditName(event.target.value)} onBlur={handleEditSave} onKeyDown={handleEditKeyDown} className="min-w-0 flex-1 border-b border-[var(--blue)] px-1 py-0.5 text-sm outline-none" />
                      ) : (
                        <button onClick={() => handleEditStart(student)} className={`min-w-0 flex-1 truncate text-left text-sm ${student.called ? 'text-[var(--muted)]' : 'font-medium text-[var(--ink)]'}`}>{student.name}</button>
                      )}
                    </div>
                    <button onClick={() => handleDelete(student.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${confirmDeleteId === student.id ? 'bg-[var(--red)] text-white' : 'text-[var(--muted)] opacity-100 hover:bg-[#fff3f1] hover:text-[var(--red)] sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100'}`}>
                      {confirmDeleteId === student.id ? 'Remove?' : 'Remove'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-[var(--line)] px-5 py-4 sm:px-7">
          <button onClick={handleReset} disabled={students.length === 0} className={`rounded-full px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${confirmReset ? 'bg-[#fff3f1] text-[var(--red)]' : 'text-[var(--muted)] hover:bg-[#f4f3ef] hover:text-[var(--ink)]'}`}>
            {confirmReset ? 'Tap again to reset' : 'Reset round'}
          </button>
          <button onClick={closeModal} className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#26324a]">Done</button>
        </footer>
      </div>
    </div>
  );
}
