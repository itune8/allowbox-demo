'use client';

import { useEffect, useCallback } from 'react';
import { Portal } from '../portal';
import { X, Download, Send, CheckCircle2 } from 'lucide-react';

interface InvoiceLineItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  schoolName: string;
  schoolId: string;
  address?: string;
  city?: string;
  email?: string;
  plan: string;
  issueDate: string;
  dueDate: string;
  status: string;
  amount: number;
  paidDate?: string;
  paymentMethod?: string;
  studentCount?: number;
}

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
  onDownload?: () => void;
  onSendEmail?: () => void;
}

export function InvoiceDetailsModal({
  isOpen,
  onClose,
  invoice,
  onDownload,
  onSendEmail,
}: InvoiceDetailsModalProps) {
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

  if (!isOpen || !invoice) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Generate line items from invoice data
  const planLabel = (invoice.plan || 'basic').charAt(0).toUpperCase() + (invoice.plan || 'basic').slice(1);
  const baseAmount = invoice.amount * 0.85;
  const additionalUsers = invoice.studentCount && invoice.studentCount > 50 ? Math.floor((invoice.studentCount - 50) / 10) : 0;
  const additionalCost = additionalUsers * 20;
  const subscriptionFee = invoice.amount - additionalCost - 15;

  const lineItems: InvoiceLineItem[] = [
    {
      description: `${planLabel} Plan - Monthly Subscription`,
      qty: 1,
      rate: Math.max(subscriptionFee, invoice.amount * 0.7),
      amount: Math.max(subscriptionFee, invoice.amount * 0.7),
    },
  ];

  if (additionalCost > 0) {
    lineItems.push({
      description: `Additional Storage (${additionalUsers * 5}GB)`,
      qty: 1,
      rate: additionalCost,
      amount: additionalCost,
    });
  }

  if (invoice.amount > 100) {
    lineItems.push({
      description: `SMS Credits (${invoice.studentCount ? Math.floor(invoice.studentCount / 10) * 100 : 1000})`,
      qty: 1,
      rate: 15,
      amount: 15,
    });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const isPaid = invoice.status === 'paid';

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-slate-900/50 z-[9998] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[560px] max-h-[92vh] sm:max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Invoice Details</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Invoice Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#824ef2]/10">
                  <svg className="w-5 h-5 text-[#824ef2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">AllowBox</p>
                  <p className="text-xs text-slate-500">Super Admin</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#824ef2]">{invoice.invoiceNumber}</p>
                <p className="text-xs text-slate-500">Date: {formatDate(invoice.issueDate)}</p>
              </div>
            </div>

            {/* Bill To + Status */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Bill To:</p>
                <p className="text-sm font-semibold text-slate-900">{invoice.schoolName}</p>
                <p className="text-xs text-slate-500">{invoice.address || '123 Education Street'}</p>
                <p className="text-xs text-slate-500">{invoice.city || 'New York, NY 10001'}</p>
                <p className="text-xs text-slate-500">{invoice.email || `contact@${invoice.schoolName.toLowerCase().replace(/\s+/g, '')}.edu`}</p>
              </div>
              <div className="text-right text-xs text-slate-500 space-y-1">
                {isPaid && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Paid
                  </span>
                )}
                <p>Issue Date: {formatDate(invoice.issueDate)}</p>
                <p>Due Date: {formatDate(invoice.dueDate)}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase w-12">QTY</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase w-20">Rate</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase w-24">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.description}</td>
                      <td className="px-3 py-3 text-sm text-slate-600 text-center">{item.qty}</td>
                      <td className="px-3 py-3 text-sm text-slate-600 text-right">{formatCurrency(item.rate)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Tax (8%):</span>
                <span className="font-medium text-slate-900">{formatCurrency(tax)}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-900">Total:</span>
                <span className="text-lg font-bold text-[#824ef2]">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment Info */}
            {isPaid && invoice.paidDate && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-emerald-800 font-medium">Payment received on {formatDate(invoice.paidDate)}</p>
                  <p className="text-emerald-600 text-xs">Payment Method: {invoice.paymentMethod || 'Visa ●●●● 4243'}</p>
                </div>
              </div>
            )}

            {!isPaid && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Terms:</span>
                  <span className="font-medium text-slate-800">Net 30 Days</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-medium text-slate-800">{formatDate(invoice.dueDate)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onSendEmail}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Email
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#824ef2' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7040d9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#824ef2')}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
