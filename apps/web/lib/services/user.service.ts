// apps/web/lib/services/user.service.ts
import { apiClient } from '../api-client';
import { UserFormData } from '../../components/modals/create-user-modal';

export interface User {
  id: string;
  _id?: string; // MongoDB ID (when returned from backend)
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
  phoneNumber?: string;
  address?: string;
  isActive: boolean;
  // First login and blocking
  isFirstLogin?: boolean;
  isBlocked?: boolean;
  // Student-specific fields
  studentId?: string;
  classId?: any; // Can be string or populated object
  section?: string;
  dateOfBirth?: string | Date;
  gender?: string;
  bloodGroup?: string;
  parentEmail?: string;
  parentPhone?: string;
  // Teacher/Staff-specific fields
  employeeId?: string;
  joiningDate?: string | Date;
  qualification?: string;
  subjects?: any[];
  // Parent-specific fields
  children?: any[];
  parents?: any[];
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

// Keep UserResponse as alias for backward compatibility
export type UserResponse = User;

class UserService {
  /**
   * Create a new user (teacher, staff, parent, student)
   */
  async createUser(userData: any): Promise<User> {
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

    const response = await apiClient.post<User>('/users', payload);
    return response.data;
  }

  /**
   * Get all users (automatically filtered by tenantId via JWT)
   */
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: any): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${userId}`, data);
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  }

  /**
   * Link a parent to a child
   */
  async linkParentToChild(parentId: string, childId: string): Promise<User> {
    const response = await apiClient.post<User>(`/users/${parentId}/link-child/${childId}`);
    return response.data;
  }

  /**
   * Link a parent to a student by email
   */
  async linkParent(studentId: string, parentEmail: string): Promise<User> {
    // Find the parent by email
    const parents = await this.getParents();
    const parent = parents.find(p => p.email === parentEmail);
    if (!parent) {
      throw new Error('Parent with this email not found');
    }
    // Link the parent to the student
    return this.linkParentToChild(parent._id || parent.id!, studentId);
  }

  /**
   * Get users by role (uses backend endpoint for efficiency)
   */
  async getUsersByRole(role: string): Promise<User[]> {
    const response = await apiClient.get<User[]>(`/users/by-role?role=${role}`);
    return response.data;
  }

  /**
   * Get all students
   */
  async getStudents(): Promise<User[]> {
    return this.getUsersByRole('student');
  }

  /**
   * Get all teachers
   */
  async getTeachers(): Promise<User[]> {
    return this.getUsersByRole('teacher');
  }

  /**
   * Get all parents
   */
  async getParents(): Promise<User[]> {
    return this.getUsersByRole('parent');
  }

  /**
   * Block a user from logging in
   */
  async blockUser(userId: string): Promise<{ message: string; user: User }> {
    const response = await apiClient.patch<{ message: string; user: User }>(`/users/${userId}/block`);
    return response.data;
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<{ message: string; user: User }> {
    const response = await apiClient.patch<{ message: string; user: User }>(`/users/${userId}/unblock`);
    return response.data;
  }

  /**
   * Get platform staff users (super_admin, sales, support, finance)
   */
  async getPlatformUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/platform');
    return response.data;
  }

  /**
   * Create a platform staff user
   */
  async createPlatformUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
  }): Promise<User> {
    const response = await apiClient.post<User>('/users/platform', userData);
    return response.data;
  }
}

export const userService = new UserService();
