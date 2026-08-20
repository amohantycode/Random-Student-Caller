'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ClassPeriod } from '@/lib/types';
import * as storage from '@/lib/storage';
import SpinnerWheel from '@/components/SpinnerWheel';
import StudentList from '@/components/StudentList';
import RosterModal from '@/components/RosterModal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function ClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  const [classPeriod, setClassPeriod] = useState<ClassPeriod | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [lastSelected, setLastSelected] = useState<string | null>(null);

  const loadClass = useCallback(() => {
    const data = storage.getClassById(classId);
    setClassPeriod(data || null);
    setIsLoaded(true);
  }, [classId]);

  useEffect(() => {
    loadClass();
  }, [loadClass]);

  const uncalledStudents = classPeriod?.students.filter(s => !s.called) || [];
  const calledStudents = classPeriod?.students.filter(s => s.called) || [];
  const uncalledNames = uncalledStudents.map(s => s.name);

  const handleSpinComplete = useCallback((name: string) => {
    if (!classPeriod) return;
    const student = classPeriod.students.find(s => s.name === name && !s.called);
    if (student) {
      storage.markCalled(classId, student.id);
      setLastSelected(name);

      const updatedClass = storage.getClassById(classId);
      if (updatedClass) {
        const remaining = updatedClass.students.filter(s => !s.called);
        if (remaining.length === 0 && updatedClass.students.length > 0) {
          setTimeout(() => {
            storage.resetCycle(classId);
            loadClass();
          }, 3000);
        }
      }

      loadClass();
    }
    setIsSpinning(false);
  }, [classPeriod, classId, loadClass]);

  const handlePutBack = (studentId: string) => {
    storage.markUncalled(classId, studentId);
    loadClass();
  };

  const handleResetCycle = () => {
    storage.resetCycle(classId);
    setShowResetConfirm(false);
    setLastSelected(null);
    loadClass();
  };

  const handleAddStudent = (name: string) => {
    storage.addStudent(classId, name);
    loadClass();
  };

  const handleAddStudentsBulk = (names: string[]) => {
    storage.addStudentsBulk(classId, names);
    loadClass();
  };

  const handleRemoveStudent = (studentId: string) => {
    storage.removeStudent(classId, studentId);
    loadClass();
  };

  const handleUpdateStudentName = (studentId: string, name: string) => {
    storage.updateStudentName(classId, studentId, name);
    loadClass();
  };

  const handleRosterResetCycle = () => {
    storage.resetCycle(classId);
    loadClass();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!classPeriod) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">Class not found</h2>
        <p className="text-sm text-gray-500">This class may have been deleted.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const totalStudents = classPeriod.students.length;
  const calledCount = calledStudents.length;
  const progressPercent = totalStudents > 0 ? Math.round((calledCount / totalStudents) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back + Class Info */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.push('/')}
                className="flex-shrink-0 p-1.5 -ml-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                title="Back to Dashboard"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 flex-shrink-0">
                    {classPeriod.period}
                  </span>
                  <h1 className="text-base font-semibold text-gray-900 truncate">
                    {classPeriod.name}
                  </h1>
                </div>
                {totalStudents > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 w-24 sm:w-32 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-gray-900 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {calledCount}/{totalStudents} called
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {totalStudents > 0 && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  title="Reset cycle"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              )}
              <button
                onClick={() => setShowRoster(true)}
                className="inline-flex items-center gap-1.5 text-sm text-gray-700 px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="hidden sm:inline">Manage Class</span>
                <span className="sm:hidden">Class</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {totalStudents === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-5">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">No students yet</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto text-center">
              Add students to this class to start picking presenters.
            </p>
            <button
              onClick={() => setShowRoster(true)}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Students
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spinner Column */}
            <div className="lg:col-span-2 flex flex-col items-center">
              {/* Cycle Complete Banner */}
              {uncalledStudents.length === 0 && calledStudents.length > 0 && (
                <div className="w-full mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-800 font-medium text-sm">
                    Cycle complete — all {totalStudents} students have been called.
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Auto-resetting momentarily, or{' '}
                    <button
                      onClick={handleResetCycle}
                      className="underline font-medium hover:text-gray-700"
                    >
                      reset now
                    </button>
                    .
                  </p>
                </div>
              )}

              <SpinnerWheel
                names={uncalledNames}
                isSpinning={isSpinning}
                onSpinStart={() => setIsSpinning(true)}
                onSpinComplete={handleSpinComplete}
              />
            </div>

            {/* Lists Column */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{uncalledStudents.length}</p>
                    <p className="text-xs text-gray-500 font-medium">Remaining</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-400">{calledStudents.length}</p>
                    <p className="text-xs text-gray-500 font-medium">Called</p>
                  </div>
                </div>
              </div>

              <StudentList
                title="Uncalled"
                students={uncalledStudents}
                variant="uncalled"
              />
              <StudentList
                title="Called"
                students={calledStudents}
                variant="called"
                onPutBack={handlePutBack}
              />

              {/* Mobile Reset */}
              {totalStudents > 0 && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="sm:hidden w-full flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-100 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Cycle
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <RosterModal
        isOpen={showRoster}
        classPeriod={classPeriod}
        onClose={() => {
          setShowRoster(false);
          loadClass();
        }}
        onAddStudent={handleAddStudent}
        onAddStudentsBulk={handleAddStudentsBulk}
        onRemoveStudent={handleRemoveStudent}
        onUpdateStudentName={handleUpdateStudentName}
        onResetCycle={handleRosterResetCycle}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Cycle"
        message="This will move all students back to the uncalled list. Are you sure?"
        confirmLabel="Reset"
        variant="warning"
        onConfirm={handleResetCycle}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
