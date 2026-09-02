'use client';

import { useState } from 'react';
import type { Student } from '@/lib/types';

interface StudentListProps {
  title: string;
  students: Student[];
  variant: 'uncalled' | 'called';
  onPutBack?: (studentId: string) => void;
}

export default function StudentList({ title, students, variant, onPutBack }: StudentListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sortedStudents = [...students].sort((a, b) => {
    if (variant === 'called' && a.calledAt && b.calledAt) {
      return new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime();
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <section className="border-t border-[var(--line)]">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-[#fafaf8]"
        aria-expanded={!isCollapsed}
      >
        <span className="flex items-center gap-2.5">
          <span className={`h-2 w-2 rounded-full ${variant === 'uncalled' ? 'bg-[var(--green)]' : 'bg-[#b9bbc2]'}`} />
          <span className="text-sm font-semibold text-[var(--ink)]">{title}</span>
          <span className="text-xs font-medium tabular-nums text-[var(--muted)]">{students.length}</span>
        </span>
        <svg className={`h-4 w-4 text-[var(--muted)] transition-transform ${isCollapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!isCollapsed && (
        <div className="custom-scrollbar max-h-60 overflow-y-auto border-t border-[var(--line)]/70">
          {sortedStudents.length === 0 ? (
            <p className="px-5 py-6 text-center text-xs text-[var(--muted)]">
              {variant === 'uncalled' ? 'None remaining' : 'No students yet'}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--line)]/60 px-5">
              {sortedStudents.map((student) => (
                <li key={student.id} className="group flex items-center justify-between py-2.5">
                  <span className={`min-w-0 truncate text-sm ${variant === 'called' ? 'text-[var(--muted)]' : 'font-medium text-[var(--ink)]'}`}>
                    {student.name}
                  </span>
                  {variant === 'called' && onPutBack && (
                    <button
                      onClick={() => onPutBack(student.id)}
                      className="ml-3 shrink-0 text-xs font-semibold text-[var(--blue)] opacity-100 transition hover:underline sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                      title="Return this student to the picker"
                    >
                      Put back
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
