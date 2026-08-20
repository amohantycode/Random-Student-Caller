'use client';

import React, { useState, useEffect } from 'react';
import type { ClassPeriod } from '@/lib/types';

type EditClassModalProps = {
  isOpen: boolean;
  classPeriod: ClassPeriod | null;
  onClose: () => void;
  onSave: (id: string, name: string, period: string) => void;
};

export default function EditClassModal({
  isOpen,
  classPeriod,
  onClose,
  onSave,
}: EditClassModalProps) {
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('');
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      if (classPeriod) {
        setName(classPeriod.name);
        setPeriod(classPeriod.period);
      }
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, classPeriod]);

  if (!isRendered && !isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && period.trim() && classPeriod) {
      onSave(classPeriod.id, name.trim(), period.trim());
      onClose();
    }
  };

  const isFormValid = name.trim() !== '' && period.trim() !== '';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all duration-200 ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
      >
        <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
          Edit Class
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editClassName" className="block text-sm font-medium text-gray-700 mb-1">
              Class Name
            </label>
            <input
              type="text"
              id="editClassName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AP Computer Science Principles"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
          
          <div>
            <label htmlFor="editPeriod" className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <input
              type="text"
              id="editPeriod"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. 3rd Period"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isFormValid
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-blue-300 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
