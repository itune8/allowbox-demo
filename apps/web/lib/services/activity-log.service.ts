// Activity Log Service
import { apiClient } from '../api-client';

export interface ActivityLog {
  id: string;
  _id: string;
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ActivityLogsResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ActivityLogsQuery {
  action?: string;
  userId?: string;
  tenantId?: string;
  targetType?: string;
  level?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ActivityStats {
  totalActions: number;
  byAction: Record<string, number>;
  byLevel: Record<string, number>;
  recentActivity: ActivityLog[];
}

export const activityLogService = {
  async getLogs(query: ActivityLogsQuery = {}): Promise<ActivityLogsResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await apiClient.get<ActivityLogsResponse>(`/activity-logs?${params}`);
    return response.data;
  },

  async getStats(days = 30): Promise<ActivityStats> {
    const response = await apiClient.get<ActivityStats>(`/activity-logs/stats?days=${days}`);
    return response.data;
  },

  async getMyActivity(): Promise<ActivityLog[]> {
    const response = await apiClient.get<ActivityLog[]>('/activity-logs/my-activity');
    return response.data;
  },
};
