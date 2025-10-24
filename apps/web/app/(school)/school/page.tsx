'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ProtectedRoute } from '../../../components/protected-route';
import { useAuth } from '../../../contexts/auth-context';
import { Button } from '@repo/ui/button';
import { ROLES } from '@repo/config';
import {
  getEntities,
  setStudents as storeSetStudents,
  setStaff as storeSetStaff,
  setClasses as storeSetClasses,
  addInvoice as storeAddInvoice,
} from '../../../lib/data-store';
import { useRouter } from 'next/navigation';
import { tenantService, type TenantData } from '../../../lib/services/tenant.service';
import { CreateStudentModal, type StudentFormData } from '../../../components/modals/create-student-modal';
import { CreateUserModal, type UserFormData } from '../../../components/modals/create-user-modal';
import { studentService } from '../../../lib/services/student.service';
import { userService } from '../../../lib/services/user.service';
import { StatCard } from '@/components/dashboard/stat-card';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  UsersIcon,
  UserAddIcon,
  CalendarIcon,
  DollarIcon,
} from '@/components/dashboard/icons';

type Section = 'dashboard' | 'students' | 'staff' | 'classes' | 'fees' | 'reports' | 'support';

const sidebarItems: { key: Section; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'students', label: 'Students' },
  { key: 'staff', label: 'Staff' },
  { key: 'classes', label: 'Classes' },
  { key: 'fees', label: 'Fees & Billing' },
  { key: 'reports', label: 'Reports' },
  { key: 'support', label: 'Support' },
];

type Student = { id: string; name: string; className: string; age: number };
type Staff = { id: string; name: string; role: string };
type ClassItem = { id: string; name: string; strength: number };
type Invoice = import('../../../lib/data-store').Invoice;

// Removed mock data - now fetching from real API

export default function SchoolDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState<Section>('dashboard');

  // Use real user's tenantId instead of mock getCurrentSchoolId
  const schoolId = useMemo(() => {
    console.log('🏫 School Dashboard - User:', user);
    console.log('🏫 TenantId:', user?.tenantId);
    console.log('🏫 Roles:', user?.roles);
    return user?.tenantId || '';
  }, [user]);

  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [classes] = useState<ClassItem[]>([]);
  const [invoicesMap] = useState<Record<string, Invoice[]>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState<Student | null>(null);
  const [showStaffModal, setShowStaffModal] = useState<Staff | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');

  // School-level support tickets
  type TicketCategory = 'Hardware' | 'Software' | 'Billing' | 'Access' | 'Other';
  type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  type SupportTicket = { id: string; title: string; category: TicketCategory; status: TicketStatus; updatedAt: string };
  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: 'st-1', title: 'Can’t access class resources', category: 'Access', status: 'Open', updatedAt: new Date().toISOString() },
    { id: 'st-2', title: 'Invoice not downloading', category: 'Software', status: 'In Progress', updatedAt: new Date(Date.now() - 1000*60*60*3).toISOString() },
  ]);
  const [ticketSearch, setTicketSearch] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');

  // Backend integration: Tenant data
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const totals = useMemo(() => {
    return {
      studentCount: students.length,
      staffCount: staff.length,
      classCount: classes.length,
    };
  }, [students, staff, classes]);

  const { pendingFeesTotal, pendingInvoices, paidInvoices } = useMemo(() => {
    const allInvoices = Object.values(invoicesMap).flat();
    const pendingInvoices = allInvoices.filter((i) => i.status === 'Pending');
    const paidInvoices = allInvoices.filter((i) => i.status === 'Paid');
    const pendingFeesTotal = pendingInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
    return { pendingFeesTotal, pendingInvoices, paidInvoices };
  }, [invoicesMap]);



  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q));
  }, [students, studentQuery]);

  // Use real user role from authentication
  const isSchoolAdmin = useMemo(() => {
    const hasRole = (user?.roles || []).includes(ROLES.SCHOOL_ADMIN) ||
                    (user?.roles || []).includes(ROLES.TENANT_ADMIN);
    console.log('🔐 Is School Admin:', hasRole, '| User roles:', user?.roles);
    return hasRole;
  }, [user?.roles]);

  // Fetch tenant data from backend
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const data = await tenantService.getCurrentTenant();
        setTenantData(data);
      } catch (error) {
        console.error('Failed to fetch tenant data:', error);
      } finally {
        setLoadingTenant(false);
      }
    };

    if (user?.tenantId) {
      fetchTenantData();
    } else {
      setLoadingTenant(false);
    }
  }, [user]);

  // Backend handlers for creating students and staff
  const handleCreateStudent = async (studentData: StudentFormData) => {
    try {
      await studentService.createStudent(studentData);
      setBanner('Student created successfully!');
      setTimeout(() => setBanner(null), 1500);
      // Optionally refresh the student list here
    } catch (error) {
      console.error('Failed to create student:', error);
      throw error;
    }
  };

  const handleCreateStaff = async (userData: UserFormData) => {
    try {
      await userService.createUser(userData);
      setBanner('Staff member created successfully!');
      setTimeout(() => setBanner(null), 1500);
      // Optionally refresh the staff list here
    } catch (error) {
      console.error('Failed to create staff:', error);
      throw error;
    }
  };

  // profile menu outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Initialize theme (removed dark mode toggle)

  // Helpers to keep numeric inputs clean (digits only, non-negative integers)
  const blockNonIntegerKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (e.metaKey || e.ctrlKey) return;
    if (allowedKeys.includes(e.key)) return;
    if (e.key === '-' || e.key === '+' || e.key === '.' || e.key.toLowerCase() === 'e') { e.preventDefault(); return; }
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  };
  const sanitizeOnInput = (e: React.FormEvent<HTMLInputElement>) => { e.currentTarget.value = e.currentTarget.value.replace(/\D+/g, ''); };
  const blockNonDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => { if (/\D/.test(e.clipboardData.getData('text'))) e.preventDefault(); };

  const toNonNegativeInt = (val: FormDataEntryValue | null | undefined) => {
    const str = String(val ?? '').replace(/\D+/g, '');
    const n = parseInt(str, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  // Helper to deduplicate students by name+class (case-insensitive)
  const dedupStudents = (list: Student[]) => {
    const seen = new Set<string>();
    const out: Student[] = [];
    for (const s of list) {
      const key = `${s.name.trim().toLowerCase()}|${s.className.trim().toLowerCase()}`;
      if (!seen.has(key)) { seen.add(key); out.push(s); }
    }
    return out;
  };

  const addStudent = (data: { name: string; className: string; age: number }) => {
    setStudents((prev) => {
      const newStudent: Student = { id: `stu-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, ...data };
      // Build list and deduplicate by name+class
      const next = dedupStudents([newStudent, ...prev]);
      storeSetStudents(schoolId, next);
      return next;
    });
    setShowAddStudent(false);
    setActive('students');
    setBanner('Student added');
    setTimeout(() => setBanner(null), 1500);
  };
  const addStaff = (data: { name: string; role: string }) => {
    setStaff((prev) => {
      const next = [{ id: `stf-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, ...data }, ...prev];
      storeSetStaff(schoolId, next);
      return next;
    });
    setShowAddStaff(false);
    setActive('staff');
    setBanner('Staff added');
    setTimeout(() => setBanner(null), 1500);
  };

  // Removed storeSubscribe - data will be fetched from real API instead
  // useEffect(() => {
  //   const unsub = storeSubscribe(() => {
  //     const e = getEntities(schoolId);
  //     setStudents(e.students);
  //     setStaff(e.staff);
  //     setClasses(e.classes);
  //     setInvoicesMap(e.invoices);
  //   });
  //   return unsub;
  // }, [schoolId]);

  // Persist initial classes to shared store if store is empty (so Teacher sees classes)
  useEffect(() => {
    const e = getEntities(schoolId);
    if ((e.classes?.length ?? 0) === 0 && classes.length > 0) {
      storeSetClasses(schoolId, classes);
    }
    // no deps on classes write to avoid loops; only on mount persist if needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen flex transition-opacity duration-300 ease-in-out text-gray-900 dark:text-gray-100">
        {/* Clean background (light/dark) - No gradients */}
        <div
          className="absolute inset-0 -z-10 bg-gray-50 dark:bg-gray-950"
        />
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex md:flex-col sticky top-0 h-screen shadow-sm animate-slide-in-left">
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {loadingTenant ? 'Loading...' : tenantData?.schoolName || 'Allowbox School'}
            </span>
          </div>
          <nav className="flex-1 py-4 overflow-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`group w-full text-left px-6 py-3 rounded-r-xl border-l-4 transition-all ease-in-out duration-300 transform ${
                  active === item.key
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold border-gray-900 dark:border-gray-100'
                    : 'text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-900 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900 hover:border-gray-900 dark:hover:border-gray-100 hover:pl-7 hover:-translate-y-0.5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="outline" size="sm" onClick={logout} className="w-full">
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 animate-slide-in-top">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">School Admin Dashboard</h1>
              <div className="flex items-center gap-3 relative" ref={profileRef}>
                <button
                  className="flex items-center gap-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ease-smooth px-2 py-1"
                  onClick={() => setShowProfileMenu((s) => !s)}
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-gray-100 font-semibold">
                    {user?.firstName?.[0] ?? 'A'}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-gray-100 hidden sm:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg animate-zoom-in">
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 transition-colors"
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push('/auth/forgot_password');
                      }}
                    >
                      Reset Password
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-700" />
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm text-red-600 transition-colors"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {!isSchoolAdmin ? (
            
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
                You do not have permission to view this page.
              </div>
            </div>
          ) : (
            <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
              {banner && (
                <div className="mb-4 animate-fade-in">
                  <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-2 rounded">{banner}</div>
                </div>
              )}

              {active === 'dashboard' && (
                <section className="animate-slide-in-top">
                  {/* Header */}
                  <DashboardHeader
                    title="School Admin Dashboard"
                    subtitle="Comprehensive overview of your school's performance"
                    breadcrumbs={[
                      { label: "Home", href: "/" },
                      { label: "Dashboard" },
                    ]}
                  />

                  {/* School Information Card */}
                  {tenantData && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">School Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">School Name</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{tenantData.schoolName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Domain</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{tenantData.domain}</p>
                        </div>
                        {tenantData.contactEmail && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Contact Email</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{tenantData.contactEmail}</p>
                          </div>
                        )}
                        {tenantData.contactPhone && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Contact Phone</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{tenantData.contactPhone}</p>
                          </div>
                        )}
                        {tenantData.address && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{tenantData.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
                    <StatCard
                      title="Total Students"
                      value={totals.studentCount}
                      icon={<UsersIcon className="w-5 h-5 text-gray-500" />}
                      iconBgColor="bg-gray-50"
                    />
                    <StatCard
                      title="Active Staff"
                      value={totals.staffCount}
                      icon={<UserAddIcon className="w-5 h-5 text-gray-500" />}
                      iconBgColor="bg-gray-50"
                    />
                    <StatCard
                      title="Total Classes"
                      value={totals.classCount}
                      icon={<CalendarIcon className="w-5 h-5 text-gray-500" />}
                      iconBgColor="bg-gray-50"
                    />
                    <StatCard
                      title="Pending Fees"
                      value={`$${pendingFeesTotal.toLocaleString()}`}
                      icon={<DollarIcon className="w-5 h-5 text-orange-600" />}
                      iconBgColor="bg-orange-50"
                    />
                  </div>

                  {/* Quick Actions & Events */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button onClick={() => setIsStudentModalOpen(true)}>
                          Add Student
                        </Button>
                        <Button variant="outline" onClick={() => setIsStaffModalOpen(true)}>
                          Add Staff
                        </Button>
                        <Button variant="outline" onClick={() => setActive('classes')}>
                          Manage Classes
                        </Button>
                        <Button variant="outline" onClick={() => setActive('fees')}>
                          Fees & Billing
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Upcoming Events</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">PTA Meeting – Tue 11:00 AM</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Midterm Exams – Next Week</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Sports Day – 2 Weeks</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              )}

              {active === 'students' && (
                <section className="animate-slide-in-right">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Students</h2>
                    <form
                      className="relative flex items-center gap-2"
                      onSubmit={(e) => { e.preventDefault(); setStudentQuery(studentSearch); }}
                    >
                      <input
                        placeholder="Search by name or class"
                        className="h-10 w-64 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-9 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                      <span className="absolute left-3 text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                      </span>
                      {studentSearch && (
                        <button type="button" className="absolute right-2 text-gray-400 hover:text-gray-600" onClick={() => { setStudentSearch(''); setStudentQuery(''); }}>×</button>
                      )}
                      <Button size="sm" type="submit" className="ml-2">Search</Button>
                      <Button size="sm" type="button" className="ml-2" onClick={() => setShowAddStudent(true)}>+ Add Student</Button>
                    </form>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-fadeIn">
                    <table className="min-w-full text-sm hidden md:table">
                      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Class</th>
                          <th className="px-4 py-3 text-left">Age</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-10">
                              <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                                <div className="text-5xl">🎓</div>
                                <div>No students found.</div>
                                <Button onClick={() => setShowAddStudent(true)}>Add Student</Button>
                              </div>
                            </td>
                          </tr>
                        )}
                        {filteredStudents.map((s) => (
                          <tr key={s.id} className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-all duration-200 ease-in-out" onClick={()=>setShowStudentModal(s)}>
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium hover:text-gray-900">{s.name}</td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.className}</td>
                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.age}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center gap-3 text-gray-400">
                                <button title="Edit" className="hover:text-indigo-500" onClick={(e)=>{e.stopPropagation(); setShowStudentModal(s);}}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M14.06 4.94l3.75 3.75"/></svg>
                                </button>
                                <button title="Delete" className="hover:text-red-500" onClick={(e)=>{e.stopPropagation(); setStudents(prev=>prev.filter(x=>x.id!==s.id));}}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Mobile cards */}
                    <div className="md:hidden p-4 space-y-3">
                      {filteredStudents.map((s)=> (
                        <div key={s.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all" onClick={()=>setShowStudentModal(s)}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-gray-900">{s.name}</div>
                            <div className="text-xs text-gray-500">Age {s.age}</div>
                          </div>
                          <div className="text-sm text-gray-700">{s.className}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {active === 'staff' && (
                <section className="animate-slide-in-left">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Staff</h2>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)} className="h-9 px-3 rounded-md border border-gray-300 text-sm text-gray-900 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-400">
                          <option value="">All Roles</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                      <Button size="sm" onClick={() => setShowAddStaff(true)}>+ Add Staff</Button>
                    </div>
                  </div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 animate-fadeIn">
                    <ul className="divide-y text-sm">
                      {staff.filter(s=>!roleFilter || s.role.includes(roleFilter)).map((t) => (
                        <li key={t.id} className="py-2 px-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg transition-all duration-200 cursor-pointer" onClick={()=>setShowStaffModal(t)}>
                          <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 grid place-items-center font-semibold">{t.name.slice(0,1)}</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t.name}</span>
                          </div>
                          <div className="inline-flex items-center gap-2 text-gray-700">
                            <span className="w-4 h-4 rounded-sm bg-gray-300"/>
                            <span>{t.role}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {staff.filter(s=>!roleFilter || s.role.includes(roleFilter)).length===0 && (
                      <div className="py-10 text-center text-gray-500">No staff yet</div>
                    )}
                  </div>
                </section>
              )}

              {active === 'classes' && (
                <section className="animate-slide-in-bottom">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Classes</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((c, idx) => {
                      const teacher = ['Mr. James','Ms. Ada','Mrs. Bisi','Mr. Lee','Ms. Noor'][idx % 5];
                      const attendance = 80 + (idx * 3 % 15); // 80..94
                      const updated = new Date(Date.now() - (idx+1)*1000*60*60*24).toISOString().slice(0,10);
                      return (
                        <div key={c.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out">
                          <div className="flex items-center justify-between">
                            <div className="text-gray-900 font-semibold">{c.name}</div>
                            <span className="inline-flex items-center gap-1 text-sm text-gray-700"><span className="w-2 h-2 rounded-full bg-indigo-500"/> {c.strength}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Teacher: {teacher}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Avg Attendance: {attendance}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Last Updated: {updated}</div>
                          <div className="mt-3">
                            <button className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-200 text-sm px-3 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-all" onClick={()=>router.push('/school/classes')}>View Class</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {active === 'fees' && (
                <section className="animate-slide-in-right">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Fees & Billing</h2>
                    <Button size="sm" onClick={() => setShowCreateInvoice(true)} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg px-4 py-2 hover:opacity-90 transition-all ease-in-out duration-200 shadow-sm">+ Create Invoice</Button>
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
                                  <span className={`w-2 h-2 rounded-full ${inv.status==='Paid' ? 'bg-green-500' : inv.status==='Pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                  <span>{inv.title}</span>
                                </div>
                                <span className={`${inv.status==='Paid' ? 'text-green-600' : inv.status==='Pending' ? 'text-amber-500' : 'text-red-500'} font-medium`}>${inv.amount}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold">
                            Total Collected: ${paidInvoices.reduce((s,i)=>s+(i.status==='Paid'?(i.amount||0):0),0).toLocaleString()}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 hover:shadow-md transition-all animate-fadeIn">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Pending Invoices ({pendingInvoices.length})</h3>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <button title="CSV" className="hover:text-indigo-500" onClick={() => {
                            const header = ['Invoice','Title','Amount','Status','Due','PaidAt'];
                            const rows = pendingInvoices.map((i) => [i.id, i.title, `$${i.amount}`, i.status, i.due, i.paidAt || '']);
                            const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = `fees-report-${new Date().toISOString().slice(0,10)}.csv`;
                            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                            setBanner('Fees report downloaded'); setTimeout(()=>setBanner(null), 1200);
                          }}>
                            CSV
                          </button>
                          <button title="PDF" className="hover:text-red-500" onClick={() => setBanner('PDF export not implemented')}>PDF</button>
                        </div>
                      </div>
                      {pendingInvoices.length === 0 ? (
                        <p className="text-sm text-gray-600 dark:text-gray-300">No pending invoices.</p>
                      ) : (
                        <ul className="space-y-2 text-sm">
                          {pendingInvoices.slice(0,8).map((inv) => (
                            <li key={inv.id} className="flex items-center justify-between">
                              <span className="text-gray-900 dark:text-gray-100">{inv.id}</span>
                              <span className="text-amber-600 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">${inv.amount}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {active === 'reports' && (
                <section className="animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reports</h3>
                      <div className="flex items-center gap-2">
                        {['This Month','Last 3 Months','This Year'].map((r)=> (
                          <button key={r} className="rounded-full px-3 py-1 border hover:bg-indigo-50 text-sm">{r}</button>
                        ))}
                        <Button>Export All Reports</Button>
                      </div>
                    </div>
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Report</th>
                          <th className="px-4 py-2 text-left">Generated</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['Fees Summary','Attendance Overview','Students by Class'].map((name,i)=> (
                          <tr key={name} className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all">
                            <td className="px-4 py-2 text-gray-900 inline-flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-gray-300"/> {name}</td>
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{new Date(Date.now() - i*86400000).toLocaleDateString()}</td>
                            <td className="px-4 py-2"><button className="text-indigo-600 hover:underline">View</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
              {active === 'support' && (
                <section className="animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Support Tickets</h3>
                      <Button onClick={()=>{ setNewTicketTitle(''); setShowNewTicket(true); }}>+ New Ticket</Button>
                    </div>
                    <div className="relative mb-3">
                      <input className="h-10 w-full max-w-sm border border-gray-300 rounded-lg pl-9 pr-9 text-sm focus:ring-2 focus:ring-gray-400 bg-white text-gray-900 placeholder:text-gray-400" placeholder="Search tickets" value={ticketSearch} onChange={(e)=>setTicketSearch(e.target.value)} />
                      <span className="absolute left-3 top-2.5 text-gray-400"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span>
                      {ticketSearch && <button className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-300" onClick={()=>setTicketSearch('')}>×</button>}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                          <tr>
                            <th className="px-4 py-2 text-left">Title</th>
                            <th className="px-4 py-2 text-left">Category</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tickets.filter(t=>{
                            const q=ticketSearch.trim().toLowerCase();
                            return !q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
                          }).map((t,idx)=> (
                            <tr key={t.id} className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all" style={{ animationDelay: `${idx*40}ms` }}>
                              <td className="px-4 py-2 text-gray-900 dark:text-gray-100 group relative hover:before:content-['View_Ticket'] hover:before:absolute hover:before:-top-5 hover:before:left-0 hover:before:text-[10px] hover:before:text-gray-400">{t.title}</td>
                              <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{t.category}</td>
                              <td className="px-4 py-2"><span className={`text-xs px-3 py-1 rounded-full border ${t.status==='Open'?'bg-sky-50 text-sky-700 border-sky-200':t.status==='In Progress'?'bg-blue-50 text-blue-700 border-blue-200':t.status==='Resolved'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-gray-50 text-gray-700 border-gray-200'}`}>{t.status}</span></td>
                              <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-300">{new Date(t.updatedAt).toLocaleString()}</td>
                            </tr>
                          ))}
                          {tickets.length===0 && (
                            <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">No tickets</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}

              {/* Add Student modal */}
              {showAddStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowAddStudent(false)} />
                  <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 animate-zoom-in">
                    <h3 className="text-lg font-semibold mb-4">Add Student</h3>
                    <form
                      className="space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (isAddingStudent) return; // guard against double-submit
                        setIsAddingStudent(true);
                        const fd = new FormData(e.currentTarget as HTMLFormElement);
                        addStudent({
                          name: String(fd.get('name') || 'New Student'),
                          className: String(fd.get('className') || 'Grade 1'),
                          age: toNonNegativeInt(fd.get('age')),
                        });
                        setIsAddingStudent(false);
                      }}
                    >
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Name</label>
                        <input name="name" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400" placeholder="e.g., Aisha Khan" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Class</label>
                          <select name="className" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-gray-400">
                            {classes.map((c) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Age</label>
                          <input name="age" type="number" min={0} step={1} inputMode="numeric" pattern="[0-9]*" onKeyDown={blockNonIntegerKeys} onInput={sanitizeOnInput} onPaste={blockNonDigitPaste} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400" />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button>
                        <Button type="submit" disabled={isAddingStudent}>{isAddingStudent ? 'Saving…' : 'Save'}</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Add Staff modal */}
              {showAddStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowAddStaff(false)} />
                  <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 animate-zoom-in">
                    <h3 className="text-lg font-semibold mb-4">Add Staff</h3>
                    <form
                      className="space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (isAddingStaff) return;
                        setIsAddingStaff(true);
                        const fd = new FormData(e.currentTarget as HTMLFormElement);
                        addStaff({
                          name: String(fd.get('name') || 'New Staff'),
                          role: String(fd.get('role') || 'Teacher'),
                        });
                        setIsAddingStaff(false);
                      }}
                    >
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Name</label>
                        <input name="name" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400" placeholder="e.g., Mr. James" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Role</label>
                        <input name="role" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400" placeholder="e.g., Math Teacher" />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddStaff(false)}>Cancel</Button>
                        <Button type="submit" disabled={isAddingStaff}>{isAddingStaff ? 'Saving…' : 'Save'}</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Create Invoice modal */}
              {showCreateInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowCreateInvoice(false)} />
                  <div className="relative bg-white rounded-lg shadow-lg w-full max-w-xl p-6 animate-zoom-in">
                    <h3 className="text-lg font-semibold mb-4">Create Invoice</h3>
                    <form
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (isCreatingInvoice) return;
                        setIsCreatingInvoice(true);
                        const fd = new FormData(e.currentTarget as HTMLFormElement);
                        const target = String(fd.get('target') || 'student');
                        const title = String(fd.get('title') || 'School Fee');
                        const amount = toNonNegativeInt(fd.get('amount'));
                        const due = String(fd.get('due') || '').slice(0, 10);
                        const idBase = `inv-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;

                        if (!title || !amount || !due) {
                          setBanner('Please fill all invoice fields');
                          setTimeout(() => setBanner(null), 1500);
                          setIsCreatingInvoice(false);
                          return;
                        }

                        if (target === 'student') {
                          const studentId = String(fd.get('studentId') || '');
                          if (!studentId) {
                            setBanner('Select a student');
                            setTimeout(() => setBanner(null), 1500);
                            setIsCreatingInvoice(false);
                            return;
                          }
                          const invoice = { id: idBase, studentId, title, amount, due, status: 'Pending' as const };
                          storeAddInvoice(schoolId, studentId, invoice);
                          setBanner('Invoice created');
                        } else {
                          const className = String(fd.get('className') || '');
                          const recipients = students.filter((s) => s.className === className);
                          if (recipients.length === 0) {
                            setBanner('No students found in selected class');
                            setTimeout(() => setBanner(null), 1500);
                            setIsCreatingInvoice(false);
                            return;
                          }
                          recipients.forEach((st, idx) => {
                            const invoice = { id: `${idBase}-${idx}`, studentId: st.id, title, amount, due, status: 'Pending' as const };
                            storeAddInvoice(schoolId, st.id, invoice);
                          });
                          setBanner(`Created ${recipients.length} invoice(s)`);
                        }
                        setShowCreateInvoice(false);
                        setIsCreatingInvoice(false);
                        setTimeout(() => setBanner(null), 1500);
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Target</label>
                          <select name="target" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-gray-400">
                            <option value="student">Single Student</option>
                            <option value="class">Entire Class</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Title</label>
                          <input name="title" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400" placeholder="e.g., Term 1 Tuition" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Amount</label>
                          <input name="amount" inputMode="numeric" pattern="[0-9]*" onKeyDown={blockNonIntegerKeys} onInput={sanitizeOnInput} onPaste={blockNonDigitPaste} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400" placeholder="e.g., 250" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                          <input name="due" type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-gray-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Student</label>
                          <select name="studentId" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-gray-400">
                            <option value="">Select student…</option>
                            {students.map((s) => (
                              <option key={s.id} value={s.id}>{s.name} — {s.className}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Used when Target is Single Student</p>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Class</label>
                          <select name="className" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-gray-400">
                            <option value="">Select class…</option>
                            {classes.map((c) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Used when Target is Entire Class</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowCreateInvoice(false)}>Cancel</Button>
                        <Button type="submit" disabled={isCreatingInvoice}>{isCreatingInvoice ? 'Creating…' : 'Create'}</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Student details modal */}
              {showStudentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowStudentModal(null)} />
                  <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-zoom-in">
                    <h3 className="text-lg font-semibold mb-3">Student Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between"><span className="text-gray-600">Name</span><span className="font-medium text-gray-900">{showStudentModal.name}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">Class</span><span className="font-medium text-gray-900">{showStudentModal.className}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">Age</span><span className="font-medium text-gray-900">{showStudentModal.age}</span></div>
                    </div>
                    <div className="mt-4 text-right">
                      <Button variant="outline" onClick={() => setShowStudentModal(null)}>Close</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Staff details modal */}
              {showStaffModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowStaffModal(null)} />
                  <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-zoom-in">
                    <h3 className="text-lg font-semibold mb-3">Staff Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between"><span className="text-gray-600">Name</span><span className="font-medium text-gray-900">{showStaffModal.name}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">Role</span><span className="font-medium text-gray-900">{showStaffModal.role}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600">Join Date</span><span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span></div>
                    </div>
                    <div className="mt-4 text-right">
                      <Button variant="outline" onClick={() => setShowStaffModal(null)}>Close</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* New Ticket modal */}
              {showNewTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowNewTicket(false)} />
                  <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 animate-zoom-in">
                    <h3 className="text-lg font-semibold mb-3">Create Support Ticket</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Title</label>
                        <input value={newTicketTitle} onChange={(e)=>setNewTicketTitle(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-400" placeholder="e.g., Unable to access portal" />
                      </div>
                    </div>
                    <div className="mt-4 text-right flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={()=>setShowNewTicket(false)}>Cancel</Button>
                      <Button onClick={()=>{
                        const title = newTicketTitle.trim() || 'New Issue';
                        const t: SupportTicket = { id: `st-${Date.now()}`, title, category: 'Other', status: 'Open', updatedAt: new Date().toISOString() };
                        setTickets(prev=>[t,...prev]);
                        setShowNewTicket(false);
                      }}>Create</Button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          )}
        </div>
      </div>

      {/* Backend-integrated Modals */}
      <CreateStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSubmit={handleCreateStudent}
      />
      <CreateUserModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSubmit={handleCreateStaff}
      />
    </ProtectedRoute>
  );
}


