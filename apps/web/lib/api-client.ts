import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '@repo/config';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL:  env.apiUrl || 'http://localhost:5004/api/v1',
      withCredentials: true, // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add JWT token OR block in demo mode
    this.client.interceptors.request.use(
      (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

        // Demo mode: return empty data instead of hitting real API
        if (token?.startsWith('demo-token-')) {
          const adapter = () => {
            const url = config.url || '';
            // Return sensible empty responses for common endpoints
            let data: any = [];
            if (url.includes('/auth/me')) data = { user: JSON.parse(localStorage.getItem('user') || '{}') };
            else if (url.includes('/tenants/me') || url.includes('/tenants')) data = { name: 'Demo School', id: 'demo-tenant-001', subscription: { plan: 'premium', status: 'active' } };
            else if (url.includes('/classes')) data = [];
            else if (url.includes('/users')) data = [];
            else if (url.includes('/subjects')) data = [];
            else if (url.includes('/attendance')) data = [];
            else if (url.includes('/fees') || url.includes('/invoices')) data = [];
            else if (url.includes('/health')) data = [];
            else if (url.includes('/transport')) data = { vehicles: [], routes: [], assignments: [] };
            else if (url.includes('/leave')) data = [];
            else if (url.includes('/events')) data = [];
            else if (url.includes('/announcements')) data = [];
            else if (url.includes('/timetable')) data = [];
            else if (url.includes('/homework') || url.includes('/assignments')) data = [];
            else if (url.includes('/exams') || url.includes('/marks') || url.includes('/grades')) data = [];
            else if (url.includes('/messages')) data = [];
            else if (url.includes('/daily-diary')) data = [];
            else if (url.includes('/lesson-plans')) data = [];
            else if (url.includes('/activity-logs')) data = [];
            else if (url.includes('/support-tickets')) data = [];
            return Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config });
          };
          config.adapter = adapter as any;
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (response.data) {
          response.data = this.transformMongoIds(response.data);
        }
        return response;
      },
      (error) => {
        // In demo mode, swallow errors
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token?.startsWith('demo-token-')) {
          return Promise.resolve({ data: [], status: 200, statusText: 'OK', headers: {}, config: error.config });
        }

        if (error.response?.status === 401) {
          const isMobileApp = typeof window !== 'undefined' && localStorage.getItem('isMobileApp') === 'true';
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !isMobileApp) {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Transform MongoDB _id to id recursively
  private transformMongoIds(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.transformMongoIds(item));
    }

    if (data && typeof data === 'object') {
      const transformed = { ...data };

      // If object has _id, copy it to id
      if (transformed._id && !transformed.id) {
        transformed.id = transformed._id;
      }

      // Recursively transform nested objects
      Object.keys(transformed).forEach(key => {
        if (transformed[key] && typeof transformed[key] === 'object') {
          transformed[key] = this.transformMongoIds(transformed[key]);
        }
      });

      return transformed;
    }

    return data;
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
