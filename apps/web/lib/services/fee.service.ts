import { apiClient } from '../api-client';

export type InvoiceStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online' | 'cheque';

export interface FeeStructure {
  _id: string;
  tenantId: string;
  name: string;
  amount: number;
  classId: string;
  academicYear: string;
  term?: string;
  description?: string;
  isActive: boolean;
  dueDate?: string;
  isRecurring: boolean;
  frequency?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  class?: {
    _id: string;
    name: string;
    grade: string;
  };
}

export interface Invoice {
  _id: string;
  tenantId: string;
  invoiceNumber: string;
  studentId: string;
  classId: string;
  academicYear: string;
  term?: string;
  items: {
    feeStructureId: string;
    name: string;
    amount: number;
    description?: string;
  }[];
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  discountReason?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  remarks?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  student?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
  };
  class?: {
    _id: string;
    name: string;
    grade: string;
  };
}

export interface CreateFeeStructureDto {
  name: string;
  amount: number;
  classId: string;
  academicYear: string;
  term?: string;
  description?: string;
  isActive?: boolean;
  dueDate?: string;
  isRecurring?: boolean;
  frequency?: string;
}

export interface UpdateFeeStructureDto {
  name?: string;
  amount?: number;
  classId?: string;
  academicYear?: string;
  term?: string;
  description?: string;
  isActive?: boolean;
  dueDate?: string;
  isRecurring?: boolean;
  frequency?: string;
}

export interface CreateInvoiceDto {
  studentId: string;
  classId: string;
  academicYear: string;
  term?: string;
  items: {
    feeStructureId: string;
    name: string;
    amount: number;
    description?: string;
  }[];
  totalAmount: number;
  paidAmount?: number;
  discountAmount?: number;
  discountReason?: string;
  status?: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  remarks?: string;
}

export interface UpdateInvoiceDto {
  term?: string;
  items?: {
    feeStructureId: string;
    name: string;
    amount: number;
    description?: string;
  }[];
  totalAmount?: number;
  paidAmount?: number;
  discountAmount?: number;
  discountReason?: string;
  status?: InvoiceStatus;
  issueDate?: string;
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  remarks?: string;
}

export interface InvoiceStats {
  total: number;
  pending: number;
  paid: number;
  partial: number;
  overdue: number;
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
}

class FeeService {
  private baseUrl = '/fees';

  // Fee Structure Methods
  async createFeeStructure(data: CreateFeeStructureDto): Promise<FeeStructure> {
    const response = await apiClient.post<FeeStructure>(`${this.baseUrl}/structures`, data);
    return response.data;
  }

  async getFeeStructures(filters?: { classId?: string; academicYear?: string }): Promise<FeeStructure[]> {
    const response = await apiClient.get<FeeStructure[]>(`${this.baseUrl}/structures`, { params: filters });
    return response.data;
  }

  async getFeeStructureById(id: string): Promise<FeeStructure> {
    const response = await apiClient.get<FeeStructure>(`${this.baseUrl}/structures/${id}`);
    return response.data;
  }

  async updateFeeStructure(id: string, data: UpdateFeeStructureDto): Promise<FeeStructure> {
    const response = await apiClient.patch<FeeStructure>(`${this.baseUrl}/structures/${id}`, data);
    return response.data;
  }

  async deleteFeeStructure(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/structures/${id}`);
  }

  // Invoice Methods
  async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`${this.baseUrl}/invoices`, data);
    return response.data;
  }

  async getInvoices(filters?: {
    studentId?: string;
    classId?: string;
    academicYear?: string;
    status?: InvoiceStatus;
  }): Promise<Invoice[]> {
    const response = await apiClient.get<Invoice[]>(`${this.baseUrl}/invoices`, { params: filters });
    return response.data;
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`${this.baseUrl}/invoices/${id}`);
    return response.data;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`${this.baseUrl}/invoices/number/${invoiceNumber}`);
    return response.data;
  }

  async updateInvoice(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
    const response = await apiClient.patch<Invoice>(`${this.baseUrl}/invoices/${id}`, data);
    return response.data;
  }

  async recordPayment(id: string, amount: number, paymentMethod: string, transactionId?: string): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`${this.baseUrl}/invoices/${id}/payment`, {
      amount,
      paymentMethod,
      transactionId,
    });
    return response.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/invoices/${id}`);
  }

  async getInvoiceStats(academicYear?: string): Promise<InvoiceStats> {
    const params = academicYear ? { academicYear } : {};
    const response = await apiClient.get<InvoiceStats>(`${this.baseUrl}/invoices/stats`, { params });
    return response.data;
  }
}

export const feeService = new FeeService();
