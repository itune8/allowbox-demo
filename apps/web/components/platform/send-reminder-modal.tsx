'use client';

import { useEffect, useCallback, useState } from 'react';
import { Portal } from '../portal';
import { X, AlertTriangle } from 'lucide-react';

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  overdueCount: number;
  pendingCount: number;
  overdueAmount: number;
  schools?: { id: string; name: string }[];
  onSend?: (data: {
    target: 'overdue' | 'pending' | 'specific';
    message: string;
    autoFollowUp: boolean;
    selectedSchools?: string[];
  }) => void;
}

const DEFAULT_MESSAGE = `This is a friendly reminder that your payment is overdue. Please clear your pending dues at your earliest convenience to avoid service disruption.

Thank you for your cooperation.`;

export function SendReminderModal({
  isOpen,
  onClose,
  overdueCount,
  pendingCount,
  overdueAmount,
  schools = [],
  onSend,
}: SendReminderModalProps) {
  const [target, setTarget] = useState<'overdue' | 'pending' | 'specific'>('overdue');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [autoFollowUp, setAutoFollowUp] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Reset form
      setTarget('overdue');
      setMessage(DEFAULT_MESSAGE);
      setAutoFollowUp(false);
      setSelectedSchools([]);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const targetCount = target === 'overdue' ? overdueCount : target === 'pending' ? pendingCount : selectedSchools.length;

  const handleSend = async () => {
    setSending(true);
    await onSend?.({
      target,
      message,
      autoFollowUp,
      selectedSchools: target === 'specific' ? selectedSchools : undefined,
    });
    setSending(false);
    onClose();
  };

  const toggleSchool = (id: string) => {
    setSelectedSchools(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[520px] max-h-[92vh] sm:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Send Reminder To</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Radio Options */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  checked={target === 'overdue'}
                  onChange={() => setTarget('overdue')}
                  className="w-4 h-4 text-[#824ef2] focus:ring-[#824ef2]"
                />
                <span className="text-sm text-slate-800">
                  All Overdue Schools ({overdueCount})
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  checked={target === 'pending'}
                  onChange={() => setTarget('pending')}
                  className="w-4 h-4 text-[#824ef2] focus:ring-[#824ef2]"
                />
                <span className="text-sm text-slate-800">
                  All Pending Payments ({pendingCount})
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  checked={target === 'specific'}
                  onChange={() => setTarget('specific')}
                  className="w-4 h-4 text-[#824ef2] focus:ring-[#824ef2]"
                />
                <span className="text-sm text-slate-800">Select Specific Schools</span>
              </label>
            </div>

            {/* Specific Schools Selection */}
            {target === 'specific' && schools.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-4 max-h-[160px] overflow-y-auto space-y-2">
                {schools.map(school => (
                  <label key={school.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSchools.includes(school.id)}
                      onChange={() => toggleSchool(school.id)}
                      className="w-4 h-4 rounded text-[#824ef2] focus:ring-[#824ef2]"
                    />
                    <span className="text-sm text-slate-700">{school.name}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Reminder Message */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2 underline decoration-slate-300 underline-offset-4">
                Reminder Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 resize-y focus:outline-none focus:ring-2 focus:ring-[#824ef2]/20 focus:border-[#824ef2]"
              />
            </div>

            {/* Auto Follow-up */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoFollowUp}
                onChange={(e) => setAutoFollowUp(e.target.checked)}
                className="w-4 h-4 rounded text-[#824ef2] focus:ring-[#824ef2]"
              />
              <span className="text-sm text-slate-700">Send automated follow-up reminder after 3 days</span>
            </label>

            {/* Reminder Summary */}
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-800">Reminder Summary</p>
                <p className="text-xs text-orange-700 mt-0.5">
                  Total overdue amount: {formatCurrency(overdueAmount)} | Schools: {targetCount}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || (target === 'specific' && selectedSchools.length === 0)}
              className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Reminder'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
