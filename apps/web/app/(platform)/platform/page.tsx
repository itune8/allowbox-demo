'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ProtectedRoute } from '../../../components/protected-route';
import { useAuth } from '../../../contexts/auth-context';
import { LineChart } from '../../../components/charts';
import { Button } from '@repo/ui/button';
import { ROLES, API_ENDPOINTS, env } from '@repo/config';
import { useRouter } from 'next/navigation';
import { getNotifications, markAllNotificationsRead, clearNotifications as apiClearNotifications, subscribeNotifications } from '../../../lib/notifications';
import { apiClient } from '../../../lib/api-client';
import { getSchools as storeGetSchools, setSchools as storeSetSchools, subscribe as storeSubscribe, getEntities as storeGetEntities, getSupportTickets, setSupportTickets } from '../../../lib/data-store';

type Section =
  | 'dashboard'
  | 'schools'
  | 'users'
  | 'finance'
  | 'reports'
  | 'support';

const sidebarItems: { key: Section; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'schools', label: 'Schools' },
  { key: 'users', label: 'User Management' },
  { key: 'finance', label: 'Finance & Billing' },
  { key: 'reports', label: 'Reports' },
  { key: 'support', label: 'Support' },
];

type BaseSchool = import('../../../lib/data-store').School;
type School = BaseSchool & { trend?: number; updatedAt?: number };

const overduePayments = [
  { id: 'inv-101', school: 'Riverside School', amount: 900, due: '2025-10-10' },
  { id: 'inv-102', school: 'Elmwood High', amount: 450, due: '2025-10-05' },
];

type StaffRole = 'user' | 'super_admin' | 'sales' | 'support' | 'finance';
type StaffUser = { name: string; email: string; role: StaffRole; createdAt: string; lastLogin?: string };
const dt = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString();
};
const initialStaff: StaffUser[] = [
  { name: 'Jane Alfredo', email: 'jane.alfredo@example.com', role: 'user', createdAt: dt(1), lastLogin: dt(0) },
  { name: 'Apple User', email: 'apple.user1@example.com', role: 'user', createdAt: dt(1), lastLogin: dt(2) },
  { name: 'Georges Asfahani', email: 'georges.asfahani@example.com', role: 'user', createdAt: dt(2), lastLogin: dt(4) },
  { name: 'Apple User', email: 'apple.user2@example.com', role: 'user', createdAt: dt(2), lastLogin: dt(7) },
  { name: 'Strida', email: 'strida@example.com', role: 'user', createdAt: dt(3), lastLogin: dt(3) },
  { name: 'Apple User', email: 'apple.user3@example.com', role: 'user', createdAt: dt(3), lastLogin: dt(9) },
  { name: 'Dylan', email: 'dylan@example.com', role: 'user', createdAt: dt(4), lastLogin: dt(1) },
  { name: 'Reem Saleh', email: 'reem.saleh@example.com', role: 'user', createdAt: dt(4), lastLogin: dt(5) },
  { name: 'Rita Ofieche', email: 'rita.ofieche@example.com', role: 'user', createdAt: dt(5), lastLogin: dt(10) },
  { name: 'Hamad Moussawi', email: 'hamad.moussawi@example.com', role: 'user', createdAt: dt(5), lastLogin: dt(2) },
];

export default function PlatformDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [active, setActive] = useState<Section>('dashboard');
  // Theme state (persisted)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [schools, setSchools] = useState<School[]>(storeGetSchools());
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [showEditSchool, setShowEditSchool] = useState<School | null>(null);
  const [showAssignAdmin, setShowAssignAdmin] = useState<School | null>(null);
  // Row actions dropdown state (Schools table)
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!openRowMenu) return;
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) {
        setOpenRowMenu(null);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenRowMenu(null);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [openRowMenu]);
  const [banner, setBanner] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  type Notification = { id: string; title: string; desc?: string; time: string; level: 'info' | 'warning' | 'danger'; read: boolean };
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>(initialStaff);
  const [userSearch, setUserSearch] = useState('');
  const [showColumns, setShowColumns] = useState(false);
  const [visibleCols, setVisibleCols] = useState({ name: true, email: true, role: true, createdAt: true, actions: true });
  // removed: previous radio selection state
  // Users table enhancements
  const [roleFilter, setRoleFilter] = useState<'' | StaffRole>('');
  const [userSortKey, setUserSortKey] = useState<'name' | 'role' | 'createdAt'>('name');
  const [userSortDir, setUserSortDir] = useState<'asc' | 'desc'>('asc');
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 10;
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState<StaffRole>('user');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<StaffUser | null>(null);
  const [showViewUser, setShowViewUser] = useState<StaffUser | null>(null);
  // Finance UI state
  const [revenueLoading] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [financeSchool, setFinanceSchool] = useState<School | null>(null);
  // Chart tab state
  const [chartTab, setChartTab] = useState<'overview' | 'revenue' | 'students' | 'events'>('overview');
  const chartTabs = ['overview','revenue','students','events'] as const;
  const activeChartIndex = chartTabs.indexOf(chartTab);

  // Support tickets state
  type TicketCategory = 'Hardware' | 'Software' | 'Billing' | 'Access' | 'Other';
  type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
  type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  type SupportTicket = {
    id: string;
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
    submitter: string;
    agentNotes?: string;
    files?: string[];
  };
  const initialTickets: SupportTicket[] = [
    {
      id: 't1',
      title: 'Invoice export not downloading',
      description: 'Export CSV button on Finance page does not download the file for some schools.',
      category: 'Software',
      priority: 'High',
      status: 'Open',
      createdAt: new Date(Date.now() - 1000*60*60*24*2).toISOString(),
      updatedAt: new Date(Date.now() - 1000*60*60*6).toISOString(),
      submitter: 'jane@allowbox.app',
      files: [],
    },
    {
      id: 't2',
      title: 'Parent cannot access Dashboard',
      description: 'Parent account reports 401 when navigating from login to /parent.',
      category: 'Access',
      priority: 'Urgent',
      status: 'In Progress',
      createdAt: new Date(Date.now() - 1000*60*60*48).toISOString(),
      updatedAt: new Date().toISOString(),
      submitter: 'support@allowbox.app',
      files: ['401-screenshot.png'],
      agentNotes: 'Investigating session vs remember-me mismatch.',
    },
    {
      id: 't3',
      title: 'MRR chart showing zero values',
      description: 'On the platform dashboard, Monthly Revenue shows 0 for some months despite paid invoices.',
      category: 'Software',
      priority: 'Medium',
      status: 'Resolved',
      createdAt: new Date(Date.now() - 1000*60*60*72).toISOString(),
      updatedAt: new Date(Date.now() - 1000*60*30).toISOString(),
      submitter: 'abi@allowbox.app',
      files: [],
      agentNotes: 'Fixed aggregation for paidAt month buckets.',
    },
  ];
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const persisted = getSupportTickets();
    if (persisted && persisted.length) return persisted;
    setSupportTickets(initialTickets);
    return initialTickets;
  });
  const [showTicket, setShowTicket] = useState<SupportTicket | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SupportTicket | null>(null);
  const [ticketSearch, setTicketSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<'' | TicketCategory>('');
  const [filterPriority, setFilterPriority] = useState<'' | TicketPriority>('');
  const [filterStatus, setFilterStatus] = useState<'' | TicketStatus>('');
  const [sortKey, setSortKey] = useState<'title' | 'updatedAt' | 'createdAt' | 'priority' | 'status'>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Hydration flag for skeleton loaders
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHydrated(true), 0); return () => clearTimeout(t); }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
      const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light';
      setTheme(initial);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', initial === 'dark');
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setSupportTickets(tickets);
  }, [tickets]);

  const priorityRank = useMemo<Record<TicketPriority, number>>(() => ({ Low: 1, Medium: 2, High: 3, Urgent: 4 }), []);
  const statusRank = useMemo<Record<TicketStatus, number>>(() => ({ Open: 1, 'In Progress': 2, Resolved: 3, Closed: 4 }), []);

  const filteredTickets = useMemo(() => {
    const q = ticketSearch.trim().toLowerCase();
  const list = tickets.filter((t) =>
      (!q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.submitter.toLowerCase().includes(q)) &&
      (!filterCategory || t.category === filterCategory) &&
      (!filterPriority || t.priority === filterPriority) &&
      (!filterStatus || t.status === filterStatus)
    );
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
        case 'updatedAt': cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); break;
        case 'priority': cmp = priorityRank[a.priority] - priorityRank[b.priority]; break;
        case 'status': cmp = statusRank[a.status] - statusRank[b.status]; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [tickets, ticketSearch, filterCategory, filterPriority, filterStatus, sortKey, sortDir, priorityRank, statusRank]);

  const pagedTickets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, page]);

  // Schools search state
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Schools table enhancements: filters, sorting, pagination, selection
  type StatusFilter = '' | 'Active' | 'Past Due' | 'Disabled';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [schoolSortKey, setSchoolSortKey] = useState<'students' | 'teachers' | 'mrr'>('students');
  const [schoolSortDir, setSchoolSortDir] = useState<'asc' | 'desc'>('desc');
  const [schoolsPage, setSchoolsPage] = useState(1);
  const schoolsPageSize = 10;
  type SchoolView = School & { plan: 'Free' | 'Premium' | 'Enterprise'; subscribed: string; renewal: string; admins: number; trend: number };
  const [selectedSchool, setSelectedSchool] = useState<SchoolView | null>(null);

  const totals = useMemo(() => {
    const count = schools.length;
    const students = schools.reduce((s, x) => s + x.students, 0);
    const mrr = schools.reduce((s, x) => s + x.mrr, 0);
    const activeCount = schools.filter((s) => s.status === 'Active').length;
    const inactive = count - activeCount;
    return { schools: count, students, mrr, active: activeCount, inactive };
  }, [schools]);

  // Build month labels for the last 5 months (abbr)
  const monthLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat('en', { month: 'short' });
    const arr: string[] = [];
    const d = new Date();
    for (let i = 4; i >= 0; i--) {
      const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
      arr.push(fmt.format(dt));
    }
    return arr;
  }, []);

  // Internal keys like 2025-10 for grouping
  const monthKeys = useMemo(() => {
    const d = new Date();
    const arr: string[] = [];
    for (let i = 4; i >= 0; i--) {
      const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
      arr.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
    }
    return arr;
  }, []);

  // Revenue trend: aggregate paid invoices by month across all schools.
  // Reliable fallback: if a month has no paid invoices, use sum of active schools' MRR for that month.
  const revenueTrend = useMemo(() => {
    const paidSums = new Map<string, number>();
    monthKeys.forEach((k) => paidSums.set(k, 0));
    try {
      for (const s of schools) {
        const entities = storeGetEntities(s.id);
        const allInvoices = Object.values(entities.invoices || {}).flat();
        for (const inv of allInvoices) {
          if (inv.status !== 'Paid' || !inv.paidAt) continue;
          const dt = new Date(inv.paidAt);
          if (Number.isNaN(dt.getTime())) continue;
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
          if (paidSums.has(key)) paidSums.set(key, (paidSums.get(key) || 0) + Math.max(0, inv.amount));
        }
      }
    } catch {
      // ignore: store may be empty in mock mode
    }
    // Baseline recurring revenue (active schools only)
    const baselineMRR = schools.filter((s) => s.status !== 'Disabled').reduce((sum, s) => sum + (s.mrr || 0), 0);
    const series = monthKeys.map((k) => {
      const paid = paidSums.get(k) || 0;
      return Math.round(paid > 0 ? paid : baselineMRR);
    });
    // If absolutely everything is zero (no schools), provide a minimal heuristic so chart doesn't vanish
    if (series.every((v) => v === 0)) {
      const heuristicBase = Math.max(1000, schools.length * 500, totals.students * 5);
      const base = totals.mrr > 0 ? totals.mrr : heuristicBase;
      const factors = [0.4, 0.6, 0.8, 0.9, 1.0];
      return factors.map((f) => Math.round(base * f));
    }
    return series;
  }, [schools, monthKeys, totals.mrr, totals.students]);

  // User growth: approximate growth of student count over months up to current total students
  const userGrowth = useMemo(() => {
    const t = Math.max(0, totals.students);
    const factors = [0.02, 0.1, 0.25, 0.6, 1.0];
    return factors.map((f) => Math.round(t * f));
  }, [totals.students]);

  // Enrich schools with additional fields for UI and compute filtered/sorted/paginated view
  const schoolsEnriched = useMemo<SchoolView[]>(() => {
    function toDateString(daysAgo: number) {
      const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().slice(0,10);
    }
    return schools.map((s) => {
      const plan: SchoolView['plan'] = s.mrr >= 4000 ? 'Enterprise' : s.mrr >= 2000 ? 'Premium' : 'Free';
      const seed = (s.id || s.name).split('').reduce((a,c)=>a+c.charCodeAt(0),0);
      const admins = Math.max(1, Math.round((s.teachers || 1) / 20));
      const subscribed = toDateString(120 + (seed % 200));
      const renewal = toDateString(- (30 + (seed % 60))); // days in future
      const trend = ((seed % 11) - 5); // -5..+5
      return { ...s, plan, subscribed, renewal, admins, trend };
    });
  }, [schools]);

  const schoolsFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return schoolsEnriched.filter((s) =>
      (!q || s.name.toLowerCase().includes(q)) && (!statusFilter || s.status === statusFilter)
    );
  }, [schoolsEnriched, searchQuery, statusFilter]);

  const schoolsSorted = useMemo(() => {
    const arr = [...schoolsFiltered];
    const key = schoolSortKey;
    arr.sort((a,b) => {
      const va = a[key]; const vb = b[key];
      const cmp = (va as number) - (vb as number);
      return schoolSortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [schoolsFiltered, schoolSortKey, schoolSortDir]);

  const schoolsView = useMemo(() => {
    const start = (schoolsPage - 1) * schoolsPageSize;
    return schoolsSorted.slice(start, start + schoolsPageSize);
  }, [schoolsSorted, schoolsPage]);

  function toggleSchoolSort(key: 'students' | 'teachers' | 'mrr') {
    setSchoolSortKey((prevKey) => {
      if (prevKey === key) {
        setSchoolSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prevKey;
      }
      setSchoolSortDir('desc');
      return key;
    });
  }

  const isSuperAdmin = (user?.roles || []).includes(ROLES.SUPER_ADMIN);

  function toggleSchoolStatus(id: string) {
    const current = storeGetSchools();
    const target = current.find((s) => s.id === id);
    if (!target) return;
    const newStatus: School['status'] = target.status === 'Disabled' ? 'Active' : 'Disabled';
    const normalizedName = target.name.trim().toLowerCase();
    const now = Date.now();
    const next = current.map((s) => (
      s.id === id || s.name.trim().toLowerCase() === normalizedName
        ? { ...s, status: newStatus, updatedAt: now }
        : s
    ));
    // Optimistic update
    setSchools(next);
    // Persist and then resync from normalized store
    storeSetSchools(next);
    setSchools(storeGetSchools());
    setBanner('School status updated');
    setTimeout(() => setBanner(null), 1500);
  }

  function saveSchoolEdit(updated: School) {
    setSchools((prev) => {
      const next = prev.map((s) => (s.id === updated.id ? { ...s, ...updated, updatedAt: Date.now() } : s));
      storeSetSchools(next);
      return next;
    });
    setShowEditSchool(null);
    setBanner('School details saved');
    setTimeout(() => setBanner(null), 1500);
  }

  function saveAssignAdmin(id: string, admin: string) {
    setSchools((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, assignedAdmin: admin, updatedAt: Date.now() } : s));
      storeSetSchools(next);
      return next;
    });
    setShowAssignAdmin(null);
    setBanner('Admin assigned');
    setTimeout(() => setBanner(null), 1500);
  }

  // Close profile menu on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Fetch notifications on mount and subscribe for live updates (mock or WS)
  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const list = await getNotifications();
      setNotifications(list);
      unsub = subscribeNotifications((n) => setNotifications((prev) => {
        if (prev.some((x) => x.id === n.id)) return prev; // guard against duplicate keys
        return [n, ...prev];
      }));
    })();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead().catch(() => {});
  };
  const clearAll = async () => {
    setNotifications([]);
    await apiClearNotifications().catch(() => {});
  };

  // removed old inline role saver in favor of modal-based editing

  const filteredStaff = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    let out = staff;
    if (q) out = out.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    if (roleFilter) out = out.filter((u) => u.role === roleFilter);
    out = [...out].sort((a, b) => {
      const dir = userSortDir === 'asc' ? 1 : -1;
      if (userSortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (userSortKey === 'role') return a.role.localeCompare(b.role) * dir;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    });
    return out;
  }, [staff, userSearch, roleFilter, userSortKey, userSortDir]);

  const userTotalPages = Math.max(1, Math.ceil(filteredStaff.length / userPageSize));
  const pagedUsers = useMemo(() => {
    const start = (userPage - 1) * userPageSize;
    return filteredStaff.slice(start, start + userPageSize);
  }, [filteredStaff, userPage]);

  function exportUsersCsv() {
    const header = ['Name','Email','Role','Created Date'];
    const rows = staff.map((u) => [u.name, u.email, u.role, new Date(u.createdAt).toLocaleString()]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `users-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    setBanner('Users exported'); setTimeout(() => setBanner(null), 1200);
  }

  // Helpers to keep numeric inputs clean (digits only, non-negative integers)
  const blockNonIntegerKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
    ];
    const isMetaCombo = e.metaKey || e.ctrlKey; // allow copy/paste/select-all shortcuts
    if (isMetaCombo) return;
    if (allowedKeys.includes(e.key)) return;
    // Block minus, plus, dot, exponent notation and any non-digits
    if (e.key === '-' || e.key === '+' || e.key === '.' || e.key.toLowerCase() === 'e') {
      e.preventDefault();
      return;
    }
    // Allow digits 0-9 only
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const sanitizeOnInput = (e: React.FormEvent<HTMLInputElement>) => {
    const t = e.currentTarget;
    t.value = t.value.replace(/\D+/g, '');
  };

  const blockNonDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (/\D/.test(text)) {
      e.preventDefault();
    }
  };

  const toNonNegativeInt = (val: FormDataEntryValue | null | undefined) => {
    const str = String(val ?? '').replace(/\D+/g, '');
    const n = parseInt(str, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  // Reflect updates from other portals via shared store
  useEffect(() => {
    const unsub = storeSubscribe(() => setSchools(storeGetSchools()));
    return unsub;
  }, []);

  return (
    <ProtectedRoute>
      {/* Background gradient + subtle ambient glows (login-style aesthetic) */}
      <div className={`min-h-screen flex relative transition-all duration-700 ${theme==='dark' ? 'text-white' : 'text-gray-900'}`}>
        {/* Animated ambient glows */}
        {theme === 'dark' ? (
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-indigo-600/10 via-transparent to-transparent blur-3xl animate-pulse-slow" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent blur-3xl top-1/3 left-1/4" />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-indigo-600/10 via-transparent to-transparent blur-3xl animate-pulse-slow" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent blur-3xl top-1/3 left-1/4" />
          </>
        )}
        {/* Foreground content wrapper */}
        <div className="relative z-10 flex w-full">
  {/* Sidebar */}
  <aside className="w-64 hidden md:flex md:flex-col sticky top-0 h-screen bg-gray-950/90 text-gray-300 backdrop-blur-md border-r border-gray-800 shadow-[0_8px_24px_rgba(0,0,0,0.25)] animate-slide-in-left">
          <div className="h-16 flex items-center px-6 border-b border-white/50 dark:border-gray-800">
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600">
              AllowBox
            </span>
          </div>
          <nav className="flex-1 py-4 overflow-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`group w-full flex items-center gap-3 text-left px-6 py-3 transition-all duration-300 ease-in-out transform rounded-r-xl border-l-4 ${
                  active === item.key
                    ? 'bg-indigo-600/20 text-white font-medium border-indigo-400'
                    : 'text-gray-300 border-transparent'
                } hover:bg-indigo-600/20 hover:text-white hover:pl-7 hover:-translate-y-0.5`}
              >
                <NavIcon label={item.label} active={active === item.key} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/50 dark:border-gray-800">
            <Button variant="outline" size="sm" onClick={logout} className="w-full hover:border-indigo-400 hover:text-indigo-700 ease-smooth">
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="bg-gray-950/60 text-gray-200 backdrop-blur-md shadow-sm sticky top-0 z-10 animate-slide-in-top border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Super Admin Dashboard
              </h1>
              <div className="flex items-center gap-3 relative" ref={profileRef}>
                <button
                  aria-label="Notifications"
                  className="relative p-2 rounded-full hover:bg-white/5 transition-all ease-smooth hover:rotate-12"
                  onClick={() => {
                    setShowNotifications((s) => !s);
                    setShowProfileMenu(false);
                  }}
                >
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-300 transition-transform ease-smooth">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                {showNotifications && (
                  <div className="absolute right-16 top-12 w-80 bg-white/95 backdrop-blur-md border rounded-md shadow-xl animate-zoom-in">
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                      <span className="text-sm font-medium text-gray-900">Notifications</span>
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-indigo-600 hover:underline" onClick={markAllRead}>Mark all read</button>
                        <button className="text-xs text-gray-500 hover:underline" onClick={clearAll}>Clear</button>
                      </div>
                    </div>
                    <ul className="max-h-72 overflow-auto divide-y">
                      {notifications.length === 0 && (
                        <li className="px-3 py-6 text-sm text-center text-gray-500">No notifications</li>
                      )}
                      {notifications.map((n) => (
                        <li key={n.id} className="px-3 py-2 text-sm hover:bg-gray-50 transition-colors ease-smooth">
                          <div className="flex items-start gap-2">
                            <span className={`mt-1 h-2 w-2 rounded-full ${n.level === 'danger' ? 'bg-red-500' : n.level === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className={`font-medium ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                                <span className="text-[11px] text-gray-500">{n.time}</span>
                              </div>
                              {n.desc && <p className="text-xs text-gray-600">{n.desc}</p>}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="px-3 py-2 border-t">
                      <button
                        className="w-full text-center text-sm text-indigo-600 hover:bg-indigo-50 py-1 rounded transition-colors ease-smooth"
                        onClick={() => {
                          setActive('dashboard');
                          setShowNotifications(false);
                        }}
                      >
                        View Alerts
                      </button>
                    </div>
                  </div>
                )}
                <button
                  className="flex items-center gap-2 rounded-full hover:bg-indigo-50 transition-all ease-smooth px-2 py-1 hover:scale-105"
                  onClick={() => setShowProfileMenu((s) => !s)}
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                    {user?.firstName?.[0] ?? 'A'}
                  </div>
                  <span className="text-sm text-gray-200 hidden sm:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                </button>
                {/* Dark mode toggle */}
                <button
                  className="ml-1 text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors ease-smooth"
                  title="Toggle dark mode"
                  onClick={() => {
                    if (typeof document !== 'undefined') {
                      setTheme((prev) => {
                        const next = prev === 'dark' ? 'light' : 'dark';
                        document.documentElement.classList.toggle('dark', next === 'dark');
                        try { localStorage.setItem('theme', next); } catch { /* ignore */ }
                        return next;
                      });
                    }
                  }}
                >
                  {hydrated ? (theme === 'dark' ? 'Light' : 'Dark') : 'Dark'}
                </button>
                {showProfileMenu && (
                    <div className="absolute right-0 top-12 w-48 bg-white/95 backdrop-blur border rounded-md shadow-xl animate-zoom-in">
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm text-gray-900 transition-colors ease-smooth"
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push('/auth/forgot_password');
                      }}
                    >
                      Reset Password
                    </button>
                    <div className="h-px bg-gray-100" />
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600 transition-colors ease-smooth"
                      onClick={async () => {
                        setShowProfileMenu(false);
                        await logout();
                        router.push('/auth/login');
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {!isSuperAdmin ? (
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4">
                You do not have permission to view this page.
              </div>
            </div>
          ) : (
            <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 text-gray-100">
              {banner && (
                <div className="mb-4 animate-fade-in">
                  <div className="bg-green-50 text-green-800 border border-green-200 px-4 py-2 rounded shadow-sm">{banner}</div>
                </div>
              )}
              {/* Animated section switcher via CSS classes */}
              {active === 'dashboard' && (
                <section className="animate-slide-in-top">
                  {/* Breadcrumb + Title */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-1">Home · Dashboard</div>
                    <h2 className="text-2xl font-semibold text-white mb-1 flex items-center gap-2">
                      Admin Dashboard
                      <span className="w-10 h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-gradientFlow"></span>
                    </h2>
                    <p className="text-sm text-gray-400">Comprehensive overview of your platform&apos;s performance</p>
                  </div>
                  {/* Gradient wrapper for dashboard content */}
                  <div className="relative rounded-2xl p-4 sm:p-6 mb-6 bg-gray-900/40 border border-gray-800 backdrop-blur-xl shadow-[0_0_20px_rgba(139,92,246,0.08)]">
                    <div className="pointer-events-none absolute -top-10 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" />
                    {/* KPI cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 animate-fade-in-600">
                      <StatCard title="Total Schools" value={totals.schools} color="blue" />
                      <StatCard title="Total Users" value={totals.students + schools.reduce((s, x) => s + x.teachers, 0)} color="purple" />
                      <StatCard title="Total Revenue" value={`$${totals.mrr.toLocaleString()}`} color="green" />
                      <StatCard title="Conversion Rate" value={`237%`} color="indigo" />
                    </div>

                    {/* Today metric pills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 animate-fade-in-600">
                      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 text-sm flex items-center justify-between shadow-[0_0_20px_rgba(139,92,246,0.08)] hover:shadow-[0_0_35px_rgba(139,92,246,0.25)] transition-all duration-500 ease-in-out transform hover:-translate-y-1">
                        <span className="text-gray-300">Today&apos;s Registrations</span>
                        <span className="font-semibold text-white">0</span>
                      </div>
                      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 text-sm flex items-center justify-between shadow-[0_0_20px_rgba(139,92,246,0.08)] hover:shadow-[0_0_35px_rgba(139,92,246,0.25)] transition-all duration-500 ease-in-out transform hover:-translate-y-1">
                        <span className="text-gray-300">Today&apos;s Revenue</span>
                        <span className="font-semibold text-emerald-600">$0.00</span>
                      </div>
                      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 text-sm flex items-center justify-between shadow-[0_0_20px_rgba(139,92,246,0.08)] hover:shadow-[0_0_35px_rgba(139,92,246,0.25)] transition-all duration-500 ease-in-out transform hover:-translate-y-1">
                        <span className="text-gray-300">Upcoming Events</span>
                        <span className="font-semibold text-indigo-600">3</span>
                      </div>
                      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 text-sm flex items-center justify-between shadow-[0_0_20px_rgba(139,92,246,0.08)] hover:shadow-[0_0_35px_rgba(139,92,246,0.25)] transition-all duration-500 ease-in-out transform hover:-translate-y-1">
                        <span className="text-gray-300">Pending Payments</span>
                        <span className="font-semibold text-amber-600">103</span>
                      </div>
                    </div>

                    {/* Tabs bar (interactive) */}
                    <div className="bg-white rounded-full border px-1 py-1 w-full max-w-md mb-6 relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                    <div className="grid grid-cols-4 text-xs text-gray-600 relative z-10">
                      {chartTabs.map((key) => (
                        <button
                          key={key}
                          onClick={() => setChartTab(key)}
                            className={`rounded-lg px-3 py-1.5 transition-all ease-smooth hover:bg-indigo-100 dark:hover:bg-gray-700 active:bg-indigo-200 ${chartTab === key ? 'text-gray-900 dark:text-gray-100' : 'dark:text-gray-300'}`}
                        >
                          {key === 'overview' ? 'Overview' : key === 'students' ? 'Students' : key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                      ))}
                    </div>
                    {/* Animated underline */}
                    <div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 rounded-full transition-transform duration-300 ease-out"
                      style={{ width: '25%', transform: `translateX(${activeChartIndex * 100}%)` }}
                    />
                  </div>

                  {/* Charts, driven by tab */}
                  {chartTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-600">
                      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-inner hover:shadow-[inset_0_0_0_rgba(0,0,0,0),0_0_35px_rgba(139,92,246,0.25)] transition-all duration-500 ease-in-out animate-fade-in-600 hover:-translate-y-1">
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-900 dark:text-gray-100">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18"/></svg>
                          <span className="font-medium">Monthly Revenue</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Monthly revenue</p>
                        {hydrated ? (
                          <BarChartDivs data={revenueTrend} labels={monthLabels} className="h-48" />
                        ) : (
                          <ChartSkeleton className="h-48" />
                        )}
                      </div>
                      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-inner hover:shadow-[inset_0_0_0_rgba(0,0,0,0),0_0_35px_rgba(139,92,246,0.25)] transition-all duration-500 ease-in-out animate-fade-in-600 hover:-translate-y-1">
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-900 dark:text-gray-100">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19l4-9 4 6 4-12"/></svg>
                          <span className="font-medium">Number of Students</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Students over time</p>
                        {hydrated ? (
                          <LineChart data={userGrowth} labels={monthLabels} className="w-full h-48" />
                        ) : (
                          <ChartSkeleton className="h-48" />
                        )}
                      </div>
                    </div>
                  )}

                  {chartTab === 'revenue' && (
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-inner hover:shadow-[inset_0_0_0_rgba(0,0,0,0),0_0_35px_rgba(139,92,246,0.25)] transition-all duration-500 ease-in-out animate-fade-in-600">
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-900">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18"/></svg>
                        <span className="font-medium">Monthly Revenue</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Monthly revenue</p>
                      {hydrated ? (
                        <BarChartDivs data={revenueTrend} labels={monthLabels} className="h-64" />
                      ) : (
                        <ChartSkeleton className="h-64" />
                      )}
                    </div>
                  )}

                  {chartTab === 'students' && (
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-inner hover:shadow-[inset_0_0_0_rgba(0,0,0,0),0_0_35px_rgba(139,92,246,0.25)] transition-all duration-500 ease-in-out animate-fade-in-600">
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-900">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19l4-9 4 6 4-12"/></svg>
                        <span className="font-medium">Number of Students</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">Students over time</p>
                      {hydrated ? (
                        <LineChart data={userGrowth} labels={monthLabels} className="w-full h-64" />
                      ) : (
                        <ChartSkeleton className="h-64" />
                      )}
                    </div>
                  )}
                  </div>

                  {chartTab === 'events' && (
                    <Placeholder title="Events analytics" />
                  )}
                </section>
              )}

              {active === 'schools' && (
                <section className="animate-slide-in-right">
                  {/* Section header with stats */}
                  <div className="mb-4 animate-fadeIn space-y-6 px-0">
                    <div className="flex items-center justify-between px-6">
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <span className="inline-flex w-4 h-4 items-center justify-center text-gray-400">
                          {/* Placeholder for Lucide School icon */}
                          <span className="block w-2 h-2 rounded-sm bg-gray-400"/>
                        </span>
                        Schools
                      </h2>
                      {/* Status legend */}
                      <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"/> Active</span>
                        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400"/> Past Due</span>
                        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400"/> Disabled</span>
                      </div>
                    </div>
                    {/* Summary cards grid */}
                    <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { label: 'Total Schools', value: schools.length.toLocaleString() },
                        { label: 'Total Active', value: schools.filter(s=>s.status==='Active').length.toLocaleString() },
                        { label: 'Total MRR', value: `$${schools.reduce((a,b)=>a+b.mrr,0).toLocaleString()}` },
                      ].map((c, i) => (
                        <div key={i} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 transition-all duration-300 ease-in-out hover:shadow-lg">
                          <div className="text-xs text-gray-600">{c.label}</div>
                          <div className="text-lg font-semibold text-gray-800">{c.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Controls row: search, chips, add/export */}
                  <div className="sticky top-16 z-[1] bg-transparent pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2 px-6">
                      <form
                        className="flex items-center gap-2 flex-1"
                        onSubmit={(e) => {
                          e.preventDefault();
                          setSearchQuery(searchInput);
                        }}
                      >
                        <div className="relative w-full max-w-sm">
                          <input
                            placeholder="Search schools"
                            className="w-full border border-gray-200 rounded-lg pl-9 pr-9 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200 ease-in-out hover:border-gray-300"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                          />
                          <span className="absolute left-3 top-2.5 text-gray-400">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                          </span>
                          {searchInput && (
                            <button type="button" className="absolute right-2 top-1.5 h-7 w-7 grid place-items-center text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-md" onClick={()=>{setSearchInput(''); setSearchQuery('');}}>×</button>
                          )}
                        </div>
                        <Button size="sm" type="submit" className="px-3 py-2 rounded-md border transition-all duration-200 ease-in-out hover:shadow-md">Search</Button>
                        {searchQuery && (
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            onClick={() => { setSearchInput(''); setSearchQuery(''); }}
                            className="px-3 py-2 rounded-md border transition-all duration-200 ease-in-out hover:shadow-md"
                          >
                            Clear
                          </Button>
                        )}
                      </form>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          type="button"
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm hover:shadow-md transition-all duration-200 ease-in-out rounded-md px-3 py-2"
                          onClick={() => setShowAddSchool(true)}
                        >
                          + Add School
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="px-3 py-2 rounded-md border transition-all duration-200 ease-in-out hover:shadow-md hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white"
                          onClick={() => {
                            const header = ['Name','Students','Teachers','Status','MRR'];
                            const rows = schools.map((s)=>[s.name,s.students,s.teachers,s.status,`$${s.mrr}`]);
                            const csv = [header,...rows].map(r=>r.join(',')).join('\n');
                            const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href=url; a.download=`schools-${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                            setBanner('Schools exported'); setTimeout(()=>setBanner(null), 1200);
                          }}
                        >
                          Download CSV
                        </Button>
                      </div>
                    </div>
                    {/* Quick filters */}
                    <div className="flex items-center gap-2 mb-3 px-6">
                      {(['All','Active','Past Due'] as const).map((lbl) => (
                        <button key={lbl}
                          className={`px-4 py-1 rounded-full text-sm transition-all duration-200 ease-in-out ${ (statusFilter==='' && lbl==='All') || statusFilter===lbl ? 'bg-indigo-100 text-indigo-600 font-medium border border-indigo-200' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                          onClick={() => {
                            if (lbl==='All') { setSearchQuery(''); }
                            setStatusFilter(lbl === 'All' ? '' : lbl);
                          }}
                        >{lbl}</button>
                      ))}
                    </div>
                  </div>

                  {/* Premium SaaS table */}
                  <div className="animate-fadeIn px-6">
                    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out overflow-hidden">
                      <div className="overflow-x-auto relative">
                        <table className="min-w-full text-sm md:table">
                          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          <tr>
                            <th className="px-4 py-3 text-left">
                              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-600">
                                <span className="w-4 h-4 rounded-sm bg-gray-300"/>
                                Name
                              </div>
                            </th>
                            <th className="px-4 py-3 text-left">
                              <button className="inline-flex items-center gap-2 group text-xs font-medium uppercase tracking-wide text-gray-600" onClick={() => toggleSchoolSort('students')}>
                                <span className="w-4 h-4 rounded-sm bg-gray-300"/> Students
                                <SortChevron active={schoolSortKey==='students'} dir={schoolSortDir} />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                              <button className="inline-flex items-center gap-2 group text-xs font-medium uppercase tracking-wide text-gray-600" onClick={() => toggleSchoolSort('teachers')}>
                                <span className="w-4 h-4 rounded-sm bg-gray-300"/> Teachers
                                <SortChevron active={schoolSortKey==='teachers'} dir={schoolSortDir} />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">
                              <button className="inline-flex items-center gap-2 group text-xs font-medium uppercase tracking-wide text-gray-600" onClick={() => toggleSchoolSort('mrr')}>
                                <span className="w-4 h-4 rounded-sm bg-gray-300"/> MRR
                                <SortChevron active={schoolSortKey==='mrr'} dir={schoolSortDir} />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-left">Plan</th>
                            <th className="px-4 py-3 text-left">Subscribed</th>
                            <th className="px-4 py-3 text-left">Renewal</th>
                            <th className="px-4 py-3 text-left">Admins</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                          </thead>
                          <tbody className="divide-y divide-transparent">
                          {schoolsView.length === 0 && (
                            <tr>
                              <td colSpan={10} className="px-4 py-10 text-center">
                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                                  <div className="text-sm">No Schools Found</div>
                                  <Button className="mt-2" onClick={()=>setShowAddSchool(true)}>+ Add School</Button>
                                </div>
                              </td>
                            </tr>
                          )}
                          {schoolsView.map((s, idx) => (
                            <tr
                              key={s.id}
                              onClick={() => setSelectedSchool(s)}
                              className="group even:bg-gray-50/60 dark:even:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out"
                              style={{ animationDelay: `${idx * 35}ms` }}
                            >
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                <div className="flex items-center gap-2">
                                  <span className="w-8 h-8 rounded-full bg-indigo-100 grid place-items-center text-indigo-700 font-semibold">{s.name.slice(0,1)}</span>
                                  <span>{s.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{s.students.toLocaleString()}</td>
                              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{s.teachers.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`${s.status==='Active' ? 'bg-green-100 text-green-700 border border-green-300' : s.status==='Past Due' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-gray-100 text-gray-600 border border-gray-300'} inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium`}>{s.status}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                <div className="flex items-center gap-1">
                                  <span>${s.mrr.toLocaleString()}</span>
                                  <span className={`${s.trend>=0 ? 'text-green-500' : 'text-red-500'} text-xs`}>{s.trend>=0 ? '▲' : '▼'} {Math.abs(s.trend)}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{s.plan}</td>
                              <td className="px-4 py-3 text-gray-600">{s.subscribed}</td>
                              <td className="px-4 py-3 text-gray-600">{s.renewal}</td>
                              <td className="px-4 py-3 text-gray-600">{s.admins}</td>
                              <td className="px-4 py-3 text-right relative">
                                <div className="inline-flex items-center justify-end">
                                  <button
                                    aria-label="Row actions"
                                    aria-haspopup="menu"
                                    aria-expanded={openRowMenu===s.id}
                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md border transition-colors duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onClick={(e)=>{ e.stopPropagation(); setOpenRowMenu(openRowMenu===s.id ? null : s.id); }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                                  </button>
                                </div>
                                {openRowMenu===s.id && (
                                  <div ref={rowMenuRef} className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 py-1 text-sm text-gray-700 dark:text-gray-200">
                                    <button
                                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                                      onClick={(e)=>{ e.stopPropagation(); setOpenRowMenu(null); setShowAssignAdmin(s); }}
                                    >Assign Admin</button>
                                    <button
                                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                                      onClick={(e)=>{ e.stopPropagation(); setOpenRowMenu(null); setShowEditSchool(s); }}
                                    >Edit</button>
                                    <button
                                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                                      onClick={(e)=>{ e.stopPropagation(); setOpenRowMenu(null); toggleSchoolStatus(s.id); }}
                                    >{s.status === 'Disabled' ? 'Enable' : 'Disable'}</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                          </tbody>
                          {schoolsView.length > 0 && (
                            <tfoot className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              <tr className="sticky bottom-0">
                                <td className="px-4 py-3 font-semibold">Totals</td>
                                <td className="px-4 py-3 font-semibold">{schoolsView.reduce((a,b)=>a+b.students,0).toLocaleString()}</td>
                                <td className="px-4 py-3 font-semibold">{schoolsView.reduce((a,b)=>a+b.teachers,0).toLocaleString()}</td>
                                <td className="px-4 py-3"/>
                                <td className="px-4 py-3 font-semibold">${schoolsView.reduce((a,b)=>a+b.mrr,0).toLocaleString()}</td>
                                <td colSpan={5}/>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                    {/* Pagination */}
                    <div className="flex justify-end gap-2 mt-4 text-sm">
                      <button className="border rounded-lg px-2 py-1 hover:bg-indigo-100 disabled:opacity-50" disabled={schoolsPage===1} onClick={()=>setSchoolsPage(p=>Math.max(1,p-1))}>Prev</button>
                      <button className="border rounded-lg px-2 py-1 hover:bg-indigo-100 disabled:opacity-50" disabled={schoolsPage*schoolsPageSize>=schoolsFiltered.length} onClick={()=>setSchoolsPage(p=>p+1)}>Next</button>
                    </div>
                  </div>

                  {/* Clicked row detail modal */}
                  {selectedSchool && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40" onClick={()=>setSelectedSchool(null)} />
                      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-zoom-in border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">{selectedSchool.name}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="text-gray-500">Students</span><div className="font-medium">{selectedSchool.students}</div></div>
                          <div><span className="text-gray-500">Teachers</span><div className="font-medium">{selectedSchool.teachers}</div></div>
                          <div><span className="text-gray-500">MRR</span><div className="font-medium">${selectedSchool.mrr}</div></div>
                          <div><span className="text-gray-500">Status</span><div className="font-medium">{selectedSchool.status}</div></div>
                          <div><span className="text-gray-500">Plan</span><div className="font-medium">{selectedSchool.plan}</div></div>
                          <div><span className="text-gray-500">Renewal</span><div className="font-medium">{selectedSchool.renewal}</div></div>
                        </div>
                        <div className="mt-4 text-right">
                          <Button variant="outline" onClick={()=>setSelectedSchool(null)}>Close</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {active === 'users' && (
                <section className="animate-slide-in-left">
                  {/* Breadcrumb + Title */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-1">Home · User Management · All Users</div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-500">View and manage all users in the system.</p>
                  </div>

                  {/* Card container */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 shadow-sm animate-fade-in">
                    {/* Unified toolbar */}
                    <div className="flex items-center justify-between gap-3 flex-wrap p-4 border-b">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Users Management</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Manage and monitor all registered users in the system</p>
                      </div>
                      <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                        <form className="relative flex-1" onSubmit={(e)=>e.preventDefault()}>
                          <input
                            className="w-full border dark:border-gray-700 rounded-md pl-9 pr-9 py-2 text-sm placeholder:text-gray-400 placeholder:dark:text-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            placeholder="Search by name, email..."
                            value={userSearch}
                            onChange={(e)=>{ setUserSearch(e.target.value); setUserPage(1); }}
                          />
                          <span className="absolute left-3 top-2.5 text-gray-400">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                          </span>
                          {userSearch && (
                            <button type="button" className="absolute right-2 top-1.5 h-7 w-7 grid place-items-center text-gray-400 hover:text-gray-600 rounded-md" onClick={()=>{ setUserSearch(''); setUserPage(1); }}>×</button>
                          )}
                        </form>
                        {/* Role filter dropdown */}
                        <div className="relative">
                          <button className="h-9 px-3 rounded-md border dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={()=>setShowRoleFilter(s=>!s)}>
                            Role: {roleFilter ? roleFilter.replace('_',' ') : 'All'}
                          </button>
                          {showRoleFilter && (
                            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-md shadow-lg z-10 p-2 text-sm">
                              {(['', 'user','super_admin','sales','support','finance'] as const).map((r)=> (
                                <button key={r||'all'} className={`w-full text-left px-2 py-1.5 rounded ${roleFilter===r ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`} onClick={()=>{ setRoleFilter(r as '' | StaffRole); setShowRoleFilter(false); setUserPage(1); }}>
                                  {r ? r.replace('_',' ') : 'All'}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button
                            className="h-9 px-3 rounded-md border dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => setShowExportMenu((s) => !s)}
                            title="Export"
                          >
                            Export
                          </button>
                          {showExportMenu && (
                            <div className="absolute right-0 top-10 w-44 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-md shadow-lg z-10 p-2 text-sm">
                              <button className="w-full text-left px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded" onClick={()=>{ exportUsersCsv(); setShowExportMenu(false); }}>CSV</button>
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <button
                            className="h-9 px-3 rounded-md border dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => setShowColumns((s) => !s)}
                            title="Columns"
                          >
                            Columns
                          </button>
                          {showColumns && (
                            <div className="absolute right-0 top-10 w-44 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-md shadow-lg z-10 p-2 text-sm">
                              {Object.entries(visibleCols).map(([k, v]) => (
                                <label key={k} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={v as boolean}
                                    onChange={(e) => setVisibleCols((prev) => ({ ...prev, [k]: e.target.checked }))}
                                  />
                                  <span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button className="h-9" onClick={() => setShowAddUser(true)}>+ Add User</Button>
                      </div>
                    </div>

                    {/* Bulk actions toolbar */}
                    {selectedEmails.size > 0 && (
                      <div className="p-3 flex items-center justify-between bg-indigo-50 text-indigo-700 border-b animate-fade-in">
                        <span className="text-sm">{selectedEmails.size} selected</span>
                        <div className="flex items-center gap-2">
                          <button className="h-8 px-3 rounded-md border text-sm hover:bg-gray-50" onClick={()=>{
                            setStaff(prev => prev.filter(u => !selectedEmails.has(u.email)));
                            setSelectedEmails(new Set());
                          }}>Delete</button>
                          <button className="h-8 px-3 rounded-md border text-sm hover:bg-gray-50" onClick={()=>{
                            setStaff(prev => prev.map(u => selectedEmails.has(u.email) ? { ...u, role: 'user' } : u));
                            setSelectedEmails(new Set());
                          }}>Change Role → User</button>
                          <button className="h-8 px-3 rounded-md border text-sm hover:bg-gray-50" onClick={()=>{
                            const header = ['Name','Email','Role','Created Date'];
                            const rows = staff.filter(u=>selectedEmails.has(u.email)).map((u)=>[u.name,u.email,u.role,new Date(u.createdAt).toLocaleString()]);
                            const csv = [header,...rows].map(r=>r.join(',')).join('\n');
                            const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
                            const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='users-selected.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                          }}>Export</button>
                        </div>
                      </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          <tr>
                            <th className="px-4 py-3 w-10 text-left"></th>
                            {visibleCols.name && (
                              <th className="px-4 py-3 text-left">
                                <button className={`inline-flex items-center gap-1 ${userSortKey==='name' ? 'text-indigo-600 font-semibold' : ''}`} onClick={()=>{ setUserSortDir(d=> userSortKey==='name' ? (d==='asc'?'desc':'asc') : 'asc'); setUserSortKey('name'); }}>
                                  Name <SortIcon active={userSortKey==='name'} dir={userSortKey==='name'?userSortDir:'asc'} />
                                </button>
                              </th>
                            )}
                            {visibleCols.email && <th className="px-4 py-3 text-left">Email</th>}
                            {visibleCols.role && (
                              <th className="px-4 py-3 text-left">
                                <button className={`inline-flex items-center gap-1 ${userSortKey==='role' ? 'text-indigo-600 font-semibold' : ''}`} onClick={()=>{ setUserSortDir(d=> userSortKey==='role' ? (d==='asc'?'desc':'asc') : 'asc'); setUserSortKey('role'); }}>
                                  Role <SortIcon active={userSortKey==='role'} dir={userSortKey==='role'?userSortDir:'asc'} />
                                </button>
                              </th>
                            )}
                            {visibleCols.createdAt && (
                              <th className="px-4 py-3 text-left">
                                <button className={`inline-flex items-center gap-1 ${userSortKey==='createdAt' ? 'text-indigo-600 font-semibold' : ''}`} onClick={()=>{ setUserSortDir(d=> userSortKey==='createdAt' ? (d==='asc'?'desc':'asc') : 'asc'); setUserSortKey('createdAt'); }}>
                                  Created Date <SortIcon active={userSortKey==='createdAt'} dir={userSortKey==='createdAt'?userSortDir:'asc'} />
                                </button>
                              </th>
                            )}
                            <th className="px-4 py-3 text-left">Last Login</th>
                            {visibleCols.actions && <th className="px-4 py-3 text-left">Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {pagedUsers.map((u) => {
                            const isActive = u.lastLogin ? (Date.now() - new Date(u.lastLogin).getTime()) < 1000*60*60*24*3 : false;
                            return (
                              <tr key={u.email} className="border-t dark:border-gray-800 even:bg-gray-50 hover:bg-indigo-50 dark:even:bg-gray-800/60 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md">
                                <td className="px-4 py-3 first:rounded-l-lg">
                                  <input
                                    aria-label={`Select ${u.name}`}
                                    type="checkbox"
                                    checked={selectedEmails.has(u.email)}
                                    onChange={(e) => {
                                      setSelectedEmails(prev => {
                                        const next = new Set(prev);
                                        if (e.target.checked) next.add(u.email); else next.delete(u.email);
                                        return next;
                                      });
                                    }}
                                    className="accent-indigo-600"
                                  />
                                </td>
                                {visibleCols.name && (
                                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                    <div className="flex items-center gap-2">
                                      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white grid place-items-center text-xs font-semibold transition-transform duration-300 group-hover:scale-110">{u.name.slice(0,1)}</span>
                                      <span className="inline-flex items-center gap-2">
                                        <span>{u.name}</span>
                                        <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-300'}`} />
                                      </span>
                                    </div>
                                  </td>
                                )}
                                {visibleCols.email && <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{u.email}</td>}
                                {visibleCols.role && (
                                  <td className="px-4 py-3">
                                    {editingEmail === u.email ? (
                                      <div className="flex items-center gap-2">
                                        <select value={roleDraft} onChange={(e)=>setRoleDraft(e.target.value as StaffRole)} className="border border-gray-200 rounded-lg text-sm px-2 py-1 focus:ring-2 focus:ring-indigo-400">
                                          {(['user','super_admin','sales','support','finance'] as const).map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
                                        </select>
                                        <button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={()=>{ setStaff(prev => prev.map(x => x.email===u.email ? { ...x, role: roleDraft } : x)); setEditingEmail(null);} }>Save</button>
                                        <button className="text-xs px-2 py-1 rounded border hover:bg-gray-50" onClick={()=> setEditingEmail(null)}>Cancel</button>
                                      </div>
                                    ) : (
                                      <button className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border ${roleBadgeClass(u.role)}`} onClick={()=>{ setEditingEmail(u.email); setRoleDraft(u.role); }}>
                                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70"></span>
                                        {u.role.replace('_',' ')}
                                      </button>
                                    )}
                                  </td>
                                )}
                                {visibleCols.createdAt && (
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300" title="Added by Admin">
                                    {formatDateTime(u.createdAt)}
                                  </td>
                                )}
                                <td className="px-4 py-3 text-gray-500">{u.lastLogin ? timeAgo(u.lastLogin) : '—'}</td>
                                {visibleCols.actions && (
                                  <td className="px-4 py-3 last:rounded-r-lg">
                                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                      <button title="View" onClick={() => setShowViewUser(u)} className="transition-transform duration-200 ease-in-out hover:text-indigo-500 hover:scale-110">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                      </button>
                                      <button title="Edit" onClick={() => setShowEditUser(u)} className="transition-transform duration-200 ease-in-out hover:text-green-500">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M14.06 4.94l3.75 3.75"/></svg>
                                      </button>
                                      <button title="Delete" onClick={() => setStaff((prev) => prev.filter((x) => x.email !== u.email))} className="transition-transform duration-200 ease-in-out hover:text-red-500">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                          {filteredStaff.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-6 text-center text-gray-600">No users found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className="p-4 flex items-center justify-end gap-2 text-sm">
                      <button className="border rounded-lg px-3 py-1 hover:bg-indigo-100 disabled:opacity-50" disabled={userPage===1} onClick={()=>setUserPage(p=>Math.max(1,p-1))}>Prev</button>
                      {Array.from({length: userTotalPages}).slice(0,5).map((_,i)=>{
                        const page = i+1; return (
                          <button key={page} className={`rounded-lg px-3 py-1 ${userPage===page ? 'bg-indigo-500 text-white' : 'border hover:bg-indigo-100'}`} onClick={()=>setUserPage(page)}>{page}</button>
                        );
                      })}
                      <button className="border rounded-lg px-3 py-1 hover:bg-indigo-100 disabled:opacity-50" disabled={userPage===userTotalPages} onClick={()=>setUserPage(p=>Math.min(userTotalPages,p+1))}>Next</button>
                    </div>
                  </div>

                  {/* View User modal */}
                  {showViewUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40" onClick={() => setShowViewUser(null)} />
                      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-6 animate-zoom-in">
                        <h3 className="text-lg font-semibold mb-3">User Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between"><span className="text-gray-600">Name</span><span className="font-medium text-gray-900">{showViewUser.name}</span></div>
                          <div className="flex items-center justify-between"><span className="text-gray-600">Email</span><span className="font-medium text-gray-900">{showViewUser.email}</span></div>
                          <div className="flex items-center justify-between"><span className="text-gray-600">Role</span><span className="font-medium text-gray-900">{showViewUser.role}</span></div>
                          <div className="flex items-center justify-between"><span className="text-gray-600">Created</span><span className="font-medium text-gray-900">{formatDateTime(showViewUser.createdAt)}</span></div>
                        </div>
                        <div className="mt-4 text-right">
                          <Button variant="outline" onClick={() => setShowViewUser(null)}>Close</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add User modal */}
                  {showAddUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddUser(false)} />
                      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-zoom-in">
                        <h3 className="text-lg font-semibold mb-4">Add User</h3>
                        <form
                          className="space-y-3"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget as HTMLFormElement);
                            const name = String(fd.get('name') || '').trim();
                            const email = String(fd.get('email') || '').trim();
                            const role = String(fd.get('role') || 'support') as StaffRole;
                            if (!name || !email) return;
                            setStaff((prev) => [{ name, email, role, createdAt: new Date().toISOString() }, ...prev]);
                            setShowAddUser(false);
                            setBanner('User added'); setTimeout(() => setBanner(null), 1200);
                          }}
                        >
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                            <input name="name" required className="w-full border rounded-md px-3 py-2 text-sm" placeholder="e.g., Jane Alfredo" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Email</label>
                            <input name="email" type="email" required className="w-full border rounded-md px-3 py-2 text-sm" placeholder="name@company.com" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Role</label>
                            <select name="role" defaultValue="user" className="w-full border rounded-md px-3 py-2 text-sm">
                              <option value="user">User</option>
                              <option value="super_admin">Super Admin</option>
                              <option value="sales">Sales</option>
                              <option value="support">Support</option>
                              <option value="finance">Finance</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Edit User modal */}
                  {showEditUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40" onClick={() => setShowEditUser(null)} />
                      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-zoom-in">
                        <h3 className="text-lg font-semibold mb-4">Edit User</h3>
                        <form
                          className="space-y-3"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget as HTMLFormElement);
                            const name = String(fd.get('name') || '').trim();
                            const role = String(fd.get('role') || showEditUser.role) as StaffRole;
                            setStaff((prev) => prev.map((u) => (u.email === showEditUser.email ? { ...u, name: name || u.name, role } : u)));
                            setShowEditUser(null);
                            setBanner('User updated'); setTimeout(() => setBanner(null), 1200);
                          }}
                        >
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                            <input name="name" defaultValue={showEditUser.name} className="w-full border rounded-md px-3 py-2 text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Email</label>
                            <input value={showEditUser.email} readOnly className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Role</label>
                            <select name="role" defaultValue={showEditUser.role} className="w-full border rounded-md px-3 py-2 text-sm">
                              <option value="user">User</option>
                              <option value="super_admin">Super Admin</option>
                              <option value="sales">Sales</option>
                              <option value="support">Support</option>
                              <option value="finance">Finance</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowEditUser(null)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {active === 'finance' && (
                <section className="animate-slide-in-bottom">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Finance & Billing</h2>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {/* Revenue per School */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-300 ease-in-out">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">Revenue per School</h3>
                        {/* Legend */}
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3">
                          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"/> Active Revenue</span>
                          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"/> Overdue</span>
                        </div>
                      </div>
                      {revenueLoading ? (
                        <div className="space-y-2">
                          <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded" />
                          <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded" />
                          <div className="h-4 w-5/6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded" />
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                          {(() => {
                            const total = Math.max(1, schools.reduce((a,b) => a + (b.mrr||0), 0));
                            const overdueMap = new Map(overduePayments.map(o => [o.school, true] as const));
                            return schools.map((s) => {
                              const share = Math.round(((s.mrr||0) / total) * 100);
                              const isOverdue = overdueMap.has(s.name);
                              const trend = s.trend ?? 0;
                              const lastPaid = formatMonthYear(new Date(s.updatedAt ?? Date.now()));
                              return (
                                <li key={s.id} className="py-3 px-4">
                                  <div
                                    className="flex items-center justify-between cursor-pointer rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out hover:text-gray-900 dark:hover:text-gray-100"
                                    onClick={() => setFinanceSchool(s)}
                                  >
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                      <span className={`h-2 w-2 rounded-full ${isOverdue ? 'bg-amber-400' : 'bg-green-400'}`} />
                                      <span className={`${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>{s.name}</span>
                                      {isOverdue && (
                                        <span className="ml-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full px-2 py-0.5 text-[10px]">Overdue</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                      <span className="font-medium">${s.mrr.toLocaleString()}/mo</span>
                                      <span className={`${trend >= 0 ? 'text-green-500' : 'text-red-500'} text-xs font-medium inline-flex items-center gap-1`}>
                                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                                      </span>
                                    </div>
                                  </div>
                                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-1">
                                    <div className="h-1.5 bg-indigo-500 rounded-full transition-all duration-700 ease-in-out" style={{ width: `${share}%` }}></div>
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last Payment: {lastPaid}</div>
                                </li>
                              );
                            });
                          })()}
                          {/* Total row */}
                          <li className="pt-2 mt-2 px-4">
                            <div className="border-t border-gray-200 dark:border-gray-800 pt-2 text-gray-800 dark:text-gray-100 font-semibold flex items-center justify-between">
                              <span>Total Revenue</span>
                              <span>${schools.reduce((a,b)=>a+(b.mrr||0),0).toLocaleString()}/mo</span>
                            </div>
                          </li>
                        </ul>
                      )}
                    </div>

                    {/* Overdue Payments */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-300 ease-in-out">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">Overdue Payments</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Total Overdue: ${overduePayments.reduce((a,b)=>a+b.amount,0).toLocaleString()}</div>
                      <ul className="space-y-2 text-sm">
                        {overduePayments.map((o) => (
                          <li key={o.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-amber-400" />
                              <span className="text-gray-900 dark:text-gray-100">{o.school}</span>
                            </div>
                            <span className="group relative whitespace-nowrap text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full font-medium hover:shadow-sm hover:bg-yellow-200 dark:hover:bg-yellow-800/40 transition-colors">
                              ${o.amount}
                              <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 text-white text-xs px-2 py-1 rounded-md">Pending since {formatMonthYear(new Date(o.due))}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          className="bg-indigo-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-indigo-700 transition-all ease-in-out duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                          onClick={() => setShowDownloadConfirm(true)}
                        >
                          Download Financial Report
                        </button>
                        <button
                          className="border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2 transition-all"
                          onClick={() => router.push('/platform/invoices')}
                        >
                          View Invoices
                        </button>
                        <button
                          className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-800/40 rounded-lg px-4 py-2 transition-all"
                          onClick={async () => {
                            try {
                              const payload = { type: 'payment_reminder', schools: overduePayments.map((o) => o.school) };
                              if (env.useApiMocks) {
                                // Simulate success
                                setBanner('Reminders sent'); setTimeout(()=>setBanner(null), 1500);
                              } else {
                                await apiClient.post(API_ENDPOINTS.NOTIFICATIONS, payload);
                                setBanner('Reminders sent'); setTimeout(()=>setBanner(null), 1500);
                              }
                            } catch {
                              setBanner('Failed to send reminders'); setTimeout(()=>setBanner(null), 1500);
                            }
                          }}
                        >
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary mini-card */}
                  <div className="mt-6 grid grid-cols-1">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 flex flex-col gap-2">
                      <div className="flex items-center justify-between"><span>Total Revenue</span><span className="font-semibold text-gray-900 dark:text-gray-100">${schools.reduce((a,b)=>a+(b.mrr||0),0).toLocaleString()}</span></div>
                      <div className="flex items-center justify-between"><span>Total Overdue</span><span className="font-semibold text-gray-900 dark:text-gray-100">${overduePayments.reduce((a,b)=>a+b.amount,0).toLocaleString()}</span></div>
                      <div className="flex items-center justify-between"><span>Active Schools</span><span className="font-semibold text-gray-900 dark:text-gray-100">{schools.filter(s=>s.status==='Active').length}</span></div>
                    </div>
                  </div>
                </section>
              )}

              {active === 'reports' && (
                <Placeholder title="Reports" />
              )}
              {active === 'support' && (
                <section className="animate-fade-in">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-1">Home · Support</div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Support</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and resolve platform support tickets.</p>
                  </div>

                  {/* Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                    {(([ 
                      { label: 'Total', value: filteredTickets.length, class: 'text-indigo-600' },
                      { label: 'Open', value: filteredTickets.filter(t=>t.status==='Open').length, class: 'text-indigo-600' },
                      { label: 'In Progress', value: filteredTickets.filter(t=>t.status==='In Progress').length, class: 'text-yellow-500' },
                      { label: 'Resolved', value: filteredTickets.filter(t=>t.status==='Resolved').length, class: 'text-green-600' },
                      { label: 'Closed', value: filteredTickets.filter(t=>t.status==='Closed').length, class: 'text-gray-500' },
                    ] as const)).map((c, i) => (
                      <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{c.label}</div>
                        <div className={`text-lg font-semibold ${c.class}`}>{c.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tickets card */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all ease-in-out duration-300 animate-fade-in">
                    <div className="px-6 pt-4">
                      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 rounded-full animate-pulse" />
                    </div>
                    <div className="p-5 border-b flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Open Tickets</h3>
                        <div className="text-xs text-gray-400 italic">Last updated: {formatDateTime(new Date().toISOString())}</div>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg px-4 py-2 hover:opacity-90 transition-all ease-in-out duration-200 shadow-sm active:scale-[0.97]" onClick={() => {
                        const t = {
                          id: `t-${Date.now()}`,
                          title: 'New Issue',
                          description: '',
                          category: 'Other' as const,
                          priority: 'Low' as const,
                          status: 'Open' as const,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          submitter: user?.email || 'support@allowbox.app',
                          files: [],
                        };
                        setTickets((prev) => [t, ...prev]);
                        setShowTicket(t);
                      }}>+ New Ticket</Button>
                    </div>
                    {/* Filters toolbar */}
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-3 items-center">
                      <div className="relative flex-1 min-w-[240px]">
                        <input
                          className="h-10 w-full border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-8 text-sm placeholder:text-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
                          placeholder="Search title, description, submitter"
                          value={ticketSearch}
                          onChange={(e) => setTicketSearch(e.target.value)}
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                        </span>
                        {ticketSearch && (
                          <button className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500" onClick={()=>setTicketSearch('')}>×</button>
                        )}
                      </div>
                      <select className={`h-10 px-4 text-sm rounded-lg border ${filterCategory? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'} hover:bg-gray-50 dark:hover:bg-gray-800 transition-all`} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as TicketCategory | '')}>
                        <option value="">All Categories</option>
                        {(['Hardware','Software','Billing','Access','Other'] as const).map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select className={`h-10 px-4 text-sm rounded-lg border ${filterPriority? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'} hover:bg-gray-50 dark:hover:bg-gray-800 transition-all`} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TicketPriority | '')}>
                        <option value="">All Priorities</option>
                        {(['Low','Medium','High','Urgent'] as const).map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <div className="flex gap-2 items-center">
                        <select className={`h-10 px-4 text-sm rounded-lg border ${filterStatus? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'} hover:bg-gray-50 dark:hover:bg-gray-800 transition-all`} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TicketStatus | '')}>
                          <option value="">All Statuses</option>
                          {(['Open','In Progress','Resolved','Closed'] as const).map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="h-10 px-4 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all" onClick={() => { setTicketSearch(''); setFilterCategory(''); setFilterPriority(''); setFilterStatus(''); }}>Clear</button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm hidden md:table">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300 text-xs tracking-wide uppercase border-b border-gray-100 dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left">
                              <button
                                className={`inline-flex items-center gap-1 ${sortKey==='title' ? 'text-indigo-600 font-semibold' : ''}`}
                                onClick={() => {
                                  setSortKey('title');
                                  setSortDir((d) => (sortKey === 'title' ? (d === 'asc' ? 'desc' : 'asc') : 'asc'));
                                }}
                              >
                                Title <SortIcon active={sortKey==='title'} dir={sortKey==='title'?sortDir:'asc'} />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-left">Category</th>
                            <th className="px-4 py-3 text-left">
                              <button
                                className={`inline-flex items-center gap-1 ${sortKey==='priority' ? 'text-indigo-600 font-semibold' : ''}`}
                                onClick={() => {
                                  setSortKey('priority');
                                  setSortDir((d) => (sortKey === 'priority' ? (d === 'asc' ? 'desc' : 'asc') : 'asc'));
                                }}
                              >
                                Priority <SortIcon active={sortKey==='priority'} dir={sortKey==='priority'?sortDir:'asc'} />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                              <button
                                className={`inline-flex items-center gap-1 ${sortKey==='status' ? 'text-indigo-600 font-semibold' : ''}`}
                                onClick={() => {
                                  setSortKey('status');
                                  setSortDir((d) => (sortKey === 'status' ? (d === 'asc' ? 'desc' : 'asc') : 'asc'));
                                }}
                              >
                                Status <SortIcon active={sortKey==='status'} dir={sortKey==='status'?sortDir:'asc'} />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-right">
                              <button
                                className={`inline-flex items-center gap-1 ${sortKey==='updatedAt' ? 'text-indigo-600 font-semibold' : ''}`}
                                onClick={() => {
                                  setSortKey('updatedAt');
                                  setSortDir((d) => (sortKey === 'updatedAt' ? (d === 'asc' ? 'desc' : 'asc') : 'asc'));
                                }}
                              >
                                Date <SortIcon active={sortKey==='updatedAt'} dir={sortKey==='updatedAt'?sortDir:'asc'} />
                              </button>
                            </th>
                            <th className="px-4 py-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900">
                          {(!hydrated ? Array.from({length: Math.min(4, pageSize)}).map((_, idx) => (
                            <tr key={`sk-${idx}`} className="border-b border-gray-100 dark:border-gray-800 last:border-none">
                              <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                            </tr>
                          )) : pagedTickets.map((t, idx) => (
                            <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800 last:border-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ease-in-out animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                              <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">{t.title}</td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{t.category}</td>
                              <td className="px-4 py-3">
                                <span className={`${priorityBadgeClass(t.priority)} px-3 py-1 rounded-full text-xs font-medium capitalize`}>{t.priority}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`${statusBadgeClass(t.status)} px-3 py-1 rounded-full text-xs font-medium capitalize hover:shadow-sm transition-all`}>{t.status}</span>
                              </td>
                              <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{formatDateTime(t.updatedAt)}</td>
                              <td className="px-4 py-3">
                                <div className="relative flex items-center justify-end gap-3 text-gray-400 dark:text-gray-500">
                                  <button title="Edit" onClick={() => setShowTicket(t)} className="hover:text-indigo-500 transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M14.06 4.94l3.75 3.75"/></svg>
                                  </button>
                                  <button title="Delete" onClick={() => setConfirmDelete(t)} className="hover:text-indigo-500 transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )))}
                          {filteredTickets.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-12">
                                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                  <div className="text-4xl mb-2">📩</div>
                                  <div>No support tickets yet.</div>
                                  <Button className="mt-3" onClick={() => {
                                    const t = { id: `t-${Date.now()}`, title: 'New Issue', description: '', category: 'Other' as const, priority: 'Low' as const, status: 'Open' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), submitter: user?.email || 'support@allowbox.app', files: [] };
                                    setTickets([t]); setShowTicket(t);
                                  }}>Create New Ticket</Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {/* Mobile cards */}
                      <div className="md:hidden p-4 space-y-3">
                        {pagedTickets.map((t, idx) => (
                          <div key={t.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all animate-fade-in" style={{ animationDelay: `${idx*40}ms` }}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-semibold text-gray-800 dark:text-gray-100">{t.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(t.updatedAt)}</div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t.category}</div>
                            <div className="flex items-center justify-between">
                              <span className={`${priorityBadgeClass(t.priority)} px-3 py-1 rounded-full text-xs font-medium capitalize`}>{t.priority}</span>
                              <span className={`${statusBadgeClass(t.status)} px-3 py-1 rounded-full text-xs font-medium capitalize`}>{t.status}</span>
                            </div>
                            <div className="mt-3 flex items-center justify-end gap-3 text-gray-400 dark:text-gray-500">
                              <button title="Edit" onClick={() => setShowTicket(t)} className="hover:text-indigo-500 transition-all duration-200 ease-in-out">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M14.06 4.94l3.75 3.75"/></svg>
                              </button>
                              <button title="Delete" onClick={() => setConfirmDelete(t)} className="hover:text-indigo-500 transition-all duration-200 ease-in-out">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Loading indicator bar for filters */}
                    <div className="px-6"><div className="h-[2px] w-full bg-indigo-500/40 animate-pulse" /></div>
                    {/* Pagination */}
                    <div className="p-5 flex items-center justify-end gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <button className="border rounded-md px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 disabled:opacity-50 transition-all" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                      <button className="border rounded-md px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 disabled:opacity-50 transition-all" disabled={page * pageSize >= filteredTickets.length} onClick={() => setPage((p) => p + 1)}>Next</button>
                    </div>
                    {/* Trend bar */}
                    <div className="px-6 pb-5">
                      {(() => {
                        const total = Math.max(1, filteredTickets.length);
                        const w = (n: number) => `${Math.round((n/total)*100)}%`;
                        const o = filteredTickets.filter(t=>t.status==='Open').length;
                        const ip = filteredTickets.filter(t=>t.status==='In Progress').length;
                        const r = filteredTickets.filter(t=>t.status==='Resolved').length;
                        const c = filteredTickets.filter(t=>t.status==='Closed').length;
                        return (
                          <div className="flex gap-1 mt-2 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500" style={{ width: w(o) }} />
                            <div className="bg-yellow-400" style={{ width: w(ip) }} />
                            <div className="bg-green-500" style={{ width: w(r) }} />
                            <div className="bg-gray-300 dark:bg-gray-700" style={{ width: w(c) }} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Edit Ticket Modal */}
                  {showTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40" onClick={() => setShowTicket(null)} />
                      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 animate-zoom-in border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{showTicket.title || 'New Issue'}</h3>
                          <button onClick={() => setShowTicket(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form
                          className="space-y-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget as HTMLFormElement);
                            const fileEntries = fd.getAll('files') as (File | string)[];
                            const filesArray = fileEntries.map((f) => (typeof f === 'string' ? f : (f && 'name' in f ? (f as File).name : 'file'))).filter(Boolean) as string[];
                            setTickets((prev) => prev.map((x) => x.id === showTicket.id ? {
                              ...x,
                              title: String(fd.get('title') || x.title),
                              description: String(fd.get('description') || ''),
                              category: String(fd.get('category') || x.category) as TicketCategory,
                              priority: String(fd.get('priority') || x.priority) as TicketPriority,
                              status: String(fd.get('status') || x.status) as TicketStatus,
                              updatedAt: new Date().toISOString(),
                              agentNotes: String(fd.get('agentNotes') || ''),
                              files: filesArray.length ? filesArray : x.files,
                            } : x));
                            // persistence handled by tickets->store effect
                            setShowTicket(null);
                            setBanner('Ticket saved'); setTimeout(() => setBanner(null), 1200);
                          }}
                        >
                          {/* Dates */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Date Submitted</label>
                              <input className="w-full rounded-md px-3 py-2 text-sm bg-white border border-gray-300 text-gray-900 shadow-sm" value={formatDateTime(showTicket.createdAt)} readOnly />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Date Updated</label>
                              <input className="w-full rounded-md px-3 py-2 text-sm bg-white border border-gray-300 text-gray-900 shadow-sm" value={formatDateTime(showTicket.updatedAt)} readOnly />
                            </div>
                          </div>

                          {/* Category */}
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Issue Category</label>
                            <select name="category" defaultValue={showTicket.category} className="w-full border rounded-md px-3 py-2 text-sm">
                              {(['Hardware','Software','Billing','Access','Other'] as const).map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Description</label>
                            <textarea name="description" defaultValue={showTicket.description} className="w-full h-28 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ease-smooth" placeholder="Describe the issue..." />
                          </div>

                          {/* Priority / Status */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Priority</label>
                              <select name="priority" defaultValue={showTicket.priority} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ease-smooth">
                                {(['Low','Medium','High','Urgent'] as const).map((p) => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Status</label>
                              <select name="status" defaultValue={showTicket.status} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ease-smooth">
                                {(['Open','In Progress','Resolved','Closed'] as const).map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          </div>

                          {/* Files */}
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Files</label>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 w-full border rounded-md px-3 py-2 text-sm bg-white text-gray-800">
                                {showTicket.files?.length ? showTicket.files.join(', ') : 'No files added'}
                              </div>
                              <input name="files" type="file" multiple className="text-sm" />
                            </div>
                          </div>

                          {/* Submitter */}
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Submitter</label>
                            <input className="w-full border rounded-md px-3 py-2 text-sm bg-white text-gray-900" value={showTicket.submitter} readOnly />
                          </div>

                          {/* Agent Notes */}
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Agent Notes</label>
                            <textarea name="agentNotes" defaultValue={showTicket.agentNotes} className="w-full h-28 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ease-smooth" placeholder="Notes..." />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowTicket(null)} className="transition-all ease-smooth hover:-translate-y-0.5">Cancel</Button>
                            <Button type="submit" className="bg-black text-white hover:opacity-90 transition-all ease-smooth hover:-translate-y-0.5">Save</Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                  {/* Delete confirmation modal */}
                  {confirmDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(null)} />
                      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-zoom-in border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete ticket?</h3>
                        <p className="text-sm text-gray-600 mb-4">This action cannot be undone. The ticket “{confirmDelete.title}” will be permanently removed.</p>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                          <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => {
                            setTickets(prev => prev.filter(x => x.id !== confirmDelete.id));
                            setConfirmDelete(null);
                            setBanner('Ticket deleted'); setTimeout(()=>setBanner(null), 1200);
                          }}>Delete</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Add School modal */}
              {/* Finance: Download confirmation modal */}
              {showDownloadConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setShowDownloadConfirm(false)} />
                  <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-zoom-in border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Download Financial Report?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">This report includes all school revenue and overdue data for the month.</p>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowDownloadConfirm(false)}>Cancel</Button>
                      <Button onClick={() => {
                        const header = ['School','MRR','Overdue'];
                        const overdueMap = new Map(overduePayments.map(o => [o.school, o.amount] as const));
                        const rows = schools.map((s) => [s.name, `$${s.mrr}`, overdueMap.get(s.name) ? `$${overdueMap.get(s.name)}` : '$0']);
                        const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `financial-report-${new Date().toISOString().slice(0,10)}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setShowDownloadConfirm(false);
                        setBanner('Financial report downloaded');
                        setTimeout(() => setBanner(null), 1500);
                      }}>Confirm</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Finance: School detail modal */}
              {financeSchool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setFinanceSchool(null)} />
                  <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-zoom-in border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">{financeSchool.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between"><span className="text-gray-600 dark:text-gray-300">MRR</span><span className="font-medium text-gray-900 dark:text-gray-100">${financeSchool.mrr.toLocaleString()}/mo</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600 dark:text-gray-300">Status</span><span className="font-medium text-gray-900 dark:text-gray-100">{financeSchool.status}</span></div>
                      <div className="flex items-center justify-between"><span className="text-gray-600 dark:text-gray-300">Last Payment</span><span className="font-medium text-gray-900 dark:text-gray-100">{formatMonthYear(new Date(financeSchool.updatedAt ?? Date.now()))}</span></div>
                    </div>
                    <div className="mt-4 text-right">
                      <Button variant="outline" onClick={() => setFinanceSchool(null)}>Close</Button>
                    </div>
                  </div>
                </div>
              )}
              {showAddSchool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowAddSchool(false)} />
                  <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 animate-zoom-in">
                    <h3 className="text-lg font-semibold mb-4">Add School</h3>
                    <form
                      className="space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget as HTMLFormElement;
                        const data = Object.fromEntries(new FormData(form).entries());
                        const newSchool: School = {
                          id: `sch-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
                          name: String(data.name || 'New School'),
                          students: toNonNegativeInt(data.students),
                          teachers: toNonNegativeInt(data.teachers),
                          status: 'Active',
                          mrr: 0,
                          updatedAt: Date.now(),
                        };
                        setSchools((prev) => {
                          // dedup by name (case-insensitive), keep-first
                          const seen = new Set<string>();
                          const next = [newSchool, ...prev].filter((s) => {
                            const key = s.name.trim().toLowerCase();
                            if (seen.has(key)) return false;
                            seen.add(key);
                            return true;
                          });
                          storeSetSchools(next);
                          return next;
                        });
                        setShowAddSchool(false);
                        setActive('schools');
                        setBanner('School added');
                        setTimeout(() => setBanner(null), 1500);
                      }}
                    >
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">School Name</label>
                        <input name="name" required className="w-full border rounded-md px-3 py-2 text-sm" placeholder="e.g., Xavier School" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Students</label>
                          <input
                            name="students"
                            type="number"
                            min={0}
                            step={1}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onKeyDown={blockNonIntegerKeys}
                            onInput={sanitizeOnInput}
                            onPaste={blockNonDigitPaste}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Teachers</label>
                          <input
                            name="teachers"
                            type="number"
                            min={0}
                            step={1}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onKeyDown={blockNonIntegerKeys}
                            onInput={sanitizeOnInput}
                            onPaste={blockNonDigitPaste}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddSchool(false)}>Cancel</Button>
                        <Button type="submit">Save</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit School modal */}
              {showEditSchool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowEditSchool(null)} />
                  <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 animate-zoom-in">
                    <h3 className="text-lg font-semibold mb-4">Edit School</h3>
                    <form
                      className="space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget as HTMLFormElement);
                        const name = String(fd.get('name') || showEditSchool.name);
                        const studentsField = fd.get('students');
                        const teachersField = fd.get('teachers');
                        saveSchoolEdit({
                          ...showEditSchool,
                          name,
                          students:
                            studentsField != null && String(studentsField).length > 0
                              ? toNonNegativeInt(studentsField)
                              : showEditSchool.students,
                          teachers:
                            teachersField != null && String(teachersField).length > 0
                              ? toNonNegativeInt(teachersField)
                              : showEditSchool.teachers,
                        });
                      }}
                    >
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">School Name</label>
                        <input name="name" defaultValue={showEditSchool.name} className="w-full border rounded-md px-3 py-2 text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Students</label>
                          <input
                            name="students"
                            type="number"
                            defaultValue={showEditSchool.students}
                            min={0}
                            step={1}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onKeyDown={blockNonIntegerKeys}
                            onInput={sanitizeOnInput}
                            onPaste={blockNonDigitPaste}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Teachers</label>
                          <input
                            name="teachers"
                            type="number"
                            defaultValue={showEditSchool.teachers}
                            min={0}
                            step={1}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onKeyDown={blockNonIntegerKeys}
                            onInput={sanitizeOnInput}
                            onPaste={blockNonDigitPaste}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowEditSchool(null)}>Cancel</Button>
                        <Button type="submit">Save</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Assign Admin modal */}
              {showAssignAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setShowAssignAdmin(null)} />
                  <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-zoom-in">
                    <h3 className="text-lg font-semibold mb-4">Assign Admin</h3>
                    <form
                      className="space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget as HTMLFormElement;
                        const admin = String(new FormData(form).get('admin') || '');
                        saveAssignAdmin(showAssignAdmin.id, admin);
                      }}
                    >
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Select Admin</label>
                        <select name="admin" defaultValue={showAssignAdmin.assignedAdmin || ''} className="w-full border rounded-md px-3 py-2 text-sm">
                          <option value="">-- Choose --</option>
                          <option value="Jane (Sales)">Jane (Sales)</option>
                          <option value="Sam (Support)">Sam (Support)</option>
                          <option value="Abi (Finance)">Abi (Finance)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowAssignAdmin(null)}>Cancel</Button>
                        <Button type="submit">Assign</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </main>
          )}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: 'blue' | 'purple' | 'green' | 'indigo' }) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-sky-400',
    purple: 'from-purple-500 to-fuchsia-500',
    green: 'from-green-500 to-emerald-400',
    indigo: 'from-indigo-500 to-violet-500',
  };
  const borderHoverMap: Record<'blue' | 'purple' | 'green' | 'indigo', string> = {
    blue: 'hover:border-blue-400',
    purple: 'hover:border-purple-400',
    green: 'hover:border-green-400',
    indigo: 'hover:border-indigo-400',
  };
  return (
    <div className={`group bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-5 shadow-[0_0_20px_rgba(139,92,246,0.08)] hover:shadow-[0_0_35px_rgba(139,92,246,0.25)] transition-all duration-500 ease-in-out transform hover:-translate-y-1 ${borderHoverMap[color]}`}>
      <div className="flex items-center">
        <div className={`rounded-md bg-gradient-to-r ${colorMap[color]} p-3 shadow-sm`}></div>
        <div className="ml-4">
          <p className="text-sm text-gray-300">{title}</p>
          <p className="text-lg font-semibold text-white"><CountingNumber value={value} /></p>
        </div>
      </div>
    </div>
  );
}

function roleBadgeClass(role: StaffRole): string {
  switch (role) {
    case 'user':
      return 'bg-indigo-100 text-indigo-600 border-indigo-200';
    case 'super_admin':
      return 'bg-yellow-100 text-yellow-600 border-yellow-200';
    case 'sales':
      return 'bg-pink-100 text-pink-600 border-pink-200';
    case 'support':
      return 'bg-sky-100 text-sky-600 border-sky-200';
    case 'finance':
      return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function priorityBadgeClass(p: 'Low' | 'Medium' | 'High' | 'Urgent'): string {
  switch (p) {
    case 'Urgent':
      return 'bg-red-50 text-red-700 border border-red-200';
    case 'High':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Medium':
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200';
  }
}

function statusBadgeClass(s: 'Open' | 'In Progress' | 'Resolved' | 'Closed'): string {
  switch (s) {
    case 'Resolved':
    case 'Closed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'In Progress':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    default:
      return 'bg-sky-50 text-sky-700 border border-sky-200';
  }
}

function timeAgo(iso: string): string {
  try {
    const now = Date.now();
    const ts = new Date(iso).getTime();
    const diff = Math.max(0, now - ts);
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (day > 0) return `${day} day${day>1?'s':''} ago`;
    if (hr > 0) return `${hr} hour${hr>1?'s':''} ago`;
    if (min > 0) return `${min} min ago`;
    return 'just now';
  } catch {
    return iso;
  }
}

function Placeholder({ title }: { title: string }) {
  return (
    <section className="animate-fade-in">
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600 hover:shadow-lg transition-all ease-smooth hover:-translate-y-0.5">
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm mt-1">Coming soon</p>
      </div>
    </section>
  );
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const dd = d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
    const tt = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${dd.replaceAll('/', '/')} ${tt}`;
  } catch {
    return iso;
  }
}

function formatMonthYear(d: Date): string {
  try {
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  } catch {
    return `${d.getMonth()+1}/${d.getFullYear()}`;
  }
}

function NavIcon({ label, active }: { label: string; active?: boolean }) {
  const base = `h-4 w-4 ${active ? 'text-indigo-600' : 'text-gray-400'} group-hover:text-indigo-600 ease-smooth`;
  switch (label) {
    case 'Dashboard':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={base}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18M12 3v18" />
        </svg>
      );
    case 'Schools':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={base}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10l9-6 9 6-9 6-9-6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19l9-6 9 6" />
        </svg>
      );
    case 'User Management':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={base}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-3.13a4 4 0 10-8 0 4 4 0 008 0z" />
        </svg>
      );
    case 'Finance & Billing':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={base}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3m0-6c1.657 0 3 1.343 3 3a3 3 0 01-3 3m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'Reports':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={base}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6m4 6V7m4 10V9M4 4h16v16H4z" />
        </svg>
      );
    case 'Support':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={base}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 11-12.728 0M12 8v4l3 3" />
        </svg>
      );
    default:
      return <span className={base.replace('text-gray-400','text-gray-300')}>•</span>;
  }
}

function CountingNumber({ value, duration = 800 }: { value: number | string; duration?: number }) {
  const [display, setDisplay] = useState<string>(typeof value === 'number' ? '0' : String(value));
  useEffect(() => {
    const endStr = String(value);
    const numeric = Number(String(value).replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(numeric)) {
      setDisplay(endStr);
      return;
    }
    const start = 0;
    const startTime = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
      const val = Math.round(start + (numeric - start) * eased);
      const formatted = String(value).includes('$') ? `$${val.toLocaleString()}` : val.toLocaleString();
      setDisplay(formatted);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span>{display}</span>;
}

function BarChartDivs({ data, labels, className = '' }: { data: number[]; labels: string[]; className?: string }) {
  const max = Math.max(1, ...data);
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-full flex items-end gap-3">
        {data.map((v, i) => {
          const h = Math.round((v / max) * 100);
          return (
            <div key={i} className="group flex-1 flex flex-col items-center justify-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-400 transition-all duration-700 ease-in-out hover:scale-110"
                style={{ height: `${h}%` }}
                title={`${labels[i] ?? ''}: ${v.toLocaleString()}`}
              />
              <div className="mt-1 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{v.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-5 text-[10px] text-gray-400">
        {labels.map((l, i) => (
          <div key={i} className="text-center">{l}</div>
        ))}
      </div>
    </div>
  );
}

function SortIcon({ active, dir = 'asc' }: { active?: boolean; dir?: 'asc' | 'desc' }) {
  return (
    <span className={`inline-flex h-4 w-4 items-center justify-center transition-all ease-smooth ${active ? 'text-gray-700' : 'text-gray-300'}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        width="14"
        height="14"
        className={`transition-transform duration-200 ${active && dir === 'desc' ? 'rotate-180' : 'rotate-0'}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 14l5-5 5 5" />
      </svg>
    </span>
  );
}

function SortChevron({ active, dir = 'asc' }: { active?: boolean; dir?: 'asc' | 'desc' }) {
  return (
    <span className={`inline-flex h-4 w-4 items-center justify-center transition-all ease-smooth ${active ? 'text-gray-700' : 'text-gray-300'}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        width="12"
        height="12"
        className={`transition-transform duration-200 ${active && dir === 'asc' ? 'rotate-180' : 'rotate-0'}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 14l5-5 5 5" />
      </svg>
    </span>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-200/80 rounded-md animate-pulse ${className}`} />
  );
}

function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      <div className="h-full w-full rounded-md border bg-white overflow-hidden">
        <div className="h-full w-full p-4 flex items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 flex items-end">
              <Skeleton className={`w-full ${["h-10","h-24","h-14","h-32","h-20","h-28","h-16","h-24","h-12","h-20","h-14","h-24"][i]} rounded`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
