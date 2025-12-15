import { apiClient } from '../api-client';

export enum EventType {
  ACADEMIC = 'ACADEMIC',
  SPORTS = 'SPORTS',
  CULTURAL = 'CULTURAL',
  HOLIDAY = 'HOLIDAY',
  MEETING = 'MEETING',
  EXAM = 'EXAM',
  OTHER = 'OTHER',
}

export enum EventVisibility {
  ALL = 'ALL',
  PARENTS = 'PARENTS',
  TEACHERS = 'TEACHERS',
  STUDENTS = 'STUDENTS',
  STAFF = 'STAFF',
}

export interface EventAttachment {
  name: string;
  url: string;
  type: string;
}

export interface Event {
  _id: string;
  id?: string;
  tenantId: string;
  title: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  visibility: EventVisibility[];
  classIds?: Array<{
    _id: string;
    name: string;
    grade: string;
  }>;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role?: string;
  };
  isActive: boolean;
  imageUrl?: string;
  attachments?: EventAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  description: string;
  type?: EventType;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  visibility?: EventVisibility[];
  classIds?: string[];
  imageUrl?: string;
  attachments?: EventAttachment[];
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  isActive?: boolean;
}

class EventService {
  private baseUrl = '/events';

  async create(data: CreateEventDto): Promise<Event> {
    const response = await apiClient.post<Event>(this.baseUrl, data);
    return response.data;
  }

  async getAll(filters?: {
    type?: EventType;
    startDate?: string;
    endDate?: string;
    visibility?: EventVisibility;
    classId?: string;
  }): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.visibility) params.append('visibility', filters.visibility);
    if (filters?.classId) params.append('classId', filters.classId);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<Event[]>(url);
    return response.data;
  }

  async getUpcoming(
    visibility?: EventVisibility,
    classId?: string,
    limit = 10,
  ): Promise<Event[]> {
    const params = new URLSearchParams();
    if (visibility) params.append('visibility', visibility);
    if (classId) params.append('classId', classId);
    params.append('limit', limit.toString());

    const response = await apiClient.get<Event[]>(
      `${this.baseUrl}/upcoming?${params.toString()}`,
    );
    return response.data;
  }

  async getCalendarEvents(
    year: number,
    month: number,
    visibility?: EventVisibility,
  ): Promise<Event[]> {
    const params = new URLSearchParams();
    params.append('year', year.toString());
    params.append('month', month.toString());
    if (visibility) params.append('visibility', visibility);

    const response = await apiClient.get<Event[]>(
      `${this.baseUrl}/calendar?${params.toString()}`,
    );
    return response.data;
  }

  async getById(id: string): Promise<Event> {
    const response = await apiClient.get<Event>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateEventDto): Promise<Event> {
    const response = await apiClient.patch<Event>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const eventService = new EventService();
