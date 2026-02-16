'use client';

import { useEffect, useCallback, useState } from 'react';
import { Portal } from '../portal';
import { X, AlertCircle, CheckCircle2, XCircle, Mail, RefreshCw } from 'lucide-react';
import type { School } from '../../lib/services/superadmin/school.service';

interface ReviewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
  invoiceId?: string;
  paymentStatus: 'pending' | 'rejected' | 'failed';
  onAccept?: (school: School) => void;
  onReject?: (school: School) => void;
  actionLoading?: boolean;
}

export function ReviewPaymentModal({
  isOpen,
  onClose,
  school,
  invoiceId,
  paymentStatus,
  onAccept,
  onReject,
  actionLoading,
}: ReviewPaymentModalProps) {
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
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen || !school) return null;

  const planLabel = (school.subscriptionPlan || 'basic').charAt(0).toUpperCase() + (school.subscriptionPlan || 'basic').slice(1);
  const amount = school.mrr || 0;
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const isPending = paymentStatus === 'pending';
  const isRejected = paymentStatus === 'rejected';
  const isFailed = paymentStatus === 'failed';

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
            <h2 className="text-lg font-bold text-slate-900">
              {isPending ? 'Review Cash Payment' : isRejected ? 'Rejected Payment Details' : 'Failed Payment Details'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Status Banner */}
            {isPending && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Pending Cash Payment Verification</p>
                  <p className="text-xs text-amber-700 mt-0.5">This school has submitted a cash payment. Please verify the payment details before approving.</p>
                </div>
              </div>
            )}
            {isRejected && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Payment Rejected</p>
                  <p className="text-xs text-red-700 mt-0.5">This payment was rejected due to verification issues. Review the details below.</p>
                </div>
              </div>
            )}
            {isFailed && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Payment Failed</p>
                  <p className="text-xs text-red-700 mt-0.5">The payment transaction could not be processed. Review the details below.</p>
                </div>
              </div>
            )}

            {/* School + Payment Details */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2.5">School Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Name:</p>
                    <p className="font-medium text-slate-800">{school.schoolName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ID:</p>
                    <p className="font-medium text-slate-800">{school.tenantId || school._id?.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Contact:</p>
                    <p className="font-medium text-slate-800">{school.contactPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2.5">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Invoice:</p>
                    <p className="font-medium text-slate-800">{invoiceId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Plan:</p>
                    <p className="font-medium text-slate-800">{planLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Amount:</p>
                    <p className="font-medium text-slate-800">{formatCurrency(amount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Payment / Rejection Info */}
            {isPending && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2.5">Cash Payment Information</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-medium text-slate-800">Cash</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Submitted Date:</span>
                    <span className="font-medium text-slate-800">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Receipt Number:</span>
                    <span className="font-medium text-slate-800">CASH-{new Date().getFullYear()}-{String(Math.abs(school._id?.charCodeAt(0) || 1) * 10 + 3).padStart(4, '0')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Payment Notes:</p>
                    <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5">
                      Payment made at school office. Receipt attached and verified by finance department.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(isRejected || isFailed) && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2.5">
                  {isRejected ? 'Rejection Information' : 'Failure Information'}
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{isRejected ? 'Rejected' : 'Failed'} Date:</span>
                    <span className="font-medium text-slate-800">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {isRejected && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Rejected By:</span>
                      <span className="font-medium text-slate-800">Super Admin</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Reason:</p>
                    <p className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5">
                      {isRejected
                        ? 'Payment receipt verification failed. Receipt number does not match bank records. School has been notified to resubmit with correct documentation.'
                        : 'Transaction could not be processed. Payment gateway returned an error. Please ask the school to retry.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
            {isPending && (
              <>
                <button
                  onClick={() => onAccept?.(school)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accept Payment
                </button>
                <button
                  onClick={() => onReject?.(school)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Payment
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            {isRejected && (
              <>
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#824ef2' }}
                >
                  <Mail className="w-4 h-4" />
                  Contact School
                </button>
                <button className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Request Resubmission
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </>
            )}
            {isFailed && (
              <>
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#824ef2' }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Payment
                </button>
                <button className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Mail className="w-4 h-4" />
                  Contact School
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
