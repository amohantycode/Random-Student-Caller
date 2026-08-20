'use client';

import React from 'react';
import type { ClassPeriod } from '@/lib/types';

type ClassCardProps = {
  classPeriod: ClassPeriod;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ClassCard({
  classPeriod,
  onClick,
  onEdit,
  onDelete,
}: ClassCardProps) {
  const totalStudents = classPeriod.students?.length || 0;
  const calledStudents = classPeriod.students?.filter(s => s.called).length || 0;
  const progressPercentage = totalStudents > 0 ? Math.round((calledStudents / totalStudents) * 100) : 0;

  return (
    <div className="group relative w-full overflow-hidden rounded-lg bg-white border border-gray-200 transition-all duration-150 hover:border-gray-300 hover:shadow-sm cursor-pointer">

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="rounded-md bg-white p-1.5 text-gray-400 border border-gray-200 hover:text-gray-600 hover:border-gray-300 focus:outline-none transition-colors"
          title="Edit class"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-md bg-white p-1.5 text-gray-400 border border-gray-200 hover:text-red-500 hover:border-red-200 focus:outline-none transition-colors"
          title="Delete class"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div onClick={onClick} className="p-5 h-full flex flex-col">
        <div className="mb-3">
          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {classPeriod.period}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-1 pr-16 line-clamp-2 leading-snug">
          {classPeriod.name}
        </h3>

        <div className="mt-auto pt-5">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500">Progress</span>
            <span className="text-gray-700 font-medium">{calledStudents} / {totalStudents}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-gray-900 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
