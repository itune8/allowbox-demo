import { apiClient } from '../../api-client';

export interface School {
  _id: string;
  tenantId: string;
  schoolName: string;
  domain: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  subscriptionStatus: 'trial' | 'active' | 'suspended' | 'cancelled';
  subscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
  studentCount: number;
  teacherCount: number;
  staffCount: number;
  currentUsers: number;
  maxUsers: number;
  pricePerStudent: number;
  mrr: number;
  arr: number;
  totalRevenue: number;
  outstandingBalance: number;
  lastPaymentDate?: string;
  nextBillingDate?: string;
  trialEndDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  adminId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  onboardedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  onboardedAt?: string;
  lastActivityAt?: string;
  totalLogins: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchoolDto {
  schoolName: string;
  tenantId: string;
  domain: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  subscriptionStatus?: 'trial' | 'active' | 'suspended' | 'cancelled';
  subscriptionPlan?: 'free' | 'basic' | 'premium' | 'enterprise';
  maxUsers?: number;
  pricePerStudent?: number;
  adminId?: string;
  notes?: string;
}

export interface UpdateSchoolDto {
  schoolName?: string;
  domain?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  subscriptionStatus?: 'trial' | 'active' | 'suspended' | 'cancelled';
  subscriptionPlan?: 'free' | 'basic' | 'premium' | 'enterprise';
  maxUsers?: number;
  pricePerStudent?: number;
  isActive?: boolean;
  adminId?: string;
  notes?: string;
}

class SchoolService {
  async getSchools(filters?: {
    status?: string;
    plan?: string;
    search?: string;
  }): Promise<School[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.plan) params.append('plan', filters.plan);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<School[]>(
      `/superadmin/schools?${params.toString()}`
    );
    return response.data;
  }

  async getSchoolById(id: string): Promise<School> {
    const response = await apiClient.get<School>(`/superadmin/schools/${id}`);
    return response.data;
  }

  async createSchool(data: CreateSchoolDto): Promise<School> {
    const response = await apiClient.post<School>('/superadmin/schools', data);
    return response.data;
  }

  async updateSchool(id: string, data: UpdateSchoolDto): Promise<School> {
    const response = await apiClient.patch<School>(
      `/superadmin/schools/${id}`,
      data
    );
    return response.data;
  }

  async deleteSchool(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/superadmin/schools/${id}`
    );
    return response.data;
  }

  async assignAdmin(schoolId: string, adminId: string): Promise<School> {
    const response = await apiClient.patch<School>(
      `/superadmin/schools/${schoolId}/admin`,
      { adminId }
    );
    return response.data;
  }

  async updateSubscription(
    schoolId: string,
    plan: string,
    status?: string
  ): Promise<School> {
    const response = await apiClient.patch<School>(
      `/superadmin/schools/${schoolId}/subscription`,
      { plan, status }
    );
    return response.data;
  }

  async getSchoolMetrics(schoolId: string): Promise<any> {
    const response = await apiClient.get(
      `/superadmin/schools/${schoolId}/metrics`
    );
    return response.data;
  }

  async getInactiveSchools(): Promise<School[]> {
    const response = await apiClient.get<School[]>(
      '/superadmin/schools/alerts/inactive'
    );
    return response.data;
  }

  async getExpiringTrials(): Promise<School[]> {
    const response = await apiClient.get<School[]>(
      '/superadmin/schools/alerts/expiring-trials'
    );
    return response.data;
  }

  async getUnpaidSchools(): Promise<School[]> {
    const response = await apiClient.get<School[]>(
      '/superadmin/schools/alerts/unpaid'
    );
    return response.data;
  }

  async calculateMRR(schoolId: string): Promise<{ mrr: number; arr: number }> {
    const response = await apiClient.post<{ mrr: number; arr: number }>(
      `/superadmin/schools/${schoolId}/calculate-mrr`
    );
    return response.data;
  }
}

export const schoolService = new SchoolService();
