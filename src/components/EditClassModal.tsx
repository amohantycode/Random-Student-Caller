'use client';

import type { ClassPeriod } from '@/lib/types';

type EditClassModalProps = {
  isOpen: boolean;
  classPeriod: ClassPeriod | null;
  onClose: () => void;
  onSave: (id: string, name: string, period: string) => void;
};

export default function EditClassModal({ isOpen, classPeriod, onClose, onSave }: EditClassModalProps) {
  if (!isOpen || !classPeriod) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('className') || '').trim();
    const period = String(form.get('period') || '').trim();
    if (!name || !period) return;
    onSave(classPeriod.id, name, period);
    onClose();
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 cursor-default bg-[var(--ink)]/45 backdrop-blur-sm" onClick={onClose} aria-label="Close dialog" />
      <div role="dialog" aria-modal="true" aria-labelledby="edit-class-title" className="animate-slide-up relative w-full max-w-md overflow-hidden rounded-[18px] bg-white shadow-2xl">
        <div className="px-6 pb-2 pt-6 sm:px-7 sm:pt-7">
          <h2 id="edit-class-title" className="text-2xl font-semibold tracking-tight text-[var(--ink)]">Edit class</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
          <div className="space-y-5">
            <div>
              <label htmlFor="editClassName" className="mb-2 block text-sm font-semibold text-[var(--ink)]">Class name</label>
              <input id="editClassName" name="className" autoFocus type="text" defaultValue={classPeriod.name} className="w-full rounded-xl border border-[var(--line)] bg-[#fafaf8] px-4 py-3 text-sm outline-none transition focus:border-[var(--blue)] focus:bg-white" required />
            </div>
            <div>
              <label htmlFor="editPeriod" className="mb-2 block text-sm font-semibold text-[var(--ink)]">Period or section</label>
              <input id="editPeriod" name="period" type="text" defaultValue={classPeriod.period} className="w-full rounded-xl border border-[var(--line)] bg-[#fafaf8] px-4 py-3 text-sm outline-none transition focus:border-[var(--blue)] focus:bg-white" required />
            </div>
          </div>
          <div className="mt-7 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--muted)] transition hover:bg-[#f4f3ef] hover:text-[var(--ink)]">Cancel</button>
            <button type="submit" className="rounded-full bg-[var(--blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--blue-dark)]">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
