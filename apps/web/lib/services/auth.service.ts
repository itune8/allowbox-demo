// apps/web/lib/services/auth.service.ts
import { apiClient } from '../api-client';

export interface RegisterSchoolDto {
  schoolName: string;
  domain: string;
  address?: string;
  contactEmail: string;
  contactPhone?: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: string;
    permissions?: string[];
    isFirstLogin?: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface ResetPasswordDto {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface CurrentUserResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: string;
    permissions?: string[];
  };
}

export interface RegisterSchoolResponse {
  message: string;
  tenant: {
    tenantId: string;
    schoolName: string;
    domain: string;
  };
  admin: {
    email: string;
    name: string;
  };
}

class AuthService {
  /**
   * Register a new school (self-service)
   * Public endpoint - no authentication required
   */
  async registerSchool(data: RegisterSchoolDto): Promise<RegisterSchoolResponse> {
    const response = await apiClient.post<RegisterSchoolResponse>(
      '/tenants/register',
      data
    );
    return response.data;
  }

  /**
   * Login user
   */
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );

    // Store tokens and user data in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      // Store user data for persistence
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  }

  /**
   * Register a new user (within a tenant)
   */
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);

    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      // Store user data for persistence
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await apiClient.get<CurrentUserResponse>('/auth/me');
    return response.data;
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Get stored user data
   */
  getStoredUser(): AuthResponse['user'] | null {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  /**
   * Reset password (for first login or password change)
   */
  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }
}

export const authService = new AuthService();
