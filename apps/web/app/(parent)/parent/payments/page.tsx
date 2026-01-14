'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../contexts/auth-context';
import {
  getCurrentSchoolId,
  getEntities,
  type Student as StudentType,
  type Invoice as InvoiceType,
} from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';
import { GlassCard, AnimatedStatCard, Icon3D } from '../../../../components/ui';
import {
  CreditCard,
  Download,
  Receipt,
  TrendingUp,
  CheckCircle,
  DollarSign,
  Calendar,
  X,
  Upload,
} from 'lucide-react';

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
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Icon3D gradient="from-green-500 to-emerald-500" size="lg">
          <CreditCard className="w-6 h-6" />
        </Icon3D>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-500">
            View transactions and download receipts
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <AnimatedStatCard
          title="Paid (Year)"
          value={`$${totalPaidYear.toLocaleString()}`}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
          delay={0}
        />
        <AnimatedStatCard
          title="Pending"
          value={`$${pendingAmt.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-100"
          delay={1}
        />
        <AnimatedStatCard
          title="Success"
          value={`${successRate}%`}
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-100"
          delay={2}
        />
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <Icon3D gradient="from-green-500 to-emerald-500" size="sm">
            <Calendar className="w-4 h-4" />
          </Icon3D>
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-medium text-gray-700">From</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="date"
              className="border border-gray-200 bg-white text-gray-900 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <label className="text-sm font-medium text-gray-700">To</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="date"
              className="border border-gray-200 bg-white text-gray-900 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <motion.select
              whileFocus={{ scale: 1.02 }}
              className="border border-gray-200 bg-white text-gray-900 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Paid' | 'Pending')}
            >
              <option>All</option>
              <option>Paid</option>
              <option>Pending</option>
            </motion.select>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
          </motion.div>
        </div>
      </GlassCard>

      {/* Payments Table */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <Icon3D gradient="from-green-500 to-emerald-500" size="sm">
            <Receipt className="w-4 h-4" />
          </Icon3D>
          <h3 className="text-lg font-semibold text-gray-900">Payment Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80">
              <tr className="text-left">
                <th className="py-4 px-4 font-semibold text-gray-700">Payment ID</th>
                <th className="py-4 px-4 font-semibold text-gray-700">Child</th>
                <th className="py-4 px-4 font-semibold text-gray-700">Description</th>
                <th className="py-4 px-4 font-semibold text-gray-700">Amount</th>
                <th className="py-4 px-4 font-semibold text-gray-700">Date</th>
                <th className="py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="py-4 px-4 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPaid.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <Receipt className="w-8 h-8 text-gray-400" />
                      </div>
                      <p>No payment records found</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                filteredPaid.map(({ child, inv }, index) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
                    className="group transition-all"
                  >
                    <td className="py-4 px-4 font-mono text-xs font-medium text-gray-900">{inv.id}</td>
                    <td className="py-4 px-4 text-gray-900">{child.name}</td>
                    <td className="py-4 px-4 text-gray-600">{inv.title}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">${inv.amount}</td>
                    <td className="py-4 px-4 text-gray-600">{(inv.paidAt || '').slice(0, 10) || '-'}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">
                        Paid
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors flex items-center gap-1.5 font-medium"
                          onClick={() => downloadInvoice(inv, child)}
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1.5 font-medium"
                          onClick={() => setRefundFor({ child, inv })}
                        >
                          Refund
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Refund Modal */}
      <AnimatePresence>
        {refundFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
            onClick={() => setRefundFor(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glass morphism container */}
              <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 overflow-hidden">
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-5 overflow-hidden">
                  {/* Animated background patterns */}
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    initial={{ backgroundPosition: '0% 0%' }}
                    animate={{ backgroundPosition: '100% 100%' }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
                    style={{
                      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                      backgroundSize: '100% 100%',
                    }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ rotate: -10, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                          <Receipt className="w-7 h-7 text-white drop-shadow-md" />
                        </div>
                      </motion.div>
                      <div>
                        <motion.h3
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-xl font-bold text-white drop-shadow-sm"
                        >
                          Request Refund
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-sm text-white/80"
                        >
                          Submit a refund request
                        </motion.p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRefundFor(null)}
                      className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all border border-white/30"
                    >
                      <X className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-100"
                  >
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Invoice:</span>
                        <span className="font-medium text-gray-900">{refundFor.inv.title}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Child:</span>
                        <span className="font-medium text-gray-900">{refundFor.child.name}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span>Amount:</span>
                        <span className="font-bold text-green-600">${refundFor.inv.amount}</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for refund request
                    </label>
                    <textarea
                      className="w-full border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500/50 focus:border-green-300 transition-all resize-none"
                      rows={4}
                      placeholder="Please describe your reason for requesting a refund..."
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supporting documents (optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 text-sm text-gray-600 hover:border-green-400 hover:bg-green-50/50 transition-all cursor-pointer"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Click to upload files</span>
                      </label>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-end gap-3 pt-4 border-t border-gray-100"
                  >
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRefundFor(null)}
                      className="px-6 py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        alert('Refund request submitted');
                        setRefundFor(null);
                      }}
                      className="px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/25"
                    >
                      Submit Request
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
