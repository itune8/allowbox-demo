import { apiClient } from '../api-client';

export interface Class {
  _id: string;
  tenantId: string;
  name: string;
  grade: string;
  sections: string[];
  description?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassDto {
  name: string;
  grade: string;
  sections: string[];
  description?: string;
  capacity?: number;
}

export interface UpdateClassDto {
  name?: string;
  grade?: string;
  sections?: string[];
  description?: string;
  capacity?: number;
  isActive?: boolean;
}

class ClassService {
  private baseUrl = '/classes';

  async createClass(data: CreateClassDto): Promise<Class> {
    const response = await apiClient.post<Class>(this.baseUrl, data);
    return response.data;
  }

  async getClasses(): Promise<Class[]> {
    const response = await apiClient.get<Class[]>(this.baseUrl);
    return response.data;
  }

  async getClassById(id: string): Promise<Class> {
    const response = await apiClient.get<Class>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateClass(id: string, data: UpdateClassDto): Promise<Class> {
    const response = await apiClient.patch<Class>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteClass(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const classService = new ClassService();
