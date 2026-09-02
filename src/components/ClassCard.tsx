'use client';

import type { ClassPeriod } from '@/lib/types';

type ClassCardProps = {
  classPeriod: ClassPeriod;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ClassCard({ classPeriod, onClick, onEdit, onDelete }: ClassCardProps) {
  const totalStudents = classPeriod.students?.length || 0;
  const calledStudents = classPeriod.students?.filter((student) => student.called).length || 0;
  const progressPercentage = totalStudents > 0 ? Math.round((calledStudents / totalStudents) * 100) : 0;

  return (
    <article className="group relative transition-colors hover:bg-[#fafaf8]">
      <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 gap-1 sm:right-5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          onClick={(event) => { event.stopPropagation(); onEdit(); }}
          className="grid h-9 w-9 place-items-center rounded-full bg-white text-[var(--muted)] shadow-sm ring-1 ring-black/[0.06] transition hover:text-[var(--blue)]"
          title="Edit class"
          aria-label={`Edit ${classPeriod.name}`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={(event) => { event.stopPropagation(); onDelete(); }}
          className="grid h-9 w-9 place-items-center rounded-full bg-white text-[var(--muted)] shadow-sm ring-1 ring-black/[0.06] transition hover:text-[var(--red)]"
          title="Delete class"
          aria-label={`Delete ${classPeriod.name}`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <button
        onClick={onClick}
        className="grid w-full grid-cols-1 items-center gap-5 px-5 py-5 pr-24 text-left sm:grid-cols-[8rem_1fr_10rem] sm:px-6 sm:py-6 sm:pr-28"
      >
        <div className="hidden sm:block">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--blue)]">{classPeriod.period}</span>
        </div>
        <div className="min-w-0">
          <span className="mb-1 block text-[0.67rem] font-bold uppercase tracking-[0.14em] text-[var(--blue)] sm:hidden">{classPeriod.period}</span>
          <h3 className="truncate text-base font-semibold text-[var(--ink)] sm:text-lg">{classPeriod.name}</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">{totalStudents} {totalStudents === 1 ? 'student' : 'students'}</p>
        </div>
        <div className="hidden sm:block">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-[var(--muted)]">Round progress</span>
            <span className="font-semibold text-[var(--ink)]">{calledStudents}/{totalStudents}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--paper-deep)]">
            <div className="h-full rounded-full bg-[var(--blue)] transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </button>
    </article>
  );
}
