'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Portal } from '../portal';
import { X, Download } from 'lucide-react';
import type { School } from '../../lib/services/superadmin/school.service';

interface InvoicePayment {
  invoiceId: string;
  date: string;
  plan: string;
  duration: string;
  users: number;
  revenue: number;
  nextBilling: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
  payment: InvoicePayment | null;
}

export function InvoiceModal({ isOpen, onClose, school, payment }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen || !school || !payment) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const pricePerUser = school.pricePerStudent || 4.5;
  const subscriptionAmount = pricePerUser * payment.users;
  const platformFee = payment.revenue - subscriptionAmount > 0 ? payment.revenue - subscriptionAmount : 11;
  const subtotal = subscriptionAmount + platformFee;
  const tax = 0;
  const total = subtotal + tax;
  const cardLast4 = Math.floor(1000 + Math.random() * 9000);

  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open('', '_blank', 'width=800,height=1100');
    if (!printWindow) {
      alert('Please allow popups to download the invoice PDF.');
      return;
    }

    const invoiceHTML = invoiceRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${payment.invoiceId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1e293b;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 24px;
            border-bottom: 2px solid #e2e8f0;
            margin-bottom: 24px;
          }
          .company-info h1 {
            font-size: 24px;
            font-weight: 700;
            color: #7c3aed;
            margin-bottom: 4px;
          }
          .company-info p {
            font-size: 13px;
            color: #64748b;
            line-height: 1.5;
          }
          .invoice-title {
            text-align: right;
          }
          .invoice-title h2 {
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
          }
          .invoice-title p {
            font-size: 13px;
            color: #64748b;
          }
          .invoice-title strong {
            color: #1e293b;
          }
          .billing-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid #e2e8f0;
          }
          .billing-section h3 {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-bottom: 8px;
          }
          .billing-section p {
            font-size: 13px;
            color: #334155;
            line-height: 1.6;
          }
          .billing-section strong { color: #1e293b; }
          .status-paid {
            display: inline-block;
            padding: 2px 10px;
            background: #dcfce7;
            color: #16a34a;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          thead th {
            text-align: left;
            padding: 10px 16px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            border-bottom: 2px solid #e2e8f0;
          }
          thead th:last-child { text-align: right; }
          tbody td {
            padding: 12px 16px;
            font-size: 13px;
            color: #334155;
            border-bottom: 1px solid #f1f5f9;
          }
          tbody td:last-child { text-align: right; font-weight: 600; }
          .totals {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 32px;
          }
          .totals-table {
            width: 280px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
            color: #64748b;
          }
          .totals-row.total {
            border-top: 2px solid #e2e8f0;
            padding-top: 12px;
            margin-top: 8px;
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
          }
          .footer-note {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            font-size: 12px;
            color: #64748b;
            line-height: 1.6;
          }
          .footer-note strong { color: #334155; }
          @media print {
            body { padding: 20px; }
            @page { margin: 0.5in; }
          }
        </style>
      </head>
      <body>
        ${invoiceHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 z-[10000] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center sm:p-4">
        <div
          className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-[700px] max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Invoice</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Invoice Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
            <div ref={invoiceRef}>
              {/* Invoice Header */}
              <div className="invoice-header flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-5 border-b-2 border-slate-200 mb-5">
                <div className="company-info">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">A</span>
                    </div>
                    <h1 className="text-xl font-bold text-purple-600">AllowBox</h1>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    School Management Platform<br />
                    123 Education Street<br />
                    New York, NY 10001
                  </p>
                </div>
                <div className="invoice-title sm:text-right">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">INVOICE</h2>
                  <p className="text-xs text-slate-500">
                    Invoice #: <strong className="text-slate-900">{payment.invoiceId}</strong>
                  </p>
                  <p className="text-xs text-slate-500">
                    Date: <strong className="text-slate-900">{formatDate(payment.date)}</strong>
                  </p>
                </div>
              </div>

              {/* Billing Section */}
              <div className="billing-section flex flex-col sm:flex-row justify-between gap-4 mb-6 pb-5 border-b border-slate-200">
                <div>
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    BILL TO:
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">{school.schoolName}</strong>
                    <br />
                    {school.address || '456 School Avenue'}
                    <br />
                    {[school.city || 'Springfield', school.state || 'IL', school.postalCode || '62701'].join(', ')}
                    <br />
                    {school.contactEmail}
                  </p>
                </div>
                <div className="sm:text-right">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    PAYMENT DETAILS:
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Payment Method: <strong>Credit Card</strong>
                    <br />
                    Card: <strong>****{cardLast4}</strong>
                    <br />
                    Status: <span className="status-paid inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-xs font-semibold">Paid</span>
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-sm mb-5">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="text-center py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="text-right py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-3 text-slate-700">
                      {payment.plan} Plan – Monthly Subscription
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700">{payment.users}</td>
                    <td className="py-3 px-3 text-center text-slate-700">
                      {formatCurrency(pricePerUser)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {formatCurrency(subscriptionAmount)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 px-3 text-slate-700">Platform Support</td>
                    <td className="py-3 px-3 text-center text-slate-400">–</td>
                    <td className="py-3 px-3 text-center text-slate-400">–</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {formatCurrency(platformFee)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-64">
                  <div className="flex justify-between py-1.5 text-sm text-slate-500">
                    <span>Subtotal:</span>
                    <span className="text-slate-900 font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-sm text-slate-500">
                    <span>Tax (0%):</span>
                    <span className="text-slate-900 font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between pt-3 mt-2 border-t-2 border-slate-200 text-base font-bold text-slate-900">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="footer-note bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-500 leading-relaxed">
                <p>
                  <strong className="text-slate-700">Payment Terms:</strong> Due upon receipt
                </p>
                <p>
                  <strong className="text-slate-700">Next Billing Date:</strong>{' '}
                  {formatDate(payment.nextBilling)}
                </p>
                <p>
                  <strong className="text-slate-700">Note:</strong> Thank you for choosing
                  AllowBox. For any billing inquiries, contact billing@allowbox.com
                </p>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
