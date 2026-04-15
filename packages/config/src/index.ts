// Environment Configuration
//
// On the demo site hosted at allowbox-demo.vercel.app we detected the Vercel
// dashboard holding a stale `NEXT_PUBLIC_API_URL` pointing at a retired
// hyperbrainlabs host. That killed all API calls. Since the dashboard env
// var can't be edited from the repo, we override by hostname for known
// production hosts — cleanest way to route the deployed demo back to the
// real API without touching the dashboard.

function resolveApiUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (
      host === 'allowbox-demo.vercel.app' ||
      host.endsWith('.allowbox-demo.vercel.app') ||
      host === 'allowbox.in' ||
      host === 'www.allowbox.in'
    ) {
      return 'https://api.allowbox.in/api/v1';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api/v1';
}

function resolveAppUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'allowbox-demo.vercel.app') return 'https://allowbox-demo.vercel.app';
    if (host === 'allowbox.in' || host === 'www.allowbox.in') return 'https://allowbox.in';
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export const env = {
  get apiUrl() {
    return resolveApiUrl();
  },
  get appUrl() {
    return resolveAppUrl();
  },
  useApiMocks: process.env.NEXT_PUBLIC_USE_API_MOCKS === 'true',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

// Role Constants - Must match backend UserRole enum
export const ROLES = {
  // Platform roles
  SUPER_ADMIN: 'super_admin',
  SALES: 'sales',
  SUPPORT: 'support',
  FINANCE: 'finance',
  // School roles
  TENANT_ADMIN: 'tenant_admin',
  TEACHER: 'teacher',
  PARENT: 'parent',
  STUDENT: 'student',
  ACCOUNTANT: 'accountant',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',

  // Platform (Super Admin) Routes
  PLATFORM_DASHBOARD: '/platform',
  PLATFORM_SCHOOLS: '/platform/schools',
  PLATFORM_INVOICES: '/platform/invoices',
  PLATFORM_SUBSCRIPTIONS: '/platform/subscriptions',

  // School Admin Routes
  SCHOOL_DASHBOARD: '/school',
  SCHOOL_STUDENTS: '/school/students',
  SCHOOL_STAFF: '/school/staff',
  SCHOOL_CLASSES: '/school/classes',
  SCHOOL_INVOICES: '/school/invoices',

  // Teacher Routes
  TEACHER_DASHBOARD: '/teacher',
  TEACHER_CLASSES: '/teacher/classes',
  TEACHER_ATTENDANCE: '/teacher/attendance',
  TEACHER_HOMEWORK: '/teacher/homework',
  TEACHER_STUDENTS: '/teacher/students',

  // Parent Routes
  PARENT_DASHBOARD: '/parent',
  PARENT_FEES: '/parent/fees',
} as const;

// Role to Dashboard Mapping
export const ROLE_DASHBOARDS = {
  // Platform roles
  [ROLES.SUPER_ADMIN]: ROUTES.PLATFORM_DASHBOARD,
  [ROLES.SALES]: ROUTES.PLATFORM_DASHBOARD,
  [ROLES.SUPPORT]: ROUTES.PLATFORM_DASHBOARD,
  [ROLES.FINANCE]: ROUTES.PLATFORM_DASHBOARD,
  // School roles
  [ROLES.TENANT_ADMIN]: ROUTES.SCHOOL_DASHBOARD,
  [ROLES.TEACHER]: ROUTES.TEACHER_DASHBOARD,
  [ROLES.ACCOUNTANT]: ROUTES.SCHOOL_DASHBOARD,
  [ROLES.PARENT]: ROUTES.PARENT_DASHBOARD,
  [ROLES.STUDENT]: ROUTES.PARENT_DASHBOARD, // Students use parent dashboard
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  SIGNUP: '/auth/signup',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',

  // Tenants
  TENANTS: '/tenants',
  TENANT_THEME: (id: string) => `/tenants/${id}/theme`,

  // Students
  STUDENTS: '/students',
  STUDENT_BY_ID: (id: string) => `/students/${id}`,

  // Classes
  CLASSES: '/classes',
  CLASS_BY_ID: (id: string) => `/classes/${id}`,

  // Invoices
  INVOICES: '/invoices',
  INVOICE_BY_ID: (id: string) => `/invoices/${id}`,

  // Payments
  PAYMENTS: '/payments',
  PAYMENT_LINK: '/payments/create-link',

  // Subscriptions
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTION_BY_ID: (id: string) => `/subscriptions/${id}`,

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_MARK_ALL_READ: '/notifications/mark-all-read',
  NOTIFICATIONS_CLEAR: '/notifications/clear',
} as const;

// Permission Constants
export const PERMISSIONS = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',

  // Student Management
  VIEW_STUDENTS: 'view_students',
  CREATE_STUDENTS: 'create_students',
  EDIT_STUDENTS: 'edit_students',
  DELETE_STUDENTS: 'delete_students',

  // Class Management
  VIEW_CLASSES: 'view_classes',
  CREATE_CLASSES: 'create_classes',
  EDIT_CLASSES: 'edit_classes',
  DELETE_CLASSES: 'delete_classes',

  // Invoice Management
  VIEW_INVOICES: 'view_invoices',
  CREATE_INVOICES: 'create_invoices',
  EDIT_INVOICES: 'edit_invoices',
  DELETE_INVOICES: 'delete_invoices',

  // Payment Management
  VIEW_PAYMENTS: 'view_payments',
  CREATE_PAYMENTS: 'create_payments',

  // Platform Management
  MANAGE_TENANTS: 'manage_tenants',
  MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',
  VIEW_PLATFORM_ANALYTICS: 'view_platform_analytics',
} as const;

// App Constants
export const APP_NAME = 'Allowbox';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

// Theme Constants
export const DEFAULT_THEME = {
  primaryColor: '#3b82f6',
  accentColor: '#8b5cf6',
  logoUrl: '/logo.png',
};
