'use client';

import { useEffect, useCallback } from 'react';
import { Portal } from '../portal';
import { X, Download, Printer, CheckCircle2 } from 'lucide-react';

interface PaymentReceiptData {
  receiptNumber: string;
  schoolName: string;
  schoolId: string;
  paymentDate: string;
  paymentMethod: string;
  plan: string;
  billingPeriod: string;
  amount: number;
}

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PaymentReceiptData | null;
  onDownload?: () => void;
  onPrint?: () => void;
}

export function PaymentReceiptModal({
  isOpen,
  onClose,
  receipt,
  onDownload,
  onPrint,
}: PaymentReceiptModalProps) {
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

  if (!isOpen || !receipt) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Portal>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal container */}
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-900">Payment Receipt</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Success Icon */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Payment Successful</h3>
              <p className="text-sm text-slate-500 mt-1">Receipt #{receipt.receiptNumber}</p>
            </div>

            {/* Receipt Details */}
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
              {/* School Info */}
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">School Name</p>
                  <p className="text-sm font-semibold text-slate-900">{receipt.schoolName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">School ID</p>
                  <p className="text-sm font-semibold text-slate-900">{receipt.schoolId}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Payment Date</p>
                  <p className="text-sm font-semibold text-slate-900">{formatDate(receipt.paymentDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Payment Method</p>
                  <p className="text-sm font-semibold text-slate-900">{receipt.paymentMethod}</p>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Subscription Plan</span>
                  <span className="font-medium text-slate-900">{receipt.plan}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Billing Period</span>
                  <span className="font-medium text-slate-900">{receipt.billingPeriod}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-medium text-slate-900">{formatCurrency(receipt.amount)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Total Paid</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(receipt.amount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-3 px-6 py-4 border-t border-slate-200 flex-shrink-0">
            <button
              onClick={onDownload}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onPrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
