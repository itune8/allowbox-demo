// apps/web/lib/services/user.service.ts
import { apiClient } from '../api-client';
import { UserFormData } from '../../components/modals/create-user-modal';

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
  phoneNumber?: string;
  employeeId?: string;
  isActive: boolean;
}

class UserService {
  /**
   * Create a new user (teacher, staff, parent)
   */
  async createUser(userData: UserFormData): Promise<UserResponse> {
    // Use simple default password if not provided
    const defaultPassword = userData.password || 'teacher123';

    // Build payload based on role
    const payload: any = {
      email: userData.email,
      password: defaultPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
    };

    // Add optional common fields
    if (userData.phoneNumber) payload.phoneNumber = userData.phoneNumber;

    // Only add employee-specific fields for teachers and tenant_admin
    if (userData.role === 'teacher' || userData.role === 'tenant_admin') {
      if (userData.employeeId) payload.employeeId = userData.employeeId;
      if (userData.joiningDate) payload.joiningDate = userData.joiningDate;
      if (userData.qualification) payload.qualification = userData.qualification;
    }

    // Remove undefined/empty values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    const response = await apiClient.post<UserResponse>('/users', payload);
    return response.data;
  }

  /**
   * Get all users
   */
  async getUsers(): Promise<UserResponse[]> {
    const response = await apiClient.get<UserResponse[]>('/users');
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`/users/${userId}`);
    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: Partial<UserFormData>): Promise<UserResponse> {
    const response = await apiClient.patch<UserResponse>(`/users/${userId}`, data);
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  }
}

export const userService = new UserService();
