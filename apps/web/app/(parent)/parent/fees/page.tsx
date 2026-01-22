'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/auth-context';
import { Button } from '@repo/ui/button';
import { userService, type User } from '@/lib/services/user.service';
import { feeService, type Invoice } from '@/lib/services/fee.service';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
import {
  DollarSign,
  Receipt,
  FileText,
  Download,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
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
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-yellow-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D bgColor="bg-yellow-500" size="lg">
            <Wallet className="w-6 h-6" />
          </Icon3D>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
            <p className="text-sm text-gray-500">Track fee payments for your children</p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={downloadFeeStatement}
            variant="outline"
            className="shadow-lg shadow-yellow-500/25"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Statement
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <AnimatedStatCard
          title="Total"
          value={`$${stats.total.toLocaleString()}`}
          icon={<FileText className="w-5 h-5 text-gray-600" />}
          iconBgColor="bg-gray-100"
          delay={0}
        />
        <AnimatedStatCard
          title="Paid"
          value={`$${stats.paid.toLocaleString()}`}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
          delay={1}
        />
        <AnimatedStatCard
          title="Pending"
          value={`$${stats.pending.toLocaleString()}`}
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          iconBgColor="bg-yellow-100"
          delay={2}
        />
      </div>

      {/* Payment Trend Chart */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Icon3D bgColor="bg-yellow-500" size="sm">
            <TrendingUp className="w-4 h-4" />
          </Icon3D>
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Trend (Last 6 Months)
          </h3>
        </div>
        <div className="h-40 flex items-end gap-3">
          {months.map((month, i) => (
            <motion.div
              key={month.value}
              className="flex-1 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.div
                className="w-full bg-gray-50 rounded-t transition-all hover:from-yellow-600 hover:to-amber-500"
                initial={{ height: 0 }}
                animate={{
                  height: `${monthlyValues[i] ? (monthlyValues[i]! / maxMonthly) * 100 : 0}%`,
                }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  minHeight: monthlyValues[i] && monthlyValues[i]! > 0 ? '10px' : '0px',
                }}
                title={`${month.label}: $${monthlyValues[i]?.toLocaleString() || 0}`}
                whileHover={{ scale: 1.05 }}
              />
              <div className="text-xs text-gray-500 mt-2">{month.label}</div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Fee Invoices Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <Icon3D bgColor="bg-yellow-500" size="sm">
              <Receipt className="w-4 h-4" />
            </Icon3D>
            <h3 className="text-lg font-semibold text-gray-900">Fee Invoices</h3>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 text-sm rounded-xl transition-all ${
                selectedFilter === 'all'
                  ? 'bg-yellow-100 text-yellow-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFilter('pending')}
              className={`px-4 py-2 text-sm rounded-xl transition-all ${
                selectedFilter === 'pending'
                  ? 'bg-amber-100 text-amber-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFilter('paid')}
              className={`px-4 py-2 text-sm rounded-xl transition-all ${
                selectedFilter === 'paid'
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Paid
            </motion.button>
          </div>
        </div>

        {children.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 text-gray-500"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p>No children linked to your account yet.</p>
          </motion.div>
        ) : filteredInvoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 text-gray-500"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <p>No invoices found for the selected filter.</p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="py-4 px-4 font-semibold text-gray-700">Invoice #</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Child</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Issue Date</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Due Date</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Paid</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Balance</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="py-4 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((inv, index) => {
                  const isOverdue = inv.status !== 'paid' && new Date(inv.dueDate) < new Date();
                  const balance = inv.totalAmount - inv.paidAmount;

                  return (
                    <motion.tr
                      key={inv._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                      className="group transition-all"
                    >
                      <td className="py-4 px-4 font-mono text-xs font-medium text-gray-900">{inv.invoiceNumber}</td>
                      <td className="py-4 px-4 text-gray-900">{getChildName(inv.studentId)}</td>
                      <td className="py-4 px-4 text-gray-600">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-gray-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4 font-semibold text-gray-900">${inv.totalAmount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-green-600 font-medium">${inv.paidAmount.toLocaleString()}</td>
                      <td className="py-4 px-4 font-semibold text-gray-900">${balance.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            inv.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : isOverdue
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {inv.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {inv.status !== 'paid' && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                alert(`Payment integration coming soon for invoice ${inv.invoiceNumber}`);
                              }}
                            >
                              Pay Now
                            </Button>
                          </motion.div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </motion.section>
  );
}
