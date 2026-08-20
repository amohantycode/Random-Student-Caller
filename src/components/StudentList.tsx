'use client';

import React from 'react';
import { Student } from '@/lib/types';

interface StudentListProps {
  title: string;
  students: Student[];
  variant: 'uncalled' | 'called';
  onPutBack?: (studentId: string) => void;
}

export default function StudentList({ title, students, variant, onPutBack }: StudentListProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const sortedStudents = [...students].sort((a, b) => {
    if (variant === 'called' && a.calledAt && b.calledAt) {
      return new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime();
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${variant === 'uncalled' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          <h3 className="font-medium text-sm text-gray-700">{title}</h3>
          <span className="text-gray-400 text-xs font-medium">
            {students.length}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Student List */}
      {!isCollapsed && (
        <div className="border-t border-gray-100 max-h-64 overflow-y-auto custom-scrollbar">
          {sortedStudents.length === 0 ? (
            <p className="px-4 py-5 text-center text-xs text-gray-400">
              {variant === 'uncalled' ? 'Everyone has been called' : 'No one called yet'}
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {sortedStudents.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${variant === 'uncalled' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700 truncate">{student.name}</span>
                  </div>
                  {variant === 'called' && onPutBack && (
                    <button
                      onClick={() => onPutBack(student.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 flex-shrink-0 ml-2"
                      title="Put back (e.g., student was absent)"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
                      </svg>
                      Put Back
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
