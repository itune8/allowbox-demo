import { apiClient } from '../api-client';

export enum DiaryEntryType {
  DAILY_UPDATE = 'DAILY_UPDATE',
  BEHAVIOR = 'BEHAVIOR',
  ACHIEVEMENT = 'ACHIEVEMENT',
  CONCERN = 'CONCERN',
  REMINDER = 'REMINDER',
  HEALTH = 'HEALTH',
  GENERAL = 'GENERAL',
}

export enum AcknowledgementStatus {
  PENDING = 'PENDING',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

export interface DiaryAttachment {
  name: string;
  url: string;
  type?: string;
}

export interface DailyDiary {
  _id: string;
  tenantId?: string;
  studentId: { _id: string; firstName: string; lastName: string; studentId?: string };
  classId: { _id: string; name: string; grade?: string };
  date: string;
  type: DiaryEntryType;
  title: string;
  content: string;
  attachments: DiaryAttachment[];
  createdBy: { _id: string; firstName: string; lastName: string; role?: string };
  acknowledgementStatus: AcknowledgementStatus;
  acknowledgedBy?: { _id: string; firstName: string; lastName: string };
  acknowledgedAt?: string;
  parentComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassDiary {
  _id: string;
  tenantId?: string;
  classId: { _id: string; name: string; grade?: string };
  date: string;
  title: string;
  content: string;
  attachments: DiaryAttachment[];
  createdBy: { _id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

class DailyDiaryService {
  private baseUrl = '/daily-diary';

  // Student Diary
  async createStudentDiary(data: {
    studentId: string;
    classId: string;
    date?: string;
    type: DiaryEntryType;
    title: string;
    content: string;
    attachments?: DiaryAttachment[];
  }): Promise<DailyDiary> {
    const response = await apiClient.post<DailyDiary>(`${this.baseUrl}/student`, data);
    return response.data;
  }

  async createBulkStudentDiary(data: {
    classId: string;
    studentIds: string[];
    date?: string;
    type: DiaryEntryType;
    title: string;
    content: string;
    attachments?: DiaryAttachment[];
  }): Promise<DailyDiary[]> {
    const response = await apiClient.post<DailyDiary[]>(`${this.baseUrl}/student/bulk`, data);
    return response.data;
  }

  async getStudentDiaries(
    studentId: string,
    filters?: { startDate?: string; endDate?: string; type?: DiaryEntryType },
  ): Promise<DailyDiary[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.type) params.append('type', filters.type);

    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/student/${studentId}?${queryString}`
      : `${this.baseUrl}/student/${studentId}`;
    const response = await apiClient.get<DailyDiary[]>(url);
    return response.data;
  }

  async getUnacknowledgedDiaries(studentId: string): Promise<DailyDiary[]> {
    const response = await apiClient.get<DailyDiary[]>(`${this.baseUrl}/student/${studentId}/unacknowledged`);
    return response.data;
  }

  async getClassStudentDiaries(classId: string, date?: string): Promise<DailyDiary[]> {
    const url = date
      ? `${this.baseUrl}/class/${classId}/students?date=${date}`
      : `${this.baseUrl}/class/${classId}/students`;
    const response = await apiClient.get<DailyDiary[]>(url);
    return response.data;
  }

  async getDiaryById(id: string): Promise<DailyDiary> {
    const response = await apiClient.get<DailyDiary>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateStudentDiary(id: string, data: Partial<DailyDiary>): Promise<DailyDiary> {
    const response = await apiClient.put<DailyDiary>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async acknowledgeDiary(id: string, parentComment?: string): Promise<DailyDiary> {
    const response = await apiClient.post<DailyDiary>(`${this.baseUrl}/${id}/acknowledge`, { parentComment });
    return response.data;
  }

  async deleteStudentDiary(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Class Diary (Announcements)
  async createClassDiary(data: {
    classId: string;
    date?: string;
    title: string;
    content: string;
    attachments?: DiaryAttachment[];
  }): Promise<ClassDiary> {
    const response = await apiClient.post<ClassDiary>(`${this.baseUrl}/class`, data);
    return response.data;
  }

  async getClassAnnouncements(
    classId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ClassDiary[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/class/${classId}?${queryString}`
      : `${this.baseUrl}/class/${classId}`;
    const response = await apiClient.get<ClassDiary[]>(url);
    return response.data;
  }

  async updateClassDiary(id: string, data: Partial<ClassDiary>): Promise<ClassDiary> {
    const response = await apiClient.put<ClassDiary>(`${this.baseUrl}/class/${id}`, data);
    return response.data;
  }

  async deleteClassDiary(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/class/${id}`);
  }
}

export const dailyDiaryService = new DailyDiaryService();
