// apps/web/lib/services/tenant.service.ts
import { apiClient } from '../api-client';

export interface TenantData {
  tenantId: string;
  schoolName: string;
  domain: string;
  address?: string;
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt?: string;
}

class TenantService {
  /**
   * Get current tenant information
   */
  async getCurrentTenant(): Promise<TenantData> {
    const response = await apiClient.get<TenantData>('/tenants/me');
    return response.data;
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string): Promise<TenantData> {
    const response = await apiClient.get<TenantData>(`/tenants/${tenantId}`);
    return response.data;
  }

  /**
   * Update tenant information
   */
  async updateTenant(tenantId: string, data: Partial<TenantData>): Promise<TenantData> {
    const response = await apiClient.patch<TenantData>(`/tenants/${tenantId}`, data);
    return response.data;
  }
}

export const tenantService = new TenantService();
