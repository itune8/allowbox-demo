import { apiClient } from '../api-client';

export enum MessageType {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  CLASS_MESSAGE = 'CLASS_MESSAGE',
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
}

export enum RecipientGroup {
  ALL_PARENTS = 'ALL_PARENTS',
  ALL_TEACHERS = 'ALL_TEACHERS',
  ALL_STAFF = 'ALL_STAFF',
  ALL_STUDENTS = 'ALL_STUDENTS',
  CLASS = 'CLASS',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum MessagePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface MessageAttachment {
  name: string;
  url: string;
  type: string;
}

export interface Message {
  _id: string;
  id?: string;
  tenantId: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role?: string;
  };
  type: MessageType;
  recipientGroup: RecipientGroup;
  classId?: {
    _id: string;
    name: string;
    grade: string;
  };
  recipientIds: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  }>;
  subject: string;
  content: string;
  priority: MessagePriority;
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  attachments: MessageAttachment[];
  scheduledAt?: string;
  isSent: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageDto {
  type: MessageType;
  recipientGroup: RecipientGroup;
  classId?: string;
  recipientIds?: string[];
  subject: string;
  content: string;
  priority?: MessagePriority;
  attachments?: MessageAttachment[];
  scheduledAt?: string;
}

export interface UpdateMessageDto {
  type?: MessageType;
  recipientGroup?: RecipientGroup;
  classId?: string;
  recipientIds?: string[];
  subject?: string;
  content?: string;
  priority?: MessagePriority;
  attachments?: MessageAttachment[];
  scheduledAt?: string;
}

class MessageService {
  private baseUrl = '/messages';

  async create(data: CreateMessageDto): Promise<Message> {
    const response = await apiClient.post<Message>(this.baseUrl, data);
    return response.data;
  }

  async getAll(filters?: {
    type?: MessageType;
    recipientGroup?: RecipientGroup;
    senderId?: string;
  }): Promise<Message[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.recipientGroup) params.append('recipientGroup', filters.recipientGroup);
    if (filters?.senderId) params.append('senderId', filters.senderId);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<Message[]>(url);
    return response.data;
  }

  async getInbox(classId?: string): Promise<Message[]> {
    const params = classId ? `?classId=${classId}` : '';
    const response = await apiClient.get<Message[]>(`${this.baseUrl}/inbox${params}`);
    return response.data;
  }

  async getSentMessages(): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(`${this.baseUrl}/sent`);
    return response.data;
  }

  async getUnreadCount(classId?: string): Promise<{ unreadCount: number }> {
    const params = classId ? `?classId=${classId}` : '';
    const response = await apiClient.get<{ unreadCount: number }>(
      `${this.baseUrl}/unread-count${params}`
    );
    return response.data;
  }

  async getById(id: string): Promise<Message> {
    const response = await apiClient.get<Message>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateMessageDto): Promise<Message> {
    const response = await apiClient.patch<Message>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async markAsRead(id: string): Promise<Message> {
    const response = await apiClient.patch<Message>(`${this.baseUrl}/${id}/read`);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const messageService = new MessageService();
