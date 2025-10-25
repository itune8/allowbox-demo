'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import {
  getCurrentSchoolId,
  getEntities,
  type Student as StudentType,
  type Invoice as InvoiceType,
} from '../../../../lib/data-store';
import { payInvoiceAction } from '../../../../lib/fees';
import { Button } from '@repo/ui/button';

export default function FeesPage() {
  const { user } = useAuth();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities] = useState(() => getEntities(schoolId));

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

  function categorize(title: string): 'Tuition' | 'Transport' | 'Activities' | 'Other' {
    const t = title.toLowerCase();
    if (t.includes('tuition')) return 'Tuition';
    if (t.includes('transport') || t.includes('bus')) return 'Transport';
    if (t.includes('activity') || t.includes('activities')) return 'Activities';
    return 'Other';
  }

  const categories = ['Tuition', 'Transport', 'Activities', 'Other'] as const;
  const categoryData = categories.map((cat) => {
    const invs = allInvoicesList.filter(({ inv }) => categorize(inv.title) === cat);
    const total = invs.reduce((s, { inv }) => s + inv.amount, 0);
    const collected = invs.filter(({ inv }) => inv.status === 'Paid').reduce((s, { inv }) => s + inv.amount, 0);
    return { cat, total, collected };
  });

  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });

  const monthlyValues = months.map((ym) =>
    allInvoicesList
      .filter(({ inv }) => inv.status === 'Paid' && (inv.paidAt || '').slice(0, 7) === ym)
      .reduce((s, { inv }) => s + inv.amount, 0)
  );

  const maxMonthly = Math.max(1, ...monthlyValues);

  function downloadFeeStatement() {
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
    const rows = allInvoicesList
      .map(
        ({ child, inv }) =>
          `<tr><td>${inv.id}</td><td>${child.name}</td><td>${inv.title}</td><td>${inv.due}</td><td>$${inv.amount}</td><td>${inv.status}${inv.paidAt ? ' (' + inv.paidAt.slice(0, 10) + ')' : ''}</td></tr>`
      )
      .join('');
    const html = `<html><head>${style}</head><body><h1>Fee Statement</h1><table><thead><tr><th>ID</th><th>Child</th><th>Title</th><th>Due</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fees</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View and manage school fees for your children
          </p>
        </div>
        <Button variant="outline" onClick={downloadFeeStatement}>
          Download Fee Statement
        </Button>
      </div>

      {/* Fee Breakdown by Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryData.map(({ cat, total, collected }) => (
          <div
            key={cat}
            className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800"
          >
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{cat}</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ${collected.toLocaleString()} / ${total.toLocaleString()}
            </div>
            <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${total ? Math.round((collected / total) * 100) : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Payments Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Monthly Payments</h3>
        <div className="h-40 flex items-end gap-2">
          {monthlyValues.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400">${v}</div>
              <div
                className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t"
                style={{ height: `${Math.round((v / maxMonthly) * 100)}%` }}
                title={`${months[i]}: $${v}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-6 text-[10px] text-gray-400">
          {months.map((m, i) => (
            <div key={i} className="text-center">
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Due Fees */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upcoming Due Fees</h3>
        {allInvoicesList.filter(({ inv }) => inv.status !== 'Paid').length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">✅</div>
            <p>No upcoming fees. All invoices are paid!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {allInvoicesList
              .filter(({ inv }) => inv.status !== 'Paid')
              .sort((a, b) => a.inv.due.localeCompare(b.inv.due))
              .map(({ child, inv }) => (
                <div
                  key={inv.id}
                  className={`py-4 flex flex-wrap items-center justify-between gap-3 ${
                    new Date(inv.due) < new Date() ? 'text-red-600 dark:text-red-400' : ''
                  }`}
                >
                  <div className="flex-1 min-w-[150px]">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{child.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{inv.title}</div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{inv.due}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">${inv.amount}</div>
                  <Button size="sm" onClick={() => payInvoiceAction(schoolId, child.id, inv.id)}>
                    Pay Now
                  </Button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
