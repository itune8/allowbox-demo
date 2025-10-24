'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ProtectedRoute } from '../../../components/protected-route';
import { useAuth } from '../../../contexts/auth-context';
import { Button } from '@repo/ui/button';
import { ROLES } from '@repo/config';
import {
  getCurrentSchoolId,
  getEntities,
  setParentChildren,
  setInvoices,
  getSchools,
  setCurrentSchoolId,
  type Student as StudentType,
  type Invoice as InvoiceType,
  getSupportTickets,
  upsertSupportTicket,
  deleteSupportTicket,
} from '../../../lib/data-store';
import { payInvoiceAction } from '../../../lib/fees';

type Section = 'dashboard' | 'children' | 'fees' | 'payments' | 'support';

export default function ParentDashboardPage() {
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [active, setActive] = useState<Section>('dashboard');
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities, setEntities] = useState(() => getEntities(schoolId));
  const isParent = (user?.roles || []).includes(ROLES.PARENT) || (user?.roles || []).includes('student');

  // Removed storeSubscribe - no longer using live updates from data-store
  // Data will be fetched from real API instead

  // Seed parent-children mapping if empty for mock parent
  useEffect(() => {
    if (!user?.email) return;
    const children = entities.parentChildren[user.email] || [];
    if (children.length === 0 && entities.students.length > 0) {
      // Attach up to 2 students as mock children
      const attach = entities.students.slice(0, Math.min(2, entities.students.length)).map((s) => s.id);
      setParentChildren(schoolId, user.email, attach);
      // seed sample invoices for first child
      const sid = attach[0];
      if (sid) {
        const now = new Date();
        const invs: InvoiceType[] = [
          { id: `inv-${Date.now()}-t1`, studentId: sid, title: 'Tuition Fee - Term 1', amount: 1200, due: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString().slice(0,10), status: 'Pending' },
          { id: `inv-${Date.now()}-act`, studentId: sid, title: 'Activity Fee', amount: 150, due: new Date(now.getFullYear(), now.getMonth(), 28).toISOString().slice(0,10), status: 'Paid', paidAt: new Date(now.getTime()-86400000*30).toISOString() },
        ];
        setInvoices(schoolId, sid, invs);
      }
      setEntities(getEntities(schoolId));
    }
  }, [entities.students, entities.parentChildren, schoolId, user?.email]);

  // profile menu outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

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

  // Child details modal
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const selectedChild = useMemo(() => myChildren.find((c)=>c.id===selectedChildId) || null, [myChildren, selectedChildId]);
  const selectedChildClassId = useMemo(() => {
    if (!selectedChild) return '';
    return entities.classes.find((c)=>c.name===selectedChild.className)?.id || '';
  }, [entities.classes, selectedChild]);
  const recentDates = useMemo(() => {
    const days = 7; const arr: string[] = []; const d = new Date();
    for (let i=0;i<days;i++){ const dd = new Date(d.getTime()-86400000*i); arr.push(dd.toISOString().slice(0,10)); }
    return arr.reverse();
  }, []);
  const attendanceRows = useMemo(() => {
    if (!selectedChild) return [] as {date:string; present:boolean}[];
    return recentDates.map((dt) => ({
      date: dt,
      present: Boolean(entities.attendance[dt]?.[selectedChildClassId]?.[selectedChild.id]),
    }));
  }, [entities.attendance, selectedChild, selectedChildClassId, recentDates]);
  const selectedHomework = useMemo(() => {
    if (!selectedChildClassId) return [] as InvoiceType[];
    return entities.homework[selectedChildClassId] || [];
  }, [entities.homework, selectedChildClassId]);

  // Derived aggregates
  const allInvoicesList = useMemo(() => myChildren.flatMap((c) => (invoicesByChild[c.id] || []).map((inv) => ({ child: c, inv }))), [invoicesByChild, myChildren]);
  const paidThisMonth = useMemo(() => {
    const ym = new Date().toISOString().slice(0, 7);
    return allInvoicesList.filter(({ inv }) => inv.status === 'Paid' && (inv.paidAt || '').slice(0, 7) === ym).reduce((sum, { inv }) => sum + inv.amount, 0);
  }, [allInvoicesList]);
  const pendingCount = useMemo(() => allInvoicesList.filter(({ inv }) => inv.status === 'Pending').length, [allInvoicesList]);
  const feeTotals = useMemo(() => {
    let paid = 0, pending = 0;
    for (const { inv } of allInvoicesList) {
      if (inv.status === 'Paid') paid += inv.amount; else pending += inv.amount;
    }
    return { paid, pending, total: paid + pending };
  }, [allInvoicesList]);

  // Support tickets local state for Parent view
  const [tickets] = useState(() => getSupportTickets());
  // Removed storeSubscribe - tickets will be fetched from API instead

  // Navbar state
  const [showNotif, setShowNotif] = useState(false);
  const [showLink, setShowLink] = useState(false);

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-opacity duration-300 ease-in-out">
        {/* Clean background - no gradients */}
        
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex md:flex-col sticky top-0 h-screen shadow-sm animate-slide-in-left">
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Parent Portal</span>
          </div>
          <nav className="flex-1 py-4 overflow-auto">
            {([
              ['dashboard','Dashboard', (<span key="dash"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 13h8V3H3z"/><path d="M13 21h8V3h-8z"/><path d="M3 21h8v-6H3z"/></svg></span>)],
              ['children','Children', (<span key="children"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>)],
              ['fees','Fees', (<span key="fees"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg></span>)],
              ['payments','Payments', (<span key="payments"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></svg></span>)],
              ['support','Support', (<span key="support"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9 9h.01"/><path d="M15 9h.01"/><path d="M8 13a4 4 0 0 0 8 0"/></svg></span>)]
            ] as [Section,string,React.ReactNode][]).map(([key,label,icon]) => (
              <button key={key} onClick={() => setActive(key)} className={`group w-full text-left px-6 py-3 rounded-r-xl border-l-4 transition-all ease-in-out duration-300 transform flex items-center gap-3 ${
                active===key? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold border-gray-900 dark:border-gray-100' : 'text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900 hover:border-gray-900 dark:hover:border-gray-100 hover:pl-7 hover:-translate-y-0.5'
              }`}>
                <span className="text-gray-500 dark:text-gray-400 group-hover:text-white dark:group-hover:text-gray-900">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="outline" size="sm" onClick={logout} className="w-full">Logout</Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Parent Dashboard</h1>
              <div className="relative flex items-center gap-2" ref={profileRef}>
                {/* Notifications */}
                <button className="h-8 w-8 rounded-full grid place-items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={()=>setShowNotif((s)=>!s)} title="Notifications">🔔</button>
                {showNotif && (
                  <div className="absolute right-0 top-12 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-md p-3 space-y-2 animate-slide-in-bottom">
                    <div className="text-xs text-gray-500">Latest updates</div>
                    <div className="text-sm">📄 Your invoice receipt is ready.</div>
                    <div className="text-sm">💬 Support replied to your ticket.</div>
                  </div>
                )}
                <button className="flex items-center gap-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors px-2 py-1" onClick={() => setShowProfileMenu((s) => !s)}>
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-gray-100 font-semibold">{user?.firstName?.[0] ?? 'P'}</div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{user?.firstName} {user?.lastName}</div>
                    <div className="text-[10px] text-gray-500">Parent</div>
                  </div>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-md animate-slide-in-bottom">
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 transition-colors">View Profile</button>
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 transition-colors">Settings</button>
                    <div className="h-px bg-gray-200 dark:bg-gray-800" />
                    <button className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 transition-colors" onClick={logout}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {!isParent ? (
            <div className="p-6"><div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">You do not have permission to view this page.</div></div>
          ) : (
            <main className=" mx-auto w-full p-4 sm:p-6 lg:p-8">
              {/* Dashboard */}
              {active === 'dashboard' && (
                <section className="animate-slide-in-top">
                  {/* Metric cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    <MetricCard icon="users" title="Children" value={myChildren.length} trend="2 new linked" />
                    <MetricCard icon="card" title="Pending Invoices" value={pendingCount} trend="+2 cleared this month" />
                    <MetricCard icon="wallet" title="Paid This Month" value={`$${paidThisMonth}`} trend="On track" />
                  </div>

                  {/* Fee Overview */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 animate-fade-in mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fee Overview</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="md:col-span-2">
                        <div className="h-40 flex items-end gap-3">
                          {/* Paid bar */}
                          <div className="flex-1">
                            <div className="w-full bg-green-500 rounded-t" style={{ height: `${feeTotals.total? Math.round((feeTotals.paid/feeTotals.total)*100):0}%` }} title={`Paid: $${feeTotals.paid.toLocaleString()}`} />
                          </div>
                          {/* Pending bar */}
                          <div className="flex-1">
                            <div className="w-full bg-amber-500 rounded-t" style={{ height: `${feeTotals.total? Math.round((feeTotals.pending/feeTotals.total)*100):0}%` }} title={`Pending: $${feeTotals.pending.toLocaleString()}`} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-green-500" /> Paid: ${feeTotals.paid.toLocaleString()}</div>
                        <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-amber-500" /> Pending: ${feeTotals.pending.toLocaleString()}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">Total: ${feeTotals.total.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Invoices table */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Recent Invoices</h3>
                    {myChildren.length===0 ? (
                      <EmptyState message="No children linked to your account yet." cta="Link Child Account" />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-left text-gray-500">
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <th className="py-2">Invoice ID</th>
                              <th className="py-2">Child Name</th>
                              <th className="py-2">Amount</th>
                              <th className="py-2">Status</th>
                              <th className="py-2">Due Date</th>
                              <th className="py-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allInvoicesList.slice(0,8).map(({child,inv}) => (
                              <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                <td className="py-2">{inv.id}</td>
                                <td className="py-2">{child.name}</td>
                                <td className="py-2 font-medium">${inv.amount}</td>
                                <td className="py-2">
                                  <span className={`text-xs px-2 py-0.5 rounded ${inv.status==='Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : (new Date(inv.due) < new Date() ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300')}`}>{inv.status==='Paid' ? 'Paid' : (new Date(inv.due) < new Date() ? 'Overdue' : 'Pending')}</span>
                                </td>
                                <td className="py-2">{inv.due}</td>
                                <td className="py-2">
                                  <div className="flex justify-end gap-2 text-xs">
                                    <button className="text-indigo-600 hover:underline" onClick={()=>alert(`${inv.title} for ${child.name}`)}>View</button>
                                    <button className="text-indigo-600 hover:underline" onClick={()=>downloadInvoice(inv, child)}>Download</button>
                                    {inv.status==='Pending' && (
                                      <button className="text-indigo-600 hover:underline" onClick={()=>payInvoiceAction(schoolId, child.id, inv.id)}>Pay</button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Reminders */}
                  <RemindersCard items={computeReminders(allInvoicesList)} />
                </section>
              )}

              {/* Children */}
              {active === 'children' && (
                <section className="animate-slide-in-right">
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Children</h2>
                    <div className="flex items-center gap-2">
                      <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={()=>setShowLink(true)}>Link New Child</Button>
                      <Button variant="outline" onClick={()=>downloadChildrenSummary(myChildren, invoicesByChild)}>Download Summary</Button>
                      <select className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" onChange={()=>{}}>
                        <option>All Classes</option>
                        {Array.from(new Set(myChildren.map(c=>c.className))).map((cn)=> <option key={cn}>{cn}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myChildren.length===0 && (
                      <EmptyState message="No children linked to your account yet." cta="Link Child Account" />
                    )}
                    {myChildren.map((c) => {
                      const pendingInv = (invoicesByChild[c.id]||[]).filter(i=>i.status==='Pending');
                      const nextDue = pendingInv.sort((a,b)=> a.due.localeCompare(b.due))[0]?.due;
                      const paidAmt = (invoicesByChild[c.id]||[]).filter(i=>i.status==='Paid').reduce((s,i)=>s+i.amount,0);
                      const attendance7 = recentDates.map((dt)=>Boolean(entities.attendance[dt]?.[entities.classes.find((cl)=>cl.name===c.className)?.id || '']?.[c.id]));
                      const pct = attendance7.length? Math.round((attendance7.filter(Boolean).length/attendance7.length)*100): 0;
                      return (
                        <div key={c.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all cursor-default">
                          <div className="flex items-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 font-bold grid place-items-center text-xl">
                              {c.name.split(' ').map((p)=>p[0]).slice(0,2).join('')}
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{c.name}</h3>
                              <p className="text-sm text-gray-600">{c.className}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <div className="text-xs text-gray-500">Attendance</div>
                              <div className="font-semibold">{pct}%</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <div className="text-xs text-gray-500">Fees Paid</div>
                              <div className="font-semibold">${paidAmt}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <div className="text-xs text-gray-500">Next Due</div>
                              <div className="font-semibold">{nextDue || '-'}</div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button className="text-indigo-600 hover:underline text-sm" onClick={()=>setSelectedChildId(c.id)}>View Profile</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Fees */}
              {active === 'fees' && (
                <section className="animate-slide-in-left">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Fees</h2>
                  {/* Payment breakdown */}
                  <FeeBreakdown allInvoices={allInvoicesList} />
                  {/* Monthly payments chart */}
                  <MonthlyPaymentsChart allInvoices={allInvoicesList} />
                  {/* Upcoming reminders */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Due Fees</h3>
                      <button className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all" onClick={()=>downloadFeeStatement(allInvoicesList)}>Download Fee Statement</button>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {allInvoicesList.filter(({inv})=>inv.status!=='Paid').sort((a,b)=>a.inv.due.localeCompare(b.inv.due)).map(({child,inv}) => (
                        <div key={inv.id} className={`py-2 flex justify-between items-center ${new Date(inv.due)<new Date()? 'text-red-600':''}`}>
                          <div className="text-sm">{child.name}</div>
                          <div className="text-sm">{inv.due}</div>
                          <div className="text-sm font-medium">${inv.amount}</div>
                          <div>
                            <Button size="sm" onClick={()=>payInvoiceAction(schoolId, child.id, inv.id)}>Pay Now</Button>
                          </div>
                        </div>
                      ))}
                      {allInvoicesList.filter(({inv})=>inv.status!=='Paid').length===0 && (
                        <div className="text-sm text-gray-500 py-4">No upcoming fees.</div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Payments */}
              {active === 'payments' && (
                <PaymentsSection allInvoices={allInvoicesList} />
              )}

              {active === 'support' && (
                <ParentSupport tickets={tickets} userEmail={user?.email || ''} />
              )}
            </main>
          )}
          {selectedChild && (
            <ChildProfileModal child={selectedChild} onClose={()=>setSelectedChildId(null)} attendanceRows={attendanceRows} homework={selectedHomework} />
          )}
          <LinkChildModal
            open={showLink}
            onClose={()=>setShowLink(false)}
            onLinked={()=>{
              // If linked in current school, refresh entities
              setEntities(getEntities(getCurrentSchoolId()));
            }}
            parentEmail={user?.email || ''}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

// ===== Helpers and Components for Parent Portal =====

function CountingNumber({ value, duration = 800 }: { value: number | string; duration?: number }) {
  const [display, setDisplay] = useState<string>(typeof value === 'number' ? '0' : String(value));
  useEffect(() => {
    const endStr = String(value);
    const numeric = Number(String(value).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(numeric)) { setDisplay(endStr); return; }
    const start = 0; const startTime = performance.now(); let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const val = Math.round(start + (numeric - start) * eased);
      setDisplay(val.toLocaleString());
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span>{display}</span>;
}

function MetricCard({ icon, title, value, trend }: { icon: 'users' | 'card' | 'wallet'; title: string; value: number | string; trend?: string }) {
  const iconEl = icon==='users'
    ? (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>)
    : icon==='card'
    ? (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>)
    : (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></svg>);
  return (
    <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur border border-white/40 dark:border-gray-800 rounded-2xl shadow p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all ease-in-out duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-50/90 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-200 p-2 rounded-lg">{iconEl}</div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100"><CountingNumber value={value} /></p>
          {trend && <div className="text-xs text-gray-500">{trend}</div>}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message, cta }: { message: string; cta?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3 text-gray-500 dark:text-gray-400">
      <div className="text-4xl">🗂️</div>
      <div>{message}</div>
      {cta && <Button>{cta}</Button>}
    </div>
  );
}

function RemindersCard({ items }: { items: { icon: string; text: string; date: string }[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 mt-6">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Reminders</h3>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <div className="text-3xl mb-2">🗒️</div>
          <div>No reminders yet</div>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((r, idx) => (
            <li key={idx} className="flex items-center gap-3 text-sm">
              <span className="text-lg">{r.icon}</span>
              <span className="flex-1">{r.text}</span>
              <span className="text-gray-500">{r.date}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function computeReminders(all: { child: StudentType; inv: InvoiceType }[]): { icon: string; text: string; date: string }[] {
  const upcoming = all.filter(({ inv }) => inv.status !== 'Paid').sort((a,b)=> a.inv.due.localeCompare(b.inv.due)).slice(0,5);
  return upcoming.map(({ child, inv }) => ({ icon: '⏰', text: `${inv.title} for ${child.name}`, date: inv.due }));
}

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
  setTimeout(()=>{ w.print(); w.close(); }, 300);
}

function downloadChildrenSummary(children: StudentType[], invoicesByChild: Record<string, InvoiceType[]>) {
  const rows: string[] = [];
  rows.push(['Child','Class','Paid Amount','Pending Amount'].join(','));
  for (const c of children) {
    const invs = invoicesByChild[c.id] || [];
    const paid = invs.filter(i=>i.status==='Paid').reduce((s,i)=>s+i.amount,0);
    const pending = invs.filter(i=>i.status!=='Paid').reduce((s,i)=>s+i.amount,0);
    rows.push([c.name, c.className, String(paid), String(pending)].join(','));
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'children-summary.csv'; a.click(); URL.revokeObjectURL(url);
}

function categorize(title: string): 'Tuition' | 'Transport' | 'Activities' | 'Other' {
  const t = title.toLowerCase();
  if (t.includes('tuition')) return 'Tuition';
  if (t.includes('transport') || t.includes('bus')) return 'Transport';
  if (t.includes('activity') || t.includes('activities')) return 'Activities';
  return 'Other';
}

function FeeBreakdown({ allInvoices }: { allInvoices: { child: StudentType; inv: InvoiceType }[] }) {
  const categories = ['Tuition','Transport','Activities','Other'] as const;
  const data = categories.map((cat) => {
    const invs = allInvoices.filter(({inv})=>categorize(inv.title)===cat);
    const total = invs.reduce((s,{inv})=>s+inv.amount,0);
    const collected = invs.filter(({inv})=>inv.status==='Paid').reduce((s,{inv})=>s+inv.amount,0);
    return { cat, total, collected };
  });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map(({cat,total,collected}) => (
        <div key={cat} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="text-sm text-gray-500">{cat}</div>
          <div className="text-lg font-semibold">${collected.toLocaleString()} / ${total.toLocaleString()}</div>
          <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${total? Math.round((collected/total)*100):0}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthlyPaymentsChart({ allInvoices }: { allInvoices: { child: StudentType; inv: InvoiceType }[] }) {
  const months = Array.from({length:6}).map((_,i)=>{
    const d = new Date(); d.setMonth(d.getMonth() - (5-i)); return d.toISOString().slice(0,7);
  });
  const values = months.map((ym)=> allInvoices.filter(({inv})=> inv.status==='Paid' && (inv.paidAt||'').slice(0,7)===ym).reduce((s,{inv})=>s+inv.amount,0));
  const max = Math.max(1, ...values);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Payments</h3>
      </div>
      <div className="h-40 flex items-end gap-2">
        {values.map((v,i)=> (
          <div key={i} className="flex-1">
            <div className="w-full bg-indigo-500/90 rounded-t" style={{ height: `${Math.round((v / max) * 100)}%` }} title={`${months[i]}: $${v}`} />
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-6 text-[10px] text-gray-400">
        {months.map((m,i)=>(<div key={i} className="text-center">{m}</div>))}
      </div>
    </div>
  );
}

function downloadFeeStatement(all: { child: StudentType; inv: InvoiceType }[]) {
  const w = window.open('', '_blank'); if (!w) return;
  const style = `
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 16px; color: #111827; }
      h1 { font-size: 18px; margin: 0 0 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
      th { background: #f3f4f6; }
    </style>`;
  const rows = all.map(({child,inv}) => `<tr><td>${inv.id}</td><td>${child.name}</td><td>${inv.title}</td><td>${inv.due}</td><td>$${inv.amount}</td><td>${inv.status}${inv.paidAt? ' ('+inv.paidAt.slice(0,10)+')':''}</td></tr>`).join('');
  const html = `<html><head>${style}</head><body><h1>Fee Statement</h1><table><thead><tr><th>ID</th><th>Child</th><th>Title</th><th>Due</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  w.document.write(html); w.document.close(); setTimeout(()=>{ w.print(); w.close(); }, 300);
}

function PaymentsSection({ allInvoices }: { allInvoices: { child: StudentType; inv: InvoiceType }[] }) {
  const paid = allInvoices.filter(({inv})=>inv.status==='Paid');
  const pending = allInvoices.filter(({inv})=>inv.status!=='Paid');
  const totalPaidYear = paid.filter(({inv})=>(inv.paidAt||'').slice(0,4)===new Date().toISOString().slice(0,4)).reduce((s,{inv})=>s+inv.amount,0);
  const pendingAmt = pending.reduce((s,{inv})=>s+inv.amount,0);
  const successRate = Math.round((paid.length/(paid.length+pending.length||1))*100);
  const [statusFilter, setStatusFilter] = useState<'All'|'Paid'|'Pending'>('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  // Filters are applied inline below
  const [refundFor, setRefundFor] = useState<null | { child: StudentType; inv: InvoiceType }>(null);
  return (
    <section className="animate-slide-in-bottom">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4"><div className="text-sm text-gray-500">Total Paid this year</div><div className="text-xl font-semibold">${totalPaidYear}</div></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4"><div className="text-sm text-gray-500">Pending Amount</div><div className="text-xl font-semibold">${pendingAmt}</div></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4"><div className="text-sm text-gray-500">Success Rate</div><div className="text-xl font-semibold">{successRate}%</div></div>
      </div>
      <div className="flex flex-wrap items-center gap-3 justify-between mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm">From</label><input type="date" className="border border-gray-300 bg-white text-gray-900 rounded px-2 py-1 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" value={from} onChange={(e)=>setFrom(e.target.value)} />
          <label className="text-sm">To</label><input type="date" className="border border-gray-300 bg-white text-gray-900 rounded px-2 py-1 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" value={to} onChange={(e)=>setTo(e.target.value)} />
          <select className="border border-gray-300 bg-white text-gray-900 rounded px-2 py-1 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value as 'All'|'Paid'|'Pending')}>
            <option>All</option>
            <option>Paid</option>
            <option>Pending</option>
          </select>
        </div>
        <Button variant="outline" onClick={()=>{ setFrom(''); setTo(''); setStatusFilter('All'); }}>Clear Filters</Button>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
              <th className="py-2 px-3">Payment ID</th>
              <th className="py-2 px-3">Child</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Method</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paid.filter(() =>{
              if (statusFilter==='Paid' || statusFilter==='All') return true; return false;
            }).filter(({inv})=>{
              if (from && (inv.paidAt||'').slice(0,10) < from) return false;
              if (to && (inv.paidAt||'').slice(0,10) > to) return false;
              return true;
            }).map(({child,inv}) => (
              <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                <td className="py-2 px-3">{inv.id}</td>
                <td className="py-2 px-3">{child.name}</td>
                <td className="py-2 px-3 font-medium">${inv.amount}</td>
                <td className="py-2 px-3">{(inv.paidAt||'').slice(0,10) || '-'}</td>
                <td className="py-2 px-3"><span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Paid</span></td>
                <td className="py-2 px-3">Card</td>
                <td className="py-2 px-3">
                  <div className="flex justify-end gap-2 text-xs">
                    <button className="text-indigo-600 hover:underline" onClick={()=>downloadInvoice(inv, child)}>Download Receipt</button>
                    <button className="text-indigo-600 hover:underline" onClick={()=>setRefundFor({child,inv})}>Request Refund</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {refundFor && (
        <RefundModal item={refundFor} onClose={()=>setRefundFor(null)} />
      )}
    </section>
  );
}

function RefundModal({ item, onClose }: { item: { child: StudentType; inv: InvoiceType }; onClose: ()=>void }) {
  const [reason, setReason] = useState('');
  // attachment file reserved for future use
  const [done, setDone] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-6 animate-zoom-in">
        <h3 className="text-lg font-semibold mb-2">Request Refund</h3>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">{item.inv.title} — {item.child.name} — ${item.inv.amount}</div>
  <textarea className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" rows={4} placeholder="Reason" value={reason} onChange={(e)=>setReason(e.target.value)} />
        <div className="mt-2">
          <input type="file" onChange={()=>{/* reserved */}} />
        </div>
        {done && <div className="mt-3 text-green-600 text-sm">Refund request submitted.</div>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={()=>{ setDone(true); setTimeout(()=>{ setDone(false); onClose(); }, 1200); }}>Submit</Button>
        </div>
      </div>
    </div>
  );
}

function ChildProfileModal({ child, onClose, attendanceRows, homework }: { child: StudentType; onClose: ()=>void; attendanceRows: {date:string; present:boolean}[]; homework: { id: string; title: string; due: string }[] }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl p-6 animate-zoom-in overflow-y-auto max-h-[90vh]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{child.name}</h3>
            <p className="text-sm text-gray-600">{child.className}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900">
            <h4 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">Attendance (last 7 days)</h4>
            <div className="h-32 flex items-end gap-2">
              {attendanceRows.map((r) => (
                <div key={r.date} className="flex-1">
                  <div className={`w-full ${r.present? 'bg-green-500':'bg-gray-300'} rounded-t`} style={{ height: '100%' }} title={`${r.date}: ${r.present? 'Present':'Absent'}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900">
            <h4 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">Homework</h4>
            {homework.length === 0 ? (
              <p className="text-sm text-gray-600">No homework listed.</p>
            ) : (
              <ul className="divide-y text-sm">
                {homework.slice(0,5).map((h)=> (
                  <li key={h.id} className="py-2">
                    <p className="text-gray-900 dark:text-gray-100 font-medium">{h.title}</p>
                    <p className="text-gray-600 text-xs">Due: {h.due}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentSupport({ tickets, userEmail }: { tickets: ReturnType<typeof getSupportTickets>; userEmail: string }) {
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<'All'|'Open'|'In Progress'|'Resolved'|'Closed'>('All');
  const filtered = tickets.filter(t => filter==='All' ? true : t.status===filter);
  const [form, setForm] = useState({ title: '', description: '', category: 'Billing' as 'Billing'|'Technical'|'General', file: null as File | null });
  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Support Tickets</h2>
        <div className="flex items-center gap-2">
          <select className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" value={filter} onChange={(e)=>setFilter(e.target.value as 'All'|'Open'|'In Progress'|'Resolved'|'Closed')}>
            {['All','Open','In Progress','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
          </select>
          <Button onClick={()=>setShowNew(true)}>New Ticket</Button>
        </div>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
              <th className="py-2 px-3">Title</th>
              <th className="py-2 px-3">Category</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                <td className="py-2 px-3">{t.title}</td>
                <td className="py-2 px-3">{t.category}</td>
                <td className="py-2 px-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    t.status==='Open' ? 'bg-indigo-100 text-indigo-700' : t.status==='In Progress' ? 'bg-yellow-100 text-yellow-700' : t.status==='Resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>{t.status}</span>
                </td>
                <td className="py-2 px-3">{t.createdAt.slice(0,10)}</td>
                <td className="py-2 px-3">
                  <div className="flex justify-end gap-2 text-xs">
                    <button className="text-indigo-600 hover:underline" onClick={()=>alert(t.description)}>View</button>
                    <button className="text-red-600 hover:underline" onClick={()=>deleteSupportTicket(t.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr><td colSpan={5} className="text-center text-gray-500 py-6">No tickets yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { q: 'How do I pay school fees online?', a: 'Open the Fees page and click Pay Now on a pending invoice.' },
          { q: 'Can I link multiple children?', a: 'Yes, use Link New Child in the Children page.' },
          { q: 'Where can I view my receipts?', a: 'Go to Payments and use Download Receipt action.' }
        ].map((f,idx)=> <FAQItem key={idx} q={f.q} a={f.a} />)}
      </div>

      {/* Contact */}
      <div className="mt-6 flex flex-wrap items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="text-sm">📧 support@school.com</div>
        <div className="flex gap-2">
          <Button variant="outline">Call Support</Button>
          <Button variant="outline">Live Chat</Button>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setShowNew(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-lg p-6 animate-zoom-in">
            <h3 className="text-lg font-semibold mb-3">New Ticket</h3>
            <div className="space-y-3">
              <input className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
              <textarea className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" rows={4} placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
              <select className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value as 'Billing'|'Technical'|'General'})}>
                {['Billing','Technical','General'].map(c=> <option key={c}>{c}</option>)}
              </select>
              <input type="file" onChange={()=>{/* reserved */}} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={()=>setShowNew(false)}>Cancel</Button>
              <Button onClick={()=>{
                const now = new Date().toISOString();
                const cat = form.category==='Technical' ? 'Software' : (form.category==='General' ? 'Other' : 'Billing');
                upsertSupportTicket({ id: `t-${Date.now()}`, title: form.title.trim()||'Untitled', description: form.description.trim(), category: cat as 'Billing'|'Software'|'Other', priority: 'Low', status: 'Open', createdAt: now, updatedAt: now, submitter: userEmail });
                setShowNew(false);
              }}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md">
      <button className="w-full text-left font-medium" onClick={()=>setOpen(o=>!o)}>{q}</button>
      <div className={`transition-all duration-300 overflow-hidden ${open? 'max-h-40 mt-2':'max-h-0'}`}>
        <div className="text-sm text-gray-600 dark:text-gray-300">{a}</div>
      </div>
    </div>
  );
}

function LinkChildModal({ open, onClose, onLinked, parentEmail }: { open: boolean; onClose: ()=>void; onLinked: (studentId: string)=>void; parentEmail: string }) {
  const [selSchool, setSelSchool] = useState<string>('');
  const [selStudent, setSelStudent] = useState<string>('');
  const [step, setStep] = useState<'select'|'done'>('select');
  const schools = getSchools();
  const students = useMemo(() => {
    if (!selSchool) return [] as StudentType[];
    const ent = getEntities(selSchool);
    const already = (ent.parentChildren[parentEmail] || new Array<string>()) as string[];
    const setLinked = new Set(already);
    return ent.students.filter((s)=>!setLinked.has(s.id));
  }, [selSchool, parentEmail]);
  useEffect(()=>{ if (open){ setStep('select'); setSelStudent(''); setSelSchool(getCurrentSchoolId()); }}, [open]);

  function seedInvoicesIfNeeded(schoolId: string, studentId: string) {
    const ent = getEntities(schoolId);
    if ((ent.invoices[studentId] || []).length > 0) return;
    const now = new Date();
    const invs: InvoiceType[] = [
      { id: `inv-${Date.now()}-tuit`, studentId, title: 'Tuition Fee', amount: 1000, due: new Date(now.getFullYear(), now.getMonth()+1, 5).toISOString().slice(0,10), status: 'Pending' },
      { id: `inv-${Date.now()}-trans`, studentId, title: 'Transport Fee', amount: 120, due: new Date(now.getFullYear(), now.getMonth()+1, 10).toISOString().slice(0,10), status: 'Pending' },
      { id: `inv-${Date.now()}-act`, studentId, title: 'Activity Fee', amount: 80, due: new Date(now.getFullYear(), now.getMonth(), 28).toISOString().slice(0,10), status: 'Paid', paidAt: new Date(now.getTime()-86400000*7).toISOString() },
    ];
    setInvoices(schoolId, studentId, invs);
  }

  function handleLink() {
    if (!selSchool || !selStudent || !parentEmail) return;
    const ent = getEntities(selSchool);
    const current = ent.parentChildren[parentEmail] || [];
    if (!current.includes(selStudent)) {
      setParentChildren(selSchool, parentEmail, [...current, selStudent]);
    }
    seedInvoicesIfNeeded(selSchool, selStudent);
    // Switch context to selected school to reflect changes immediately
    setCurrentSchoolId(selSchool);
    setStep('done');
    onLinked(selStudent);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-lg p-6 animate-zoom-in">
        {step==='select' ? (
          <>
            <h3 className="text-lg font-semibold mb-3">Link Child</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm block mb-1">Select School</label>
                <select className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" value={selSchool} onChange={(e)=>setSelSchool(e.target.value)}>
                  <option value="">Choose a school</option>
                  {schools.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm block mb-1">Select Student</label>
                <select className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100" value={selStudent} onChange={(e)=>setSelStudent(e.target.value)} disabled={!selSchool}>
                  <option value="">Choose a student</option>
                  {students.map(st=> <option key={st.id} value={st.id}>{st.name}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleLink} disabled={!selSchool || !selStudent}>Link</Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2">Linked Successfully</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">The child has been linked, and fee invoices are initialized.</div>
            <div className="mt-4 text-right"><Button onClick={onClose}>Done</Button></div>
          </>
        )}
      </div>
    </div>
  );
}
