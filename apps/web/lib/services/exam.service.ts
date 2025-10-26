import { apiClient } from '../api-client';

export interface Exam {
  _id: string;
  tenantId: string;
  name: string;
  description?: string;
  classId: string;
  startDate: string;
  endDate: string;
  academicYear?: string;
  term?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  class?: {
    _id: string;
    name: string;
    grade: string;
  };
}

export interface CreateExamDto {
  name: string;
  description?: string;
  classId: string;
  startDate: string;
  endDate: string;
  academicYear?: string;
  term?: string;
}

export interface UpdateExamDto {
  name?: string;
  description?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  term?: string;
  isActive?: boolean;
}

class ExamService {
  private baseUrl = '/exams';

  async createExam(data: CreateExamDto): Promise<Exam> {
    const response = await apiClient.post<Exam>(this.baseUrl, data);
    return response.data;
  }

  async getExams(filters?: { classId?: string; academicYear?: string }): Promise<Exam[]> {
    const response = await apiClient.get<Exam[]>(this.baseUrl, { params: filters });
    return response.data;
  }

  async getExamById(id: string): Promise<Exam> {
    const response = await apiClient.get<Exam>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateExam(id: string, data: UpdateExamDto): Promise<Exam> {
    const response = await apiClient.patch<Exam>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteExam(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const examService = new ExamService();
