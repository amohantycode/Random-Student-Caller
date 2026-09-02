'use client';

import { useState } from 'react';

type AddClassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, period: string) => void;
};

export default function AddClassModal({ isOpen, onClose, onAdd }: AddClassModalProps) {
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  if (!isOpen) return null;

  const closeModal = () => {
    setName('');
    setPeriod('');
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !period.trim()) return;
    onAdd(name.trim(), period.trim());
    closeModal();
  };

  const isFormValid = Boolean(name.trim() && period.trim());

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 cursor-default bg-[var(--ink)]/45 backdrop-blur-sm" onClick={closeModal} aria-label="Close dialog" />
      <div role="dialog" aria-modal="true" aria-labelledby="add-class-title" className="animate-slide-up relative w-full max-w-md overflow-hidden rounded-[18px] bg-white shadow-2xl">
        <div className="px-6 pb-2 pt-6 sm:px-7 sm:pt-7">
          <h2 id="add-class-title" className="text-2xl font-semibold tracking-tight text-[var(--ink)]">Add class</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
          <div className="space-y-5">
            <div>
              <label htmlFor="className" className="mb-2 block text-sm font-semibold text-[var(--ink)]">Class name</label>
              <input id="className" autoFocus type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="AP Computer Science" className="w-full rounded-xl border border-[var(--line)] bg-[#fafaf8] px-4 py-3 text-sm outline-none transition placeholder:text-[#a4a7af] focus:border-[var(--blue)] focus:bg-white" required />
            </div>
            <div>
              <label htmlFor="period" className="mb-2 block text-sm font-semibold text-[var(--ink)]">Period or section</label>
              <input id="period" type="text" value={period} onChange={(event) => setPeriod(event.target.value)} placeholder="3rd period" className="w-full rounded-xl border border-[var(--line)] bg-[#fafaf8] px-4 py-3 text-sm outline-none transition placeholder:text-[#a4a7af] focus:border-[var(--blue)] focus:bg-white" required />
            </div>
          </div>
          <div className="mt-7 flex justify-end gap-2">
            <button type="button" onClick={closeModal} className="rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--muted)] transition hover:bg-[#f4f3ef] hover:text-[var(--ink)]">Cancel</button>
            <button type="submit" disabled={!isFormValid} className="rounded-full bg-[var(--blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--blue-dark)] disabled:cursor-not-allowed disabled:opacity-45">Add class</button>
          </div>
        </form>
      </div>
    </div>
  );
}
