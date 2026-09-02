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
    <article className="group relative overflow-hidden rounded-[20px] bg-white shadow-[0_18px_45px_-34px_rgba(23,32,51,0.62)] ring-1 ring-black/[0.05] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-34px_rgba(23,32,51,0.7)]">
      <div className="absolute right-4 top-4 z-10 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          onClick={(event) => { event.stopPropagation(); onEdit(); }}
          className="grid h-8 w-8 place-items-center rounded-full bg-[var(--paper)] text-[var(--muted)] transition hover:bg-[var(--blue-soft)] hover:text-[var(--blue)]"
          title="Edit class"
          aria-label={`Edit ${classPeriod.name}`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={(event) => { event.stopPropagation(); onDelete(); }}
          className="grid h-8 w-8 place-items-center rounded-full bg-[var(--paper)] text-[var(--muted)] transition hover:bg-red-50 hover:text-[var(--red)]"
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
        className="flex min-h-52 w-full flex-col p-5 text-left sm:p-6"
        aria-label={`Open ${classPeriod.name}`}
      >
        <div className="flex min-h-8 items-center pr-20">
          <span className="rounded-full bg-[var(--blue-soft)] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[var(--blue)]">
            {classPeriod.period}
          </span>
        </div>

        <div className="mt-6 min-w-0">
          <h3 className="truncate text-xl font-semibold tracking-[-0.02em] text-[var(--ink)]">{classPeriod.name}</h3>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            {totalStudents} {totalStudents === 1 ? 'student' : 'students'}
          </p>
        </div>

        <div className="mt-auto pt-7">
          <div className="mb-2.5 flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--muted)]">This round</span>
            <span className="font-semibold tabular-nums text-[var(--ink)]">{calledStudents}/{totalStudents}</span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--paper-deep)]"
            role="progressbar"
            aria-label={`${classPeriod.name}: ${calledStudents} of ${totalStudents} students picked this round`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercentage}
          >
            <div
              className="h-full rounded-full bg-[var(--blue)] transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-end gap-1.5 text-xs font-semibold text-[var(--blue)] transition group-hover:gap-2.5">
            Open class
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          </div>
        </div>
      </button>
    </article>
  );
}
