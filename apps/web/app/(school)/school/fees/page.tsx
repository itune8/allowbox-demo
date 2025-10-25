'use client';

import { useState, useMemo } from 'react';
import { Button } from '@repo/ui/button';

type Invoice = {
  id: string;
  studentId: string;
  title: string;
  amount: number;
  due: string;
  status: 'Pending' | 'Paid';
  paidAt?: string;
};

export default function FeesPage() {
  const [invoicesMap] = useState<Record<string, Invoice[]>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const { pendingFeesTotal, pendingInvoices, paidInvoices } = useMemo(() => {
    const allInvoices = Object.values(invoicesMap).flat();
    const pendingInvoices = allInvoices.filter((i) => i.status === 'Pending');
    const paidInvoices = allInvoices.filter((i) => i.status === 'Paid');
    const pendingFeesTotal = pendingInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    return { pendingFeesTotal, pendingInvoices, paidInvoices };
  }, [invoicesMap]);

  return (
    <section className="animate-slide-in-right">
      {banner && (
        <div className="mb-4 animate-fade-in">
          <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-2 rounded">{banner}</div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Fees & Billing</h2>
        <Button
          size="sm"
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg px-4 py-2 hover:opacity-90 transition-all ease-in-out duration-200 shadow-sm"
        >
          + Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 hover:shadow-md transition-all">
          <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Recent Payments</h3>
          {paidInvoices.length === 0 ? (
            <p className="text-sm text-gray-600">No payments recorded.</p>
          ) : (
            <>
              <ul className="divide-y text-sm">
                {paidInvoices.slice(-6).reverse().map((inv) => (
                  <li key={inv.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          inv.status === 'Paid'
                            ? 'bg-green-500'
                            : inv.status === 'Pending'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                      />
                      <span>{inv.title}</span>
                    </div>
                    <span
                      className={`${
                        inv.status === 'Paid'
                          ? 'text-green-600'
                          : inv.status === 'Pending'
                            ? 'text-amber-500'
                            : 'text-red-500'
                      } font-medium`}
                    >
                      ${inv.amount}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold">
                Total Collected: $
                {paidInvoices.reduce((s, i) => s + (i.status === 'Paid' ? i.amount || 0 : 0), 0).toLocaleString()}
              </div>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 hover:shadow-md transition-all animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Pending Invoices ({pendingInvoices.length})</h3>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <button
                title="CSV"
                className="hover:text-indigo-500"
                onClick={() => {
                  const header = ['Invoice', 'Title', 'Amount', 'Status', 'Due', 'PaidAt'];
                  const rows = pendingInvoices.map((i) => [
                    i.id,
                    i.title,
                    `$${i.amount}`,
                    i.status,
                    i.due,
                    i.paidAt || '',
                  ]);
                  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `fees-report-${new Date().toISOString().slice(0, 10)}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  setBanner('Fees report downloaded');
                  setTimeout(() => setBanner(null), 1200);
                }}
              >
                CSV
              </button>
              <button title="PDF" className="hover:text-red-500" onClick={() => setBanner('PDF export not implemented')}>
                PDF
              </button>
            </div>
          </div>
          {pendingInvoices.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">No pending invoices.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {pendingInvoices.slice(0, 8).map((inv) => (
                <li key={inv.id} className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-gray-100">{inv.id}</span>
                  <span className="text-amber-600 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                    ${inv.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
