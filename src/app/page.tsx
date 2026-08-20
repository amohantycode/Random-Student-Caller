'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClassPeriod } from '@/lib/types';
import * as storage from '@/lib/storage';
import ClassCard from '@/components/ClassCard';
import AddClassModal from '@/components/AddClassModal';
import EditClassModal from '@/components/EditClassModal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function Dashboard() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassPeriod[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassPeriod | null>(null);

  const loadClasses = useCallback(() => {
    const loaded = storage.getClasses();
    setClasses(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleAddClass = (name: string, period: string) => {
    storage.addClass(name, period);
    loadClasses();
  };

  const handleEditClass = (id: string, name: string, period: string) => {
    storage.updateClass(id, { name, period });
    loadClasses();
  };

  const handleDeleteClass = () => {
    if (selectedClass) {
      storage.deleteClass(selectedClass.id);
      setShowDeleteConfirm(false);
      setSelectedClass(null);
      loadClasses();
    }
  };

  const handleClassClick = (classPeriod: ClassPeriod) => {
    router.push(`/class/${classPeriod.id}`);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 tracking-tight leading-tight">
                  Mr. McLaughlin&apos;s Classes
                </h1>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Class</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {classes.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-5">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No classes yet</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Get started by adding your first class. You can add students and start
              picking presenters right away.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classPeriod) => (
              <ClassCard
                key={classPeriod.id}
                classPeriod={classPeriod}
                onClick={() => handleClassClick(classPeriod)}
                onEdit={() => {
                  setSelectedClass(classPeriod);
                  setShowEditModal(true);
                }}
                onDelete={() => {
                  setSelectedClass(classPeriod);
                  setShowDeleteConfirm(true);
                }}
              />
            ))}

            {/* Add Class Card */}
            <button
              onClick={() => setShowAddModal(true)}
              className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 p-8 text-gray-400 transition-all hover:border-gray-400 hover:text-gray-500 hover:bg-gray-50 min-h-[180px]"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium text-sm">Add Class</span>
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddClassModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddClass}
      />

      <EditClassModal
        isOpen={showEditModal}
        classPeriod={selectedClass}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClass(null);
        }}
        onSave={handleEditClass}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Class"
        message={`Are you sure you want to delete "${selectedClass?.name}"? This will remove all students and cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteClass}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedClass(null);
        }}
      />
    </div>
  );
}
