// Environment Configuration
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004/api/v1',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  useApiMocks: process.env.NEXT_PUBLIC_USE_API_MOCKS === 'true',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

// Role Constants
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  SALES: 'sales',
  SUPPORT: 'support',
  FINANCE: 'finance',
  SCHOOL_ADMIN: 'school_admin',
  TENANT_ADMIN: 'tenant_admin', // Backend uses tenant_admin
  TEACHER: 'teacher',
  PARENT: 'parent',
  STUDENT: 'student',
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
  PARENT_CHILDREN: '/parent/children',
  PARENT_FEES: '/parent/fees',
  PARENT_PAYMENTS: '/parent/payments',
} as const;

// Role to Dashboard Mapping
export const ROLE_DASHBOARDS = {
  [ROLES.SUPER_ADMIN]: ROUTES.PLATFORM_DASHBOARD,
  [ROLES.SALES]: ROUTES.PLATFORM_DASHBOARD,
  [ROLES.SUPPORT]: ROUTES.PLATFORM_DASHBOARD,
  [ROLES.FINANCE]: ROUTES.PLATFORM_DASHBOARD,
  [ROLES.SCHOOL_ADMIN]: ROUTES.SCHOOL_DASHBOARD,
  [ROLES.TENANT_ADMIN]: ROUTES.SCHOOL_DASHBOARD, // tenant_admin is same as school_admin
  [ROLES.TEACHER]: ROUTES.TEACHER_DASHBOARD,
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
