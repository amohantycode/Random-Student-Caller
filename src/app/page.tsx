'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ClassPeriod } from '@/lib/types';
import * as storage from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';
import ClassCard from '@/components/ClassCard';
import AddClassModal from '@/components/AddClassModal';
import EditClassModal from '@/components/EditClassModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoginScreen from '@/components/LoginScreen';

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paper)]">
      <div className="flex items-center gap-3 text-sm font-medium text-[var(--muted)]">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--blue)]" />
        {label}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState<ClassPeriod[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassPeriod | null>(null);

  const loadClasses = useCallback(async () => {
    if (!user) return;
    const loaded = await storage.getClasses(user.uid);
    setClasses(loaded);
    setIsLoaded(true);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    storage.getClasses(user.uid).then((loaded) => {
      setClasses(loaded);
      setIsLoaded(true);
    });
  }, [user]);

  const handleAddClass = async (name: string, period: string) => {
    if (!user) return;
    await storage.addClass(user.uid, name, period);
    await loadClasses();
  };

  const handleEditClass = async (id: string, name: string, period: string) => {
    if (!user) return;
    await storage.updateClass(user.uid, id, { name, period });
    await loadClasses();
  };

  const handleDeleteClass = async () => {
    if (!user || !selectedClass) return;
    await storage.deleteClass(user.uid, selectedClass.id);
    setShowDeleteConfirm(false);
    setSelectedClass(null);
    await loadClasses();
  };

  const handleSignOut = async () => {
    await signOut();
    setClasses([]);
    setIsLoaded(false);
  };

  if (authLoading) return <LoadingState label="Opening Student Picker…" />;
  if (!user) return <LoginScreen />;
  if (!isLoaded) return <LoadingState label="Loading your classes…" />;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-[rgba(247,246,242,0.9)] backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-5 py-4 sm:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight text-[var(--ink)]">Student Picker</h1>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--blue)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_-8px_rgba(47,103,216,0.8)] transition hover:bg-[var(--blue-dark)]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New class</span>
                <span className="sm:hidden">New</span>
              </button>
              <button
                onClick={handleSignOut}
                className="px-2.5 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--ink)] sm:px-3"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-[var(--ink)] sm:text-4xl">Your classes</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
              Select a class to start.
            </p>
          </div>
          {classes.length > 0 && (
            <p className="hidden shrink-0 pb-1 text-sm font-medium text-[var(--muted)] sm:block">
              {classes.length} {classes.length === 1 ? 'class' : 'classes'}
            </p>
          )}
        </div>

        {classes.length === 0 ? (
          <div className="border-t border-[var(--line)] py-16 sm:py-20">
            <div className="max-w-md">
              <h3 className="text-xl font-semibold text-[var(--ink)]">No classes yet</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Create a class and add your students.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#26324a]"
              >
                Add class
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_18px_50px_-38px_rgba(23,32,51,0.5)] ring-1 ring-black/[0.04]">
            <div className="divide-y divide-[var(--line)]/80">
              {classes.map((classPeriod) => (
                <ClassCard
                  key={classPeriod.id}
                  classPeriod={classPeriod}
                  onClick={() => router.push(`/class/${classPeriod.id}`)}
                  onEdit={() => { setSelectedClass(classPeriod); setShowEditModal(true); }}
                  onDelete={() => { setSelectedClass(classPeriod); setShowDeleteConfirm(true); }}
                />
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold text-[var(--blue)] transition hover:bg-[var(--blue-soft)]/55 sm:px-6"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--blue-soft)]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                </svg>
              </span>
              Add another class
            </button>
          </div>
        )}
      </main>

      <AddClassModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddClass} />
      <EditClassModal
        isOpen={showEditModal}
        classPeriod={selectedClass}
        onClose={() => { setShowEditModal(false); setSelectedClass(null); }}
        onSave={handleEditClass}
      />
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete class?"
        message={`This will permanently remove ${selectedClass?.name ?? 'this class'} and its student list.`}
        confirmLabel="Delete class"
        variant="danger"
        onConfirm={handleDeleteClass}
        onCancel={() => { setShowDeleteConfirm(false); setSelectedClass(null); }}
      />
    </div>
  );
}
