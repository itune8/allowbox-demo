'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import {
  getCurrentSchoolId,
  getEntities,
  type Student as StudentType,
  type Invoice as InvoiceType,
} from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';

export default function PaymentsPage() {
  const { user } = useAuth();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities] = useState(() => getEntities(schoolId));
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [refundFor, setRefundFor] = useState<null | { child: StudentType; inv: InvoiceType }>(null);

  const myChildren: StudentType[] = useMemo(() => {
    if (!user?.email) return [];
    const ids = entities.parentChildren[user.email] || [];
    const map = new Map(entities.students.map((s) => [s.id, s] as const));
    return ids.map((id) => map.get(id)).filter(Boolean) as StudentType[];
  }, [entities.parentChildren, entities.students, user?.email]);

  const invoicesByChild: Record<string, InvoiceType[]> = useMemo(() => {
    const out: Record<string, InvoiceType[]> = {};
    for (const c of myChildren) {
      out[c.id] = entities.invoices[c.id] || [];
    }
    return out;
  }, [entities.invoices, myChildren]);

  const allInvoicesList = useMemo(
    () => myChildren.flatMap((c) => (invoicesByChild[c.id] || []).map((inv) => ({ child: c, inv }))),
    [invoicesByChild, myChildren]
  );

  const paid = allInvoicesList.filter(({ inv }) => inv.status === 'Paid');
  const pending = allInvoicesList.filter(({ inv }) => inv.status !== 'Paid');
  const totalPaidYear = paid
    .filter(({ inv }) => (inv.paidAt || '').slice(0, 4) === new Date().toISOString().slice(0, 4))
    .reduce((s, { inv }) => s + inv.amount, 0);
  const pendingAmt = pending.reduce((s, { inv }) => s + inv.amount, 0);
  const successRate = Math.round((paid.length / (paid.length + pending.length || 1)) * 100);

  const filteredPaid = paid.filter(() => {
    if (statusFilter === 'Paid' || statusFilter === 'All') return true;
    return false;
  }).filter(({ inv }) => {
    if (from && (inv.paidAt || '').slice(0, 10) < from) return false;
    if (to && (inv.paidAt || '').slice(0, 10) > to) return false;
    return true;
  });

  function downloadInvoice(inv: InvoiceType, child: StudentType) {
    const w = window.open('', '_blank');
    if (!w) return;
    const style = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 16px; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #f3f4f6; }
      </style>`;
    const html = `
      <html><head>${style}</head><body>
        <h1>Invoice Receipt</h1>
        <div>Child: ${child.name}</div>
        <div>Invoice: ${inv.title}</div>
        <div>Due: ${inv.due}</div>
        <div>Amount: $${inv.amount}</div>
      </body></html>`;
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Payment History</h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          View transactions and download receipts
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-5">
          <div className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-300">Paid (Year)</div>
          <div className="text-lg sm:text-3xl font-bold text-green-900 dark:text-green-200 mt-1 sm:mt-2 truncate">
            ${totalPaidYear.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 sm:p-5">
          <div className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300">Pending</div>
          <div className="text-lg sm:text-3xl font-bold text-amber-900 dark:text-amber-200 mt-1 sm:mt-2 truncate">
            ${pendingAmt.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-5">
          <div className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300">Success</div>
          <div className="text-lg sm:text-3xl font-bold text-blue-900 dark:text-blue-200 mt-1 sm:mt-2">{successRate}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm text-gray-700 dark:text-gray-300">From</label>
            <input
              type="date"
              className="border border-gray-300 bg-white text-gray-900 rounded px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">To</label>
            <input
              type="date"
              className="border border-gray-300 bg-white text-gray-900 rounded px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <select
              className="border border-gray-300 bg-white text-gray-900 rounded px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Paid' | 'Pending')}
            >
              <option>All</option>
              <option>Paid</option>
              <option>Pending</option>
            </select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFrom('');
              setTo('');
              setStatusFilter('All');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Child</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredPaid.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No payment records found
                  </td>
                </tr>
              ) : (
                filteredPaid.map(({ child, inv }) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    <td className="py-3 px-4 font-mono text-xs">{inv.id}</td>
                    <td className="py-3 px-4">{child.name}</td>
                    <td className="py-3 px-4">{inv.title}</td>
                    <td className="py-3 px-4 font-semibold">${inv.amount}</td>
                    <td className="py-3 px-4">{(inv.paidAt || '').slice(0, 10) || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Paid
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          onClick={() => downloadInvoice(inv, child)}
                        >
                          Download
                        </button>
                        <button
                          className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          onClick={() => setRefundFor({ child, inv })}
                        >
                          Refund
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {refundFor && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRefundFor(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Request Refund</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {refundFor.inv.title} — {refundFor.child.name} — ${refundFor.inv.amount}
            </div>
            <textarea
              className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              rows={4}
              placeholder="Reason for refund request"
            />
            <div className="mt-2">
              <input type="file" className="text-sm" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRefundFor(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  alert('Refund request submitted');
                  setRefundFor(null);
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
