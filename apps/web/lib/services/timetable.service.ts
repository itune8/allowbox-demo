import { apiClient } from '../api-client';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimetableSlot {
  _id: string;
  tenantId: string;
  classId: string;
  section: string;
  subjectId: string;
  teacherId: string;
  day: DayOfWeek;
  period: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  subject?: {
    _id: string;
    name: string;
    code: string;
  };
  teacher?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  class?: {
    _id: string;
    name: string;
    grade: string;
  };
}

export interface CreateTimetableSlotDto {
  classId: string;
  section: string;
  subjectId: string;
  teacherId: string;
  day: DayOfWeek;
  period: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
}

export interface UpdateTimetableSlotDto {
  classId?: string;
  section?: string;
  subjectId?: string;
  teacherId?: string;
  day?: DayOfWeek;
  period?: number;
  startTime?: string;
  endTime?: string;
  roomNumber?: string;
  isActive?: boolean;
}

class TimetableService {
  private baseUrl = '/timetable';

  async createSlot(data: CreateTimetableSlotDto): Promise<TimetableSlot> {
    const response = await apiClient.post<TimetableSlot>(this.baseUrl, data);
    return response.data;
  }

  async getAllSlots(): Promise<TimetableSlot[]> {
    const response = await apiClient.get<TimetableSlot[]>(this.baseUrl);
    return response.data;
  }

  async getSlotsByClass(classId: string, section?: string): Promise<TimetableSlot[]> {
    const params = section ? { section } : {};
    const response = await apiClient.get<TimetableSlot[]>(`${this.baseUrl}/by-class/${classId}`, { params });
    return response.data;
  }

  async getSlotsByTeacher(teacherId: string): Promise<TimetableSlot[]> {
    const response = await apiClient.get<TimetableSlot[]>(`${this.baseUrl}/by-teacher/${teacherId}`);
    return response.data;
  }

  async getSlotById(id: string): Promise<TimetableSlot> {
    const response = await apiClient.get<TimetableSlot>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateSlot(id: string, data: UpdateTimetableSlotDto): Promise<TimetableSlot> {
    const response = await apiClient.patch<TimetableSlot>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteSlot(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Helper method to check for teacher conflicts
  async checkTeacherConflict(teacherId: string, day: DayOfWeek, period: number, excludeSlotId?: string): Promise<boolean> {
    const slots = await this.getSlotsByTeacher(teacherId);
    return slots.some(slot =>
      slot.day === day &&
      slot.period === period &&
      slot.isActive &&
      (!excludeSlotId || slot._id !== excludeSlotId)
    );
  }
}

export const timetableService = new TimetableService();
