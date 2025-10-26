import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '@repo/config';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.apiUrl,
      withCredentials: true, // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add JWT token
    this.client.interceptors.request.use(
      (config) => {
        // Add JWT token from localStorage
        const token = localStorage.getItem('accessToken');
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
        // Transform MongoDB _id to id for easier usage
        if (response.data) {
          response.data = this.transformMongoIds(response.data);
        }
        return response;
      },
      (error) => {
        // Handle errors globally
        if (error.response?.status === 401) {
          // Redirect to login if unauthorized
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
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
