// Announcement Service
import { apiClient } from '../api-client';

export type AnnouncementTarget = 'ALL' | 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'SPECIFIC';
export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type AnnouncementStatus = 'DRAFT' | 'SENT' | 'SCHEDULED';

export interface Announcement {
  id: string;
  _id: string;
  title: string;
  message: string;
  target: AnnouncementTarget;
  targetTenants?: string[];
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  createdByName?: string;
  scheduledAt?: string;
  sentAt?: string;
  readCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementDto {
  title: string;
  message: string;
  target?: AnnouncementTarget;
  targetTenants?: string[];
  priority?: AnnouncementPriority;
  scheduledAt?: string;
  expiresAt?: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  message?: string;
  target?: AnnouncementTarget;
  targetTenants?: string[];
  priority?: AnnouncementPriority;
  expiresAt?: string;
}

export interface AnnouncementStats {
  total: number;
  sent: number;
  scheduled: number;
  byTarget: Record<string, number>;
}

export const announcementService = {
  async getAll(includeInactive = false): Promise<Announcement[]> {
    const response = await apiClient.get<Announcement[]>(
      `/announcements?includeInactive=${includeInactive}`
    );
    return response.data;
  },

  async getById(id: string): Promise<Announcement> {
    const response = await apiClient.get<Announcement>(`/announcements/${id}`);
    return response.data;
  },

  async getForTenant(): Promise<Announcement[]> {
    const response = await apiClient.get<Announcement[]>('/announcements/for-tenant');
    return response.data;
  },

  async getStats(): Promise<AnnouncementStats> {
    const response = await apiClient.get<AnnouncementStats>('/announcements/stats');
    return response.data;
  },

  async create(data: CreateAnnouncementDto): Promise<Announcement> {
    const response = await apiClient.post<Announcement>('/announcements', data);
    return response.data;
  },

  async update(id: string, data: UpdateAnnouncementDto): Promise<Announcement> {
    const response = await apiClient.put<Announcement>(`/announcements/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/announcements/${id}`);
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.post(`/announcements/${id}/mark-read`);
  },
};
