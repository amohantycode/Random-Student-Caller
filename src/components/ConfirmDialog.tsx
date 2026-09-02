'use client';


type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
};

export default function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, variant = 'info' }: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmColor = variant === 'danger'
    ? 'bg-[var(--red)] hover:bg-[#ac3f3f]'
    : variant === 'warning'
      ? 'bg-[var(--ink)] hover:bg-[#26324a]'
      : 'bg-[var(--blue)] hover:bg-[var(--blue-dark)]';

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 cursor-default bg-[var(--ink)]/45 backdrop-blur-sm" onClick={onCancel} aria-label="Close dialog" />
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" className="animate-slide-up relative w-full max-w-sm rounded-[18px] bg-white p-6 shadow-2xl sm:p-7">
        <div className={`mb-5 h-1 w-10 rounded-full ${variant === 'danger' ? 'bg-[var(--red)]' : 'bg-[var(--blue)]'}`} />
        <h2 id="confirm-title" className="text-xl font-semibold tracking-tight text-[var(--ink)]">{title}</h2>
        <p id="confirm-message" className="mt-2 text-sm leading-6 text-[var(--muted)]">{message}</p>
        <div className="mt-7 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-full px-4 py-2.5 text-sm font-semibold text-[var(--muted)] transition hover:bg-[#f4f3ef] hover:text-[var(--ink)]">{cancelLabel}</button>
          <button type="button" onClick={onConfirm} className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition ${confirmColor}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
