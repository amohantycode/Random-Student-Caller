'use client';

import React, { useEffect, useState } from 'react';
import { HistoryEntry } from '@/lib/types';
import * as storage from '@/lib/storage';

interface HistoryLogProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  classId: string;
  className: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (diffDays === 0) return `Today at ${time}`;
  if (diffDays === 1) return `Yesterday at ${time}`;
  if (diffDays < 7) {
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    return `${day} at ${time}`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ` at ${time}`;
}

// Group entries by date
function groupByDate(entries: HistoryEntry[]): Map<string, HistoryEntry[]> {
  const groups = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const dateKey = new Date(entry.pickedAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(entry);
  }
  return groups;
}

export default function HistoryLog({ isOpen, onClose, uid, classId, className }: HistoryLogProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      storage.getHistory(uid, classId).then((data) => {
        setEntries(data);
        setLoading(false);
      });
    }
  }, [isOpen, uid, classId]);

  if (!isOpen) return null;

  const grouped = groupByDate(entries);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Presentation History</h2>
            <p className="text-sm text-gray-500 mt-0.5">{className}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-400 animate-pulse">Loading history...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-sm text-gray-500 font-medium">No presentations yet</p>
              <p className="text-xs text-gray-400 mt-1">History will appear here after you spin the wheel.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {Array.from(grouped.entries()).map(([dateLabel, dateEntries]) => (
                <div key={dateLabel} className="px-6 py-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                    {dateLabel}
                  </p>
                  <ul className="space-y-2">
                    {dateEntries.map((entry) => (
                      <li key={entry.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-800 font-medium">{entry.studentName}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.pickedAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
