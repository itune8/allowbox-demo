import { apiClient } from '../api-client';

export enum LessonPlanStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface LessonPlanResource {
  title: string;
  url: string;
  type: 'LINK' | 'DOCUMENT' | 'VIDEO' | 'IMAGE';
}

export interface LessonPlan {
  _id: string;
  id: string;
  tenantId: string;
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  subjectId: {
    _id: string;
    name: string;
    code: string;
    description?: string;
  };
  classId: {
    _id: string;
    name: string;
    grade: string;
    sections?: string[];
  };
  section?: string;
  title: string;
  description?: string;
  objectives: string[];
  content?: string;
  resources: LessonPlanResource[];
  status: LessonPlanStatus;
  scheduledDate: string;
  completedDate?: string;
  teacherNotes?: string;
  duration?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonPlanDto {
  subjectId: string;
  classId: string;
  section?: string;
  title: string;
  description?: string;
  objectives?: string[];
  content?: string;
  resources?: LessonPlanResource[];
  status?: LessonPlanStatus;
  scheduledDate: string;
  duration?: number;
  teacherNotes?: string;
}

export interface UpdateLessonPlanDto {
  subjectId?: string;
  classId?: string;
  section?: string;
  title?: string;
  description?: string;
  objectives?: string[];
  content?: string;
  resources?: LessonPlanResource[];
  status?: LessonPlanStatus;
  scheduledDate?: string;
  duration?: number;
  teacherNotes?: string;
}

export interface ClassProgress {
  total: number;
  completed: number;
  inProgress: number;
  scheduled: number;
  draft: number;
  completionPercentage: number;
}

export interface LessonPlanFilters {
  teacherId?: string;
  classId?: string;
  subjectId?: string;
  status?: LessonPlanStatus;
  startDate?: string;
  endDate?: string;
}

class LessonPlanService {
  private baseUrl = '/lesson-plans';

  async create(data: CreateLessonPlanDto): Promise<LessonPlan> {
    const response = await apiClient.post<LessonPlan>(this.baseUrl, data);
    return response.data;
  }

  async getAll(filters?: LessonPlanFilters): Promise<LessonPlan[]> {
    const params = new URLSearchParams();
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);
    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<LessonPlan[]>(url);
    return response.data;
  }

  async getMyPlans(): Promise<LessonPlan[]> {
    const response = await apiClient.get<LessonPlan[]>(`${this.baseUrl}/my-plans`);
    return response.data;
  }

  async getByClass(classId: string, section?: string): Promise<LessonPlan[]> {
    const params = section ? `?section=${section}` : '';
    const response = await apiClient.get<LessonPlan[]>(
      `${this.baseUrl}/class/${classId}${params}`
    );
    return response.data;
  }

  async getClassProgress(classId: string, section?: string): Promise<ClassProgress> {
    const params = section ? `?section=${section}` : '';
    const response = await apiClient.get<ClassProgress>(
      `${this.baseUrl}/class/${classId}/progress${params}`
    );
    return response.data;
  }

  async getUpcomingLessons(classId: string, limit?: number): Promise<LessonPlan[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<LessonPlan[]>(
      `${this.baseUrl}/class/${classId}/upcoming${params}`
    );
    return response.data;
  }

  async getRecentCompletedLessons(classId: string, limit?: number): Promise<LessonPlan[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<LessonPlan[]>(
      `${this.baseUrl}/class/${classId}/recent${params}`
    );
    return response.data;
  }

  async getById(id: string): Promise<LessonPlan> {
    const response = await apiClient.get<LessonPlan>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateLessonPlanDto): Promise<LessonPlan> {
    const response = await apiClient.patch<LessonPlan>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async updateStatus(id: string, status: LessonPlanStatus): Promise<LessonPlan> {
    const response = await apiClient.patch<LessonPlan>(
      `${this.baseUrl}/${id}/status?status=${status}`
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const lessonPlanService = new LessonPlanService();
