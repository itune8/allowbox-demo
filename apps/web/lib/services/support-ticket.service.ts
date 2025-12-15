import { apiClient } from '../api-client';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_USER = 'WAITING_FOR_USER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketCategory {
  TECHNICAL = 'TECHNICAL',
  BILLING = 'BILLING',
  ACCOUNT = 'ACCOUNT',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  BUG_REPORT = 'BUG_REPORT',
  GENERAL = 'GENERAL',
  OTHER = 'OTHER',
}

export interface TicketAttachment {
  name: string;
  url: string;
  type: string;
}

export interface TicketComment {
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role?: string;
  };
  content: string;
  isInternal: boolean;
  attachments?: TicketAttachment[];
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  tenantId?: {
    _id: string;
    schoolName: string;
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role?: string;
  };
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role?: string;
  };
  comments: TicketComment[];
  attachments?: TicketAttachment[];
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  attachments?: TicketAttachment[];
}

export interface UpdateTicketDto {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTo?: string;
}

export interface AddCommentDto {
  content: string;
  isInternal?: boolean;
}

export interface TicketStatistics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResolutionTimeHours: number;
}

class SupportTicketService {
  private baseUrl = '/support-tickets';

  async create(data: CreateTicketDto): Promise<SupportTicket> {
    const response = await apiClient.post<SupportTicket>(this.baseUrl, data);
    return response.data;
  }

  async getMyTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get<SupportTicket[]>(`${this.baseUrl}/my-tickets`);
    return response.data;
  }

  async getSchoolTickets(): Promise<SupportTicket[]> {
    const response = await apiClient.get<SupportTicket[]>(`${this.baseUrl}/school-tickets`);
    return response.data;
  }

  async getAll(filters?: {
    status?: TicketStatus;
    assignedTo?: string;
    tenantId?: string;
  }): Promise<SupportTicket[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.tenantId) params.append('tenantId', filters.tenantId);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<SupportTicket[]>(url);
    return response.data;
  }

  async getUnassigned(): Promise<SupportTicket[]> {
    const response = await apiClient.get<SupportTicket[]>(`${this.baseUrl}/unassigned`);
    return response.data;
  }

  async getAssignedToMe(): Promise<SupportTicket[]> {
    const response = await apiClient.get<SupportTicket[]>(`${this.baseUrl}/assigned-to-me`);
    return response.data;
  }

  async getStatistics(): Promise<TicketStatistics> {
    const response = await apiClient.get<TicketStatistics>(`${this.baseUrl}/statistics`);
    return response.data;
  }

  async getById(id: string): Promise<SupportTicket> {
    const response = await apiClient.get<SupportTicket>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getByTicketNumber(ticketNumber: string): Promise<SupportTicket> {
    const response = await apiClient.get<SupportTicket>(`${this.baseUrl}/by-number/${ticketNumber}`);
    return response.data;
  }

  async update(id: string, data: UpdateTicketDto): Promise<SupportTicket> {
    const response = await apiClient.patch<SupportTicket>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async addComment(id: string, data: AddCommentDto): Promise<SupportTicket> {
    const response = await apiClient.post<SupportTicket>(`${this.baseUrl}/${id}/comments`, data);
    return response.data;
  }

  async assignTicket(id: string, assigneeId: string): Promise<SupportTicket> {
    const response = await apiClient.patch<SupportTicket>(`${this.baseUrl}/${id}/assign`, { assigneeId });
    return response.data;
  }

  async claimTicket(id: string): Promise<SupportTicket> {
    const response = await apiClient.patch<SupportTicket>(`${this.baseUrl}/${id}/claim`);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const supportTicketService = new SupportTicketService();
