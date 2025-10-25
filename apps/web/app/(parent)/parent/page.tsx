'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import { ROLES } from '@repo/config';
import {
  getCurrentSchoolId,
  getEntities,
  setParentChildren,
  setInvoices,
  type Student as StudentType,
  type Invoice as InvoiceType,
} from '../../../lib/data-store';
import { StatCard } from '@/components/dashboard/stat-card';

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities, setEntities] = useState(() => getEntities(schoolId));

  const isParent = (user?.roles || []).includes(ROLES.PARENT) || (user?.roles || []).includes('student');

  // Seed parent-children mapping if empty for mock parent
  useEffect(() => {
    if (!user?.email) return;
    const children = entities.parentChildren[user.email] || [];
    if (children.length === 0 && entities.students.length > 0) {
      const attach = entities.students.slice(0, Math.min(2, entities.students.length)).map((s) => s.id);
      setParentChildren(schoolId, user.email, attach);
      const sid = attach[0];
      if (sid) {
        const now = new Date();
        const invs: InvoiceType[] = [
          {
            id: `inv-${Date.now()}-t1`,
            studentId: sid,
            title: 'Tuition Fee - Term 1',
            amount: 1200,
            due: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().slice(0, 10),
            status: 'Pending',
          },
          {
            id: `inv-${Date.now()}-act`,
            studentId: sid,
            title: 'Activity Fee',
            amount: 150,
            due: new Date(now.getFullYear(), now.getMonth(), 28).toISOString().slice(0, 10),
            status: 'Paid',
            paidAt: new Date(now.getTime() - 86400000 * 30).toISOString(),
          },
        ];
        setInvoices(schoolId, sid, invs);
      }
      setEntities(getEntities(schoolId));
    }
  }, [entities.students, entities.parentChildren, schoolId, user?.email]);

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

  const paidThisMonth = useMemo(() => {
    const ym = new Date().toISOString().slice(0, 7);
    return allInvoicesList
      .filter(({ inv }) => inv.status === 'Paid' && (inv.paidAt || '').slice(0, 7) === ym)
      .reduce((sum, { inv }) => sum + inv.amount, 0);
  }, [allInvoicesList]);

  const pendingCount = useMemo(
    () => allInvoicesList.filter(({ inv }) => inv.status === 'Pending').length,
    [allInvoicesList]
  );

  const feeTotals = useMemo(() => {
    let paid = 0,
      pending = 0;
    for (const { inv } of allInvoicesList) {
      if (inv.status === 'Paid') paid += inv.amount;
      else pending += inv.amount;
    }
    return { paid, pending, total: paid + pending };
  }, [allInvoicesList]);

  if (!isParent) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
          You do not have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user?.firstName}! Here's a summary of your children's activities.
        </p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Children Linked"
          value={myChildren.length}
          icon={
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
          iconBgColor="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <StatCard
          title="Pending Invoices"
          value={pendingCount}
          icon={
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
          }
          iconBgColor="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard
          title="Paid This Month"
          value={`$${paidThisMonth.toLocaleString()}`}
          icon={
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
          }
          iconBgColor="bg-green-50 dark:bg-green-900/20"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => router.push('/parent/children')}
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <svg
              className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Children</span>
          </button>

          <button
            onClick={() => router.push('/parent/fees')}
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
          >
            <svg
              className="w-8 h-8 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path
                fillRule="evenodd"
                d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pay Fees</span>
          </button>

          <button
            onClick={() => router.push('/parent/payments')}
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
          >
            <svg
              className="w-8 h-8 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment History</span>
          </button>

          <button
            onClick={() => router.push('/parent/support')}
            className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
          >
            <svg
              className="w-8 h-8 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Get Support</span>
          </button>
        </div>
      </div>

      {/* Fee Overview */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Fee Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <div className="h-40 flex items-end gap-3">
              <div className="flex-1">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 text-center">Paid</div>
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                  style={{
                    height: `${feeTotals.total ? Math.round((feeTotals.paid / feeTotals.total) * 100) : 0}%`,
                  }}
                  title={`Paid: $${feeTotals.paid.toLocaleString()}`}
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 text-center">Pending</div>
                <div
                  className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t"
                  style={{
                    height: `${feeTotals.total ? Math.round((feeTotals.pending / feeTotals.total) * 100) : 0}%`,
                  }}
                  title={`Pending: $${feeTotals.pending.toLocaleString()}`}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-green-500" /> Paid: ${feeTotals.paid.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> Pending: $
              {feeTotals.pending.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              Total: ${feeTotals.total.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Invoices</h3>
          <button
            onClick={() => router.push('/parent/fees')}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All
          </button>
        </div>
        {myChildren.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">🗂️</div>
            <p>No children linked to your account yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-2">Child Name</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Due Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {allInvoicesList.slice(0, 5).map(({ child, inv }) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    <td className="py-3">{child.name}</td>
                    <td className="py-3">{inv.title}</td>
                    <td className="py-3 font-medium">${inv.amount}</td>
                    <td className="py-3">{inv.due}</td>
                    <td className="py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          inv.status === 'Paid'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : new Date(inv.due) < new Date()
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}
                      >
                        {inv.status === 'Paid' ? 'Paid' : new Date(inv.due) < new Date() ? 'Overdue' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
