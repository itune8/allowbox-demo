'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { Button } from '@repo/ui/button';
import { userService, type User } from '@/lib/services/user.service';
import { feeService, type Invoice } from '@/lib/services/fee.service';

export default function FeesPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch current user with populated children field
      const currentUser = await userService.getUserById(user?.id || '');

      // Get children from the user's children array
      const childrenIds = currentUser.children || [];

      // Fetch all children details
      const myChildren: User[] = [];
      if (childrenIds.length > 0) {
        const allUsers = await userService.getUsers();
        childrenIds.forEach(childId => {
          const child = allUsers.find(u =>
            (u.id || u._id) === (typeof childId === 'string' ? childId : childId.toString())
          );
          if (child) {
            myChildren.push(child);
          }
        });
      }
      setChildren(myChildren);

      const allInvoices: Invoice[] = [];
      for (const child of myChildren) {
        const childInvoices = await feeService.getInvoices({ studentId: child.id || child._id });
        allInvoices.push(...childInvoices);
      }
      setInvoices(allInvoices);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    let filtered = invoices;
    if (selectedFilter === 'pending') {
      filtered = invoices.filter(inv => inv.status !== 'paid');
    } else if (selectedFilter === 'paid') {
      filtered = invoices.filter(inv => inv.status === 'paid');
    }
    return filtered;
  }, [invoices, selectedFilter]);

  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pending = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

    return { total, paid, pending };
  }, [invoices]);

  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      value: d.toISOString().slice(0, 7),
    };
  });

  const monthlyValues = months.map(({ value: ym }) =>
    invoices
      .filter(inv =>
        inv.status === 'paid' &&
        inv.paidDate &&
        inv.paidDate.slice(0, 7) === ym
      )
      .reduce((s, inv) => s + inv.paidAmount, 0)
  );

  const maxMonthly = Math.max(1, ...monthlyValues);

  const getChildName = (studentId: string) => {
    const child = children.find(c => (c.id || c._id) === studentId);
    return child ? `${child.firstName} ${child.lastName}` : 'Unknown';
  };

  const downloadFeeStatement = () => {
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
    const rows = filteredInvoices
      .map(
        (inv) =>
          `<tr><td>${inv.invoiceNumber}</td><td>${getChildName(inv.studentId)}</td><td>${new Date(inv.issueDate).toLocaleDateString()}</td><td>${new Date(inv.dueDate).toLocaleDateString()}</td><td>$${inv.totalAmount}</td><td>${inv.status}${inv.paidDate ? ' (' + new Date(inv.paidDate).toLocaleDateString() + ')' : ''}</td></tr>`
      )
      .join('');
    const html = `<html><head>${style}</head><body><h1>Fee Statement - ${user?.firstName} ${user?.lastName}</h1><table><thead><tr><th>Invoice #</th><th>Child</th><th>Issue Date</th><th>Due Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    w.document.write(html);
    w.document.close();
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <div className="text-gray-500">Loading fees...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Fees</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage and track fee payments for your children
          </p>
        </div>
        <Button onClick={downloadFeeStatement} variant="outline">
          Download Statement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Fees</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${stats.total.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paid</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${stats.paid.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            ${stats.pending.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Payment Trend Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Payment Trend (Last 6 Months)
        </h3>
        <div className="h-40 flex items-end gap-3">
          {months.map((month, i) => (
            <div key={month.value} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t transition-all hover:from-indigo-600 hover:to-indigo-500"
                style={{
                  height: `${monthlyValues[i] ? (monthlyValues[i]! / maxMonthly) * 100 : 0}%`,
                  minHeight: monthlyValues[i] && monthlyValues[i]! > 0 ? '10px' : '0px',
                }}
                title={`${month.label}: $${monthlyValues[i]?.toLocaleString() || 0}`}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{month.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Invoices Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fee Invoices</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 text-sm rounded ${
                selectedFilter === 'all'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('pending')}
              className={`px-3 py-1 text-sm rounded ${
                selectedFilter === 'pending'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedFilter('paid')}
              className={`px-3 py-1 text-sm rounded ${
                selectedFilter === 'paid'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              Paid
            </button>
          </div>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p>No children linked to your account yet.</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">💳</div>
            <p>No invoices found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-2">Invoice #</th>
                  <th className="py-2">Child</th>
                  <th className="py-2">Issue Date</th>
                  <th className="py-2">Due Date</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Paid</th>
                  <th className="py-2">Balance</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredInvoices.map((inv) => {
                  const isOverdue = inv.status !== 'paid' && new Date(inv.dueDate) < new Date();
                  const balance = inv.totalAmount - inv.paidAmount;

                  return (
                    <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                      <td className="py-3 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="py-3">{getChildName(inv.studentId)}</td>
                      <td className="py-3">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="py-3">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 font-medium">${inv.totalAmount.toLocaleString()}</td>
                      <td className="py-3 text-green-600 dark:text-green-400">${inv.paidAmount.toLocaleString()}</td>
                      <td className="py-3 font-medium">${balance.toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            inv.status === 'paid'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : isOverdue
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}
                        >
                          {inv.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : inv.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {inv.status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              alert(`Payment integration coming soon for invoice ${inv.invoiceNumber}`);
                            }}
                          >
                            Pay Now
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
