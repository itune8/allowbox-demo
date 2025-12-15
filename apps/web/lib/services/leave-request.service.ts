import { apiClient } from '../api-client';

export enum LeaveType {
  SICK = 'SICK',
  CASUAL = 'CASUAL',
  EARNED = 'EARNED',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  OTHER = 'OTHER',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface LeaveRequest {
  _id: string;
  id?: string;
  tenantId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    employeeId?: string;
  };
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  approverComment?: string;
  contactDuringLeave?: string;
  isHalfDay: boolean;
  halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestDto {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  contactDuringLeave?: string;
  isHalfDay?: boolean;
  halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
}

export interface UpdateLeaveRequestDto {
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
  reason?: string;
  contactDuringLeave?: string;
  isHalfDay?: boolean;
  halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
}

export interface ApproveLeaveRequestDto {
  status: LeaveStatus.APPROVED | LeaveStatus.REJECTED;
  comment?: string;
}

export interface LeaveStats {
  totalDays: number;
  byType: Record<LeaveType, number>;
}

export interface LeaveRequestFilters {
  userId?: string;
  status?: LeaveStatus;
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
}

class LeaveRequestService {
  private baseUrl = '/leave-requests';

  async create(data: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const response = await apiClient.post<LeaveRequest>(this.baseUrl, data);
    return response.data;
  }

  async getAll(filters?: LeaveRequestFilters): Promise<LeaveRequest[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.leaveType) params.append('leaveType', filters.leaveType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<LeaveRequest[]>(url);
    return response.data;
  }

  async getMyRequests(): Promise<LeaveRequest[]> {
    const response = await apiClient.get<LeaveRequest[]>(`${this.baseUrl}/my-requests`);
    return response.data;
  }

  async getPendingRequests(): Promise<LeaveRequest[]> {
    const response = await apiClient.get<LeaveRequest[]>(`${this.baseUrl}/pending`);
    return response.data;
  }

  async getMyStats(year?: number): Promise<LeaveStats> {
    const params = year ? `?year=${year}` : '';
    const response = await apiClient.get<LeaveStats>(`${this.baseUrl}/my-stats${params}`);
    return response.data;
  }

  async getTeamCalendar(startDate: string, endDate: string): Promise<LeaveRequest[]> {
    const response = await apiClient.get<LeaveRequest[]>(
      `${this.baseUrl}/calendar?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  async getById(id: string): Promise<LeaveRequest> {
    const response = await apiClient.get<LeaveRequest>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateLeaveRequestDto): Promise<LeaveRequest> {
    const response = await apiClient.patch<LeaveRequest>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async approve(id: string, data: ApproveLeaveRequestDto): Promise<LeaveRequest> {
    const response = await apiClient.patch<LeaveRequest>(`${this.baseUrl}/${id}/approve`, data);
    return response.data;
  }

  async cancel(id: string): Promise<LeaveRequest> {
    const response = await apiClient.patch<LeaveRequest>(`${this.baseUrl}/${id}/cancel`);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const leaveRequestService = new LeaveRequestService();
