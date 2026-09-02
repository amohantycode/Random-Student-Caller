'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { ClassPeriod } from '@/lib/types';
import * as storage from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import SpinnerWheel from '@/components/SpinnerWheel';
import StudentList from '@/components/StudentList';
import RosterModal from '@/components/RosterModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import HistoryLog from '@/components/HistoryLog';

export default function ClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [classPeriod, setClassPeriod] = useState<ClassPeriod | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loadClass = useCallback(async () => {
    if (!user) return;
    const data = await storage.getClassById(user.uid, classId);
    setClassPeriod(data || null);
    setIsLoaded(true);
  }, [classId, user]);

  useEffect(() => {
    if (!user) return;
    storage.getClassById(user.uid, classId).then((data) => {
      setClassPeriod(data || null);
      setIsLoaded(true);
    });
  }, [user, classId]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [authLoading, user, router]);

  const uncalledStudents = classPeriod?.students.filter((student) => !student.called) || [];
  const calledStudents = classPeriod?.students.filter((student) => student.called) || [];
  const uncalledNames = uncalledStudents.map((student) => student.name);

  const handleSpinComplete = useCallback(async (name: string) => {
    if (!classPeriod || !user) return;
    const student = classPeriod.students.find((item) => item.name === name && !item.called);

    if (student) {
      await storage.markCalled(user.uid, classId, student.id);
      await storage.addHistoryEntry(user.uid, classId, name);
      const updatedClass = await storage.getClassById(user.uid, classId);

      if (updatedClass && updatedClass.students.length > 0 && updatedClass.students.every((item) => item.called)) {
        setTimeout(async () => {
          await storage.resetCycle(user.uid, classId);
          await loadClass();
        }, 3000);
      }

      await loadClass();
    }
    setIsSpinning(false);
  }, [classPeriod, classId, loadClass, user]);

  const handlePutBack = async (studentId: string) => {
    if (!user) return;
    await storage.markUncalled(user.uid, classId, studentId);
    await loadClass();
  };

  const handleResetCycle = async () => {
    if (!user) return;
    await storage.resetCycle(user.uid, classId);
    setShowResetConfirm(false);
    await loadClass();
  };

  const handleAddStudent = async (name: string) => {
    if (!user) return;
    await storage.addStudent(user.uid, classId, name);
    await loadClass();
  };

  const handleAddStudentsBulk = async (names: string[]) => {
    if (!user) return;
    await storage.addStudentsBulk(user.uid, classId, names);
    await loadClass();
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!user) return;
    await storage.removeStudent(user.uid, classId, studentId);
    await loadClass();
  };

  const handleUpdateStudentName = async (studentId: string, name: string) => {
    if (!user) return;
    await storage.updateStudentName(user.uid, classId, studentId, name);
    await loadClass();
  };

  if (authLoading || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-[var(--muted)]">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--blue)]" />
          Opening class…
        </div>
      </div>
    );
  }

  if (!classPeriod) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <p className="mb-3 text-sm font-semibold text-[var(--blue)]">Student Picker</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">We couldn’t find that class.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">It may have been removed, or the link may be out of date.</p>
        <button onClick={() => router.push('/')} className="mt-7 w-fit rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#26324a]">
          Back to your classes
        </button>
      </main>
    );
  }

  const totalStudents = classPeriod.students.length;
  const calledCount = calledStudents.length;
  const progressPercent = totalStudents > 0 ? Math.round((calledCount / totalStudents) * 100) : 0;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-[rgba(247,246,242,0.92)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)]"
              aria-label="Back to classes"
              title="Back to classes"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-[var(--ink)]">{classPeriod.name}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--muted)]">
                <span className="font-semibold text-[var(--blue)]">{classPeriod.period}</span>
                <span aria-hidden="true">·</span>
                <span>{totalStudents} {totalStudents === 1 ? 'student' : 'students'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)]"
              title="Pick history"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">History</span>
            </button>
            {totalStudents > 0 && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="hidden rounded-full px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)] sm:inline-flex"
              >
                Reset round
              </button>
            )}
            <button
              onClick={() => setShowRoster(true)}
              className="inline-flex items-center rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#26324a]"
            >
              <span>Roster</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-7 sm:py-10">
        {totalStudents === 0 ? (
          <div className="mx-auto max-w-xl border-t border-[var(--line)] py-16 text-center sm:py-24">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">Add your students to begin</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">Paste a full roster or add names one at a time. You can edit the list whenever you need.</p>
            <button onClick={() => setShowRoster(true)} className="mt-7 rounded-full bg-[var(--blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--blue-dark)]">
              Add students
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="min-w-0">
              {uncalledStudents.length === 0 && calledStudents.length > 0 && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-[var(--line)] py-3 text-sm">
                  <p className="font-semibold text-[var(--ink)]">Everyone had a turn. A new round will start in a moment.</p>
                  <button onClick={handleResetCycle} className="font-semibold text-[var(--blue)] hover:underline">Start now</button>
                </div>
              )}
              <SpinnerWheel names={uncalledNames} isSpinning={isSpinning} onSpinStart={() => setIsSpinning(true)} onSpinComplete={handleSpinComplete} />
            </section>

            <aside className="overflow-hidden rounded-[18px] bg-white shadow-[0_18px_50px_-38px_rgba(23,32,51,0.5)] ring-1 ring-black/[0.04]">
              <div className="px-5 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--blue)]">This round</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">Every name gets one turn.</p>
                  </div>
                  <span className="text-2xl font-semibold tabular-nums text-[var(--ink)]">{progressPercent}%</span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--paper-deep)]">
                  <div className="h-full rounded-full bg-[var(--blue)] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="mt-4 flex gap-6 text-xs text-[var(--muted)]">
                  <span><strong className="text-base font-semibold text-[var(--ink)]">{uncalledStudents.length}</strong> left</span>
                  <span><strong className="text-base font-semibold text-[var(--ink)]">{calledStudents.length}</strong> picked</span>
                </div>
              </div>

              <StudentList title="Still to pick" students={uncalledStudents} variant="uncalled" />
              <StudentList title="Already picked" students={calledStudents} variant="called" onPutBack={handlePutBack} />

              <button onClick={() => setShowResetConfirm(true)} className="flex w-full items-center justify-center border-t border-[var(--line)] px-4 py-3.5 text-sm font-semibold text-[var(--muted)] transition hover:bg-[#fafaf8] hover:text-[var(--ink)] sm:hidden">
                Reset round
              </button>
            </aside>
          </div>
        )}
      </main>

      <RosterModal
        isOpen={showRoster}
        classPeriod={classPeriod}
        onClose={() => { setShowRoster(false); loadClass(); }}
        onAddStudent={handleAddStudent}
        onAddStudentsBulk={handleAddStudentsBulk}
        onRemoveStudent={handleRemoveStudent}
        onUpdateStudentName={handleUpdateStudentName}
        onResetCycle={handleResetCycle}
      />
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Start a new round?"
        message="Everyone will return to the picker, ready to be chosen again."
        confirmLabel="Start new round"
        variant="warning"
        onConfirm={handleResetCycle}
        onCancel={() => setShowResetConfirm(false)}
      />
      {user && (
        <HistoryLog isOpen={showHistory} onClose={() => setShowHistory(false)} uid={user.uid} classId={classId} className={classPeriod.name} />
      )}
    </div>
  );
}
