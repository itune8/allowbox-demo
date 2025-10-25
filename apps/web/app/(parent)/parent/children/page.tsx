'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import {
  getCurrentSchoolId,
  getEntities,
  setParentChildren,
  setCurrentSchoolId,
  setInvoices,
  getSchools,
  type Student as StudentType,
  type Invoice as InvoiceType,
} from '../../../../lib/data-store';
import { Button } from '@repo/ui/button';

export default function ChildrenPage() {
  const { user } = useAuth();
  const schoolId = useMemo(() => getCurrentSchoolId(), []);
  const [entities] = useState(() => getEntities(schoolId));
  const [showLink, setShowLink] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

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

  const recentDates = useMemo(() => {
    const days = 7;
    const arr: string[] = [];
    const d = new Date();
    for (let i = 0; i < days; i++) {
      const dd = new Date(d.getTime() - 86400000 * i);
      arr.push(dd.toISOString().slice(0, 10));
    }
    return arr.reverse();
  }, []);

  const selectedChild = useMemo(
    () => myChildren.find((c) => c.id === selectedChildId) || null,
    [myChildren, selectedChildId]
  );

  const selectedChildClassId = useMemo(() => {
    if (!selectedChild) return '';
    return entities.classes.find((c) => c.name === selectedChild.className)?.id || '';
  }, [entities.classes, selectedChild]);

  const attendanceRows = useMemo(() => {
    if (!selectedChild) return [] as { date: string; present: boolean }[];
    return recentDates.map((dt) => ({
      date: dt,
      present: Boolean(entities.attendance[dt]?.[selectedChildClassId]?.[selectedChild.id]),
    }));
  }, [entities.attendance, selectedChild, selectedChildClassId, recentDates]);

  const selectedHomework = useMemo(() => {
    if (!selectedChildClassId) return [];
    return entities.homework[selectedChildClassId] || [];
  }, [entities.homework, selectedChildClassId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Children</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View and manage your linked children's profiles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowLink(true)}>Link New Child</Button>
          <select className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
            <option>All Classes</option>
            {Array.from(new Set(myChildren.map((c) => c.className))).map((cn) => (
              <option key={cn}>{cn}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Children Grid */}
      {myChildren.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <div className="text-4xl mb-3">🗂️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No children linked yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Link your child's account to start tracking their progress
          </p>
          <Button onClick={() => setShowLink(true)}>Link Child Account</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myChildren.map((c) => {
            const pendingInv = (invoicesByChild[c.id] || []).filter((i) => i.status === 'Pending');
            const nextDue = pendingInv.sort((a, b) => a.due.localeCompare(b.due))[0]?.due;
            const paidAmt = (invoicesByChild[c.id] || [])
              .filter((i) => i.status === 'Paid')
              .reduce((s, i) => s + i.amount, 0);
            const attendance7 = recentDates.map((dt) =>
              Boolean(
                entities.attendance[dt]?.[entities.classes.find((cl) => cl.name === c.className)?.id || '']?.[c.id]
              )
            );
            const pct = attendance7.length ? Math.round((attendance7.filter(Boolean).length / attendance7.length) * 100) : 0;

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-center mb-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold grid place-items-center text-xl">
                    {c.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{c.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{c.className}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Attendance</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pct}%</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fees Paid</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">${paidAmt}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next Due</div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {nextDue ? nextDue.slice(5) : '-'}
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedChildId(c.id)}>
                  View Profile
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Child Profile Modal */}
      {selectedChild && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedChildId(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-2xl p-6 animate-zoom-in overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedChild.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedChild.className}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedChildId(null)}>
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Attendance Chart */}
              <div className="bg-white dark:bg-gray-900">
                <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  Attendance (Last 7 Days)
                </h4>
                <div className="h-32 flex items-end gap-2">
                  {attendanceRows.map((r) => (
                    <div key={r.date} className="flex-1">
                      <div
                        className={`w-full ${r.present ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'} rounded-t`}
                        style={{ height: '100%' }}
                        title={`${r.date}: ${r.present ? 'Present' : 'Absent'}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-7 text-[10px] text-gray-400">
                  {attendanceRows.map((r) => (
                    <div key={r.date} className="text-center">
                      {new Date(r.date).toLocaleDateString(undefined, { weekday: 'short' })[0]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Homework */}
              <div className="bg-white dark:bg-gray-900">
                <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-gray-100">Recent Homework</h4>
                {selectedHomework.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No homework listed.</p>
                ) : (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                    {selectedHomework.slice(0, 5).map((h) => (
                      <li key={h.id} className="py-2">
                        <p className="text-gray-900 dark:text-gray-100 font-medium">{h.title}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Due: {h.due}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Child Modal */}
      <LinkChildModal
        open={showLink}
        onClose={() => setShowLink(false)}
        parentEmail={user?.email || ''}
      />
    </div>
  );
}

function LinkChildModal({
  open,
  onClose,
  parentEmail,
}: {
  open: boolean;
  onClose: () => void;
  parentEmail: string;
}) {
  const [selSchool, setSelSchool] = useState<string>('');
  const [selStudent, setSelStudent] = useState<string>('');
  const [step, setStep] = useState<'select' | 'done'>('select');
  const schools = getSchools();

  const students = useMemo(() => {
    if (!selSchool) return [] as StudentType[];
    const ent = getEntities(selSchool);
    const already = (ent.parentChildren[parentEmail] || []) as string[];
    const setLinked = new Set(already);
    return ent.students.filter((s) => !setLinked.has(s.id));
  }, [selSchool, parentEmail]);

  function seedInvoicesIfNeeded(schoolId: string, studentId: string) {
    const ent = getEntities(schoolId);
    if ((ent.invoices[studentId] || []).length > 0) return;
    const now = new Date();
    const invs: InvoiceType[] = [
      {
        id: `inv-${Date.now()}-tuit`,
        studentId,
        title: 'Tuition Fee',
        amount: 1000,
        due: new Date(now.getFullYear(), now.getMonth() + 1, 5).toISOString().slice(0, 10),
        status: 'Pending',
      },
      {
        id: `inv-${Date.now()}-trans`,
        studentId,
        title: 'Transport Fee',
        amount: 120,
        due: new Date(now.getFullYear(), now.getMonth() + 1, 10).toISOString().slice(0, 10),
        status: 'Pending',
      },
      {
        id: `inv-${Date.now()}-act`,
        studentId,
        title: 'Activity Fee',
        amount: 80,
        due: new Date(now.getFullYear(), now.getMonth(), 28).toISOString().slice(0, 10),
        status: 'Paid',
        paidAt: new Date(now.getTime() - 86400000 * 7).toISOString(),
      },
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
    setCurrentSchoolId(selSchool);
    setStep('done');
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-lg p-6 animate-zoom-in">
        {step === 'select' ? (
          <>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Link Child</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm block mb-1 text-gray-700 dark:text-gray-300">Select School</label>
                <select
                  className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  value={selSchool}
                  onChange={(e) => setSelSchool(e.target.value)}
                >
                  <option value="">Choose a school</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm block mb-1 text-gray-700 dark:text-gray-300">Select Student</label>
                <select
                  className="w-full border border-gray-300 bg-white text-gray-900 rounded-md p-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  value={selStudent}
                  onChange={(e) => setSelStudent(e.target.value)}
                  disabled={!selSchool}
                >
                  <option value="">Choose a student</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleLink} disabled={!selSchool || !selStudent}>
                Link
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Linked Successfully</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              The child has been linked, and fee invoices are initialized.
            </div>
            <div className="mt-4 text-right">
              <Button onClick={onClose}>Done</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
