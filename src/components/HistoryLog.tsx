'use client';

import { useEffect, useState } from 'react';
import type { HistoryEntry } from '@/lib/types';
import * as storage from '@/lib/storage';

interface HistoryLogProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  classId: string;
  className: string;
}

function groupByDate(entries: HistoryEntry[]): Map<string, HistoryEntry[]> {
  const groups = new Map<string, HistoryEntry[]>();
  for (const entry of entries) {
    const dateKey = new Date(entry.pickedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)?.push(entry);
  }
  return groups;
}

export default function HistoryLog({ isOpen, onClose, uid, classId, className }: HistoryLogProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    storage.getHistory(uid, classId).then((data) => { setEntries(data); setLoading(false); });
  }, [isOpen, uid, classId]);

  if (!isOpen) return null;
  const grouped = groupByDate(entries);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/45 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[18px] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <h2 id="history-title" className="text-2xl font-semibold tracking-tight text-[var(--ink)]">History</h2>
            <p className="mt-1 truncate text-sm text-[var(--muted)]">{className}</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[#f4f3ef] hover:text-[var(--ink)]" aria-label="Close history">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="custom-scrollbar flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-[var(--muted)]"><span className="h-2 w-2 animate-pulse rounded-full bg-[var(--blue)]" />Loading history…</div>
          ) : entries.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-semibold text-[var(--ink)]">No picks yet</p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Names will appear here after the first spin.</p>
            </div>
          ) : (
            <div>
              {Array.from(grouped.entries()).map(([dateLabel, dateEntries]) => (
                <section key={dateLabel} className="border-b border-[var(--line)] px-5 py-5 last:border-b-0 sm:px-7">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{dateLabel}</h3>
                  <ol className="divide-y divide-[var(--line)]/70">
                    {dateEntries.map((entry) => (
                      <li key={entry.id} className="flex items-center justify-between gap-4 py-2.5">
                        <span className="min-w-0 truncate text-sm font-medium text-[var(--ink)]">{entry.studentName}</span>
                        <time className="shrink-0 text-xs tabular-nums text-[var(--muted)]" dateTime={entry.pickedAt}>
                          {new Date(entry.pickedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </time>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </div>

        <footer className="flex justify-end border-t border-[var(--line)] px-5 py-4 sm:px-7">
          <button onClick={onClose} className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#26324a]">Done</button>
        </footer>
      </div>
    </div>
  );
}
