import { apiClient } from '../api-client';

export interface Subject {
  _id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  maxMarks: number;
  passingMarks: number;
  classes?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectDto {
  name: string;
  code: string;
  description?: string;
  maxMarks?: number;
  passingMarks?: number;
  classes?: string[];
}

export interface UpdateSubjectDto {
  name?: string;
  code?: string;
  description?: string;
  maxMarks?: number;
  passingMarks?: number;
  classes?: string[];
  isActive?: boolean;
}

class SubjectService {
  private baseUrl = '/subjects';

  async createSubject(data: CreateSubjectDto): Promise<Subject> {
    const response = await apiClient.post<Subject>(this.baseUrl, data);
    return response.data;
  }

  async getSubjects(): Promise<Subject[]> {
    const response = await apiClient.get<Subject[]>(this.baseUrl);
    return response.data;
  }

  async getSubjectById(id: string): Promise<Subject> {
    const response = await apiClient.get<Subject>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateSubject(id: string, data: UpdateSubjectDto): Promise<Subject> {
    const response = await apiClient.patch<Subject>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteSubject(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const subjectService = new SubjectService();
