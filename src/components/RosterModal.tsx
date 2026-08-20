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

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // Reset confirmation states when modal closes or opens
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
      // Optional: Auto-reset confirmation after a few seconds
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
        className="w-full max-w-2xl bg-amber-50 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog" 
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-100 border-b border-amber-200">
          <div>
            <h2 className="text-xl font-bold text-amber-900">{classPeriod.name} Roster</h2>
            <p className="text-sm text-amber-700 mt-1">
              {students.length} students ({uncalledCount} uncalled, {calledCount} called)
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-amber-700 hover:text-amber-900 hover:bg-amber-200/50 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Add Student Section */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-amber-900">Add Students</h3>
              <button 
                onClick={() => setIsBulkMode(!isBulkMode)}
                className="text-sm text-amber-600 hover:text-amber-800 font-medium"
              >
                {isBulkMode ? 'Switch to Single Add' : 'Switch to Bulk Add'}
              </button>
            </div>

            {!isBulkMode ? (
              <form onSubmit={handleAdd} className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Student name..."
                  className="flex-1 px-4 py-2 bg-amber-50/50 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
                <button 
                  type="submit"
                  disabled={!newName.trim()}
                  className="px-6 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  placeholder="Paste student names here, one per line..."
                  className="w-full px-4 py-3 bg-amber-50/50 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 h-32 resize-y"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handleBulkAdd}
                    disabled={!bulkNames.trim()}
                    className="px-6 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Student List */}
          <div>
            <h3 className="font-semibold text-amber-900 mb-3 px-1">Student List</h3>
            
            {students.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-amber-200">
                <p className="text-amber-600 italic">No students added yet. Add students above to get started!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {students.map((student) => (
                  <li 
                    key={student.id} 
                    className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-amber-100 hover:border-amber-200 group transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Status Dot */}
                      <div 
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${student.called ? 'bg-gray-300' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`}
                        title={student.called ? 'Called' : 'Uncalled'}
                      />
                      
                      {/* Name / Edit Input */}
                      {editingId === student.id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={handleEditSave}
                          onKeyDown={handleEditKeyDown}
                          className="flex-1 px-2 py-1 bg-amber-50 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      ) : (
                        <span 
                          onClick={() => handleEditStart(student)}
                          className={`flex-1 cursor-pointer truncate ${student.called ? 'text-gray-500' : 'text-amber-950 font-medium'}`}
                          title="Click to edit"
                        >
                          {student.name}
                        </span>
                      )}
                    </div>

                    {/* Delete Action */}
                    <div className="flex items-center ml-4">
                      {confirmDeleteId === student.id ? (
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-xs font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors animate-pulse"
                        >
                          Sure?
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                          aria-label="Delete student"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
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
        <div className="p-4 bg-white border-t border-amber-100 flex justify-between items-center">
          <button
            onClick={handleReset}
            disabled={students.length === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              students.length === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : confirmReset
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            {confirmReset ? 'Confirm Reset?' : 'Reset Cycle'}
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
