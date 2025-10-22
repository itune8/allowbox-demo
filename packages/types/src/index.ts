// User and Authentication Types
export interface User {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions: string[];
  firstName?: string;
  lastName?: string;
  tenantTheme?: TenantTheme;
}

export interface TenantTheme {
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
}

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'parent' | 'student';

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  theme: TenantTheme;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// Student Types
export interface Student {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth: string;
  gradeLevel: string;
  classId?: string;
  parentId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Class Types
export interface Class {
  id: string;
  tenantId: string;
  name: string;
  gradeLevel: string;
  teacherId: string;
  academicYear: string;
  schedule?: ClassSchedule[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ClassSchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  startTime: string;
  endTime: string;
  subject: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  tenantId: string;
  studentId: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  description: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Subscription Types
export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate?: string;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: 'card' | 'bank_transfer' | 'cash' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLink {
  id: string;
  url: string;
  invoiceId: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'used';
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}
