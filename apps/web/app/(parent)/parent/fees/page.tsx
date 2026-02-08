'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { Button } from '@repo/ui/button';
import { userService, type User } from '@/lib/services/user.service';
import { feeService, type Invoice } from '@/lib/services/fee.service';
import { MinimalCard, StatCard } from '@repo/ui/cards';
import { Badge } from '@repo/ui/data-display';
import {
  DollarSign,
  Receipt,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Wallet,
} from 'lucide-react';

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
      const currentUser = await userService.getUserById(user?.id || '');
      const childrenIds = currentUser.children || [];

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fees & Payments</h1>
          <p className="text-slate-600 mt-1">Track fee payments for your children</p>
        </div>
        <Button
          onClick={downloadFeeStatement}
          variant="outline"
          size="md"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Statement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Fees"
          value={`$${stats.total.toLocaleString()}`}
          subtitle="All Invoices"
          icon={<FileText className="w-5 h-5 text-slate-600" />}
          iconBgColor="bg-slate-100"
        />
        <StatCard
          title="Paid"
          value={`$${stats.paid.toLocaleString()}`}
          subtitle="Completed Payments"
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="Pending"
          value={`$${stats.pending.toLocaleString()}`}
          subtitle="Outstanding Balance"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-100"
        />
      </div>

      {/* Fee Invoices Table */}
      <MinimalCard padding="md">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h3 className="text-lg font-semibold text-slate-900">Fee Invoices</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('pending')}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                selectedFilter === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSelectedFilter('paid')}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                selectedFilter === 'paid'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Paid
            </button>
          </div>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <p>No children linked to your account yet.</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-100 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <p>No invoices found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="py-3 px-4 font-semibold text-slate-700">Invoice #</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Child</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Issue Date</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Due Date</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Amount</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Paid</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Balance</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Status</th>
                  <th className="py-3 px-4 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const isOverdue = inv.status !== 'paid' && new Date(inv.dueDate) < new Date();
                  const balance = inv.totalAmount - inv.paidAmount;

                  return (
                    <tr
                      key={inv._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs font-medium text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 text-slate-900">{getChildName(inv.studentId)}</td>
                      <td className="py-3 px-4 text-slate-600">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">${inv.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-green-600 font-medium">${inv.paidAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">${balance.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            inv.status === 'paid'
                              ? 'success'
                              : isOverdue
                              ? 'error'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {inv.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
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
      </MinimalCard>
    </div>
  );
}
