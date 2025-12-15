import { apiClient } from '../api-client';

export enum HomeworkType {
  ASSIGNMENT = 'ASSIGNMENT',
  PROJECT = 'PROJECT',
  HOMEWORK = 'HOMEWORK',
  PRACTICE = 'PRACTICE',
  READING = 'READING',
  RESEARCH = 'RESEARCH',
}

export enum HomeworkStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  LATE = 'LATE',
  GRADED = 'GRADED',
  RETURNED = 'RETURNED',
}

export interface Attachment {
  name: string;
  url: string;
  type?: string;
  size?: number;
}

export interface Homework {
  _id: string;
  tenantId?: string;
  title: string;
  description?: string;
  type: HomeworkType;
  classId: { _id: string; name: string; grade?: string; section?: string };
  subjectId: { _id: string; name: string; code?: string };
  teacherId: { _id: string; firstName: string; lastName: string };
  dueDate: string;
  maxScore?: number;
  attachments: Attachment[];
  instructions?: string;
  allowLateSubmission: boolean;
  latePenaltyPercent?: number;
  status: HomeworkStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  _id: string;
  tenantId?: string;
  homeworkId: Homework;
  studentId: { _id: string; firstName: string; lastName: string; studentId?: string };
  content?: string;
  attachments: Attachment[];
  submittedAt?: string;
  status: SubmissionStatus;
  score?: number;
  maxScore?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: { _id: string; firstName: string; lastName: string };
  isLate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomeworkStatistics {
  totalStudents: number;
  submitted: number;
  pending: number;
  graded: number;
  averageScore: number;
}

class HomeworkService {
  private baseUrl = '/homework';

  // Homework CRUD
  async create(data: {
    title: string;
    description?: string;
    type: HomeworkType;
    classId: string;
    subjectId: string;
    dueDate: string;
    maxScore?: number;
    attachments?: Attachment[];
    instructions?: string;
    allowLateSubmission?: boolean;
    latePenaltyPercent?: number;
    status?: HomeworkStatus;
  }): Promise<Homework> {
    const response = await apiClient.post<Homework>(this.baseUrl, data);
    return response.data;
  }

  async getAll(filters?: {
    classId?: string;
    subjectId?: string;
    status?: HomeworkStatus;
  }): Promise<Homework[]> {
    const params = new URLSearchParams();
    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await apiClient.get<Homework[]>(url);
    return response.data;
  }

  async getMyAssignments(): Promise<Homework[]> {
    const response = await apiClient.get<Homework[]>(`${this.baseUrl}/my-assignments`);
    return response.data;
  }

  async getClassHomework(classId: string): Promise<Homework[]> {
    const response = await apiClient.get<Homework[]>(`${this.baseUrl}/class/${classId}`);
    return response.data;
  }

  async getById(id: string): Promise<Homework> {
    const response = await apiClient.get<Homework>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async update(id: string, data: {
    title?: string;
    description?: string;
    type?: HomeworkType;
    classId?: string;
    subjectId?: string;
    dueDate?: string;
    maxScore?: number;
    attachments?: Attachment[];
    instructions?: string;
    allowLateSubmission?: boolean;
    latePenaltyPercent?: number;
    status?: HomeworkStatus;
  }): Promise<Homework> {
    const response = await apiClient.put<Homework>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async publish(id: string): Promise<Homework> {
    const response = await apiClient.post<Homework>(`${this.baseUrl}/${id}/publish`);
    return response.data;
  }

  async close(id: string): Promise<Homework> {
    const response = await apiClient.post<Homework>(`${this.baseUrl}/${id}/close`);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getStatistics(id: string): Promise<HomeworkStatistics> {
    const response = await apiClient.get<HomeworkStatistics>(`${this.baseUrl}/${id}/statistics`);
    return response.data;
  }

  // Submissions
  async submitHomework(data: {
    homeworkId: string;
    content?: string;
    attachments?: Attachment[];
  }): Promise<Submission> {
    const response = await apiClient.post<Submission>(`${this.baseUrl}/submissions`, data);
    return response.data;
  }

  async getHomeworkSubmissions(homeworkId: string): Promise<Submission[]> {
    const response = await apiClient.get<Submission[]>(`${this.baseUrl}/${homeworkId}/submissions`);
    return response.data;
  }

  async getStudentSubmission(homeworkId: string, studentId: string): Promise<Submission | null> {
    const response = await apiClient.get<Submission>(
      `${this.baseUrl}/${homeworkId}/submissions/${studentId}`,
    );
    return response.data;
  }

  async getStudentSubmissions(studentId: string): Promise<Submission[]> {
    const response = await apiClient.get<Submission[]>(`${this.baseUrl}/submissions/student/${studentId}`);
    return response.data;
  }

  async gradeSubmission(submissionId: string, score: number, feedback?: string): Promise<Submission> {
    const response = await apiClient.post<Submission>(`${this.baseUrl}/submissions/${submissionId}/grade`, {
      score,
      feedback,
    });
    return response.data;
  }
}

export const homeworkService = new HomeworkService();
