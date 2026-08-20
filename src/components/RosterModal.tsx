'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Student, ClassPeriod } from '@/lib/types';

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

export default function RosterModal({
  isOpen,
  classPeriod,
  onClose,
  onAddStudent,
  onAddStudentsBulk,
  onRemoveStudent,
  onUpdateStudentName,
  onResetCycle,
}: RosterModalProps) {
  const [newName, setNewName] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkNames, setBulkNames] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  useEffect(() => {
    if (!isOpen) {
      setConfirmDeleteId(null);
      setConfirmReset(false);
      setIsBulkMode(false);
      setNewName('');
      setBulkNames('');
      setEditingId(null);
    }
  }, [isOpen]);

  if (!isOpen || !classPeriod) return null;

  const students = classPeriod.students;
  const uncalledCount = students.filter(s => !s.called).length;
  const calledCount = students.length - uncalledCount;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddStudent(newName.trim());
      setNewName('');
    }
  };

  const handleBulkAdd = () => {
    const names = bulkNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (names.length > 0) {
      onAddStudentsBulk(names);
      setBulkNames('');
      setIsBulkMode(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onRemoveStudent(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => {
        setConfirmDeleteId((current) => current === id ? null : current);
      }, 3000);
    }
  };

  const handleEditStart = (student: Student) => {
    setEditingId(student.id);
    setEditName(student.name);
  };

  const handleEditSave = () => {
    if (editingId && editName.trim()) {
      onUpdateStudentName(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleReset = () => {
    if (confirmReset) {
      onResetCycle();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm sm:p-6">
      <div 
        className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog" 
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{classPeriod.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {students.length} students · {uncalledCount} uncalled · {calledCount} called
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Add Student Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-sm text-gray-700">Add Students</h3>
              <button 
                onClick={() => setIsBulkMode(!isBulkMode)}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                {isBulkMode ? 'Single add' : 'Bulk add'}
              </button>
            </div>

            {!isBulkMode ? (
              <form onSubmit={handleAdd} className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Student name..."
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                />
                <button 
                  type="submit"
                  disabled={!newName.trim()}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  placeholder="Paste names here, one per line..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 h-28 resize-y"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handleBulkAdd}
                    disabled={!bulkNames.trim()}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Add All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Student List */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2 px-1">Students</h3>
            
            {students.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">No students added yet. Add students above to get started.</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {students.map((student) => (
                  <li 
                    key={student.id} 
                    className="flex items-center justify-between p-2.5 bg-gray-50 rounded-md hover:bg-gray-100 group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div 
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${student.called ? 'bg-gray-300' : 'bg-emerald-500'}`}
                        title={student.called ? 'Called' : 'Uncalled'}
                      />
                      
                      {editingId === student.id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={handleEditSave}
                          onKeyDown={handleEditKeyDown}
                          className="flex-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                      ) : (
                        <span 
                          onClick={() => handleEditStart(student)}
                          className={`flex-1 cursor-pointer truncate text-sm ${student.called ? 'text-gray-400' : 'text-gray-700'}`}
                          title="Click to edit"
                        >
                          {student.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center ml-3">
                      {confirmDeleteId === student.id ? (
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-xs font-medium text-white bg-red-500 px-2.5 py-1 rounded hover:bg-red-600 transition-colors"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-1 text-gray-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                          aria-label="Delete student"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handleReset}
            disabled={students.length === 0}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              students.length === 0 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : confirmReset
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {confirmReset ? 'Confirm Reset?' : 'Reset Cycle'}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
