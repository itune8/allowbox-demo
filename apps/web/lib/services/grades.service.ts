import { apiClient } from '../api-client';

export enum GradeType {
  EXAM = 'EXAM',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  PROJECT = 'PROJECT',
  PRACTICAL = 'PRACTICAL',
  PARTICIPATION = 'PARTICIPATION',
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
}

export enum ReportCardStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Grade {
  _id: string;
  tenantId?: string;
  studentId: { _id: string; firstName: string; lastName: string; studentId?: string };
  classId: { _id: string; name: string; grade?: string };
  subjectId: { _id: string; name: string; code?: string };
  type: GradeType;
  assessmentName?: string;
  maxScore: number;
  score: number;
  percentage: number;
  grade: string;
  remarks?: string;
  academicYear?: string;
  term?: string;
  assessmentDate?: string;
  gradedBy?: { _id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface SubjectGrade {
  subjectId: { _id: string; name: string; code?: string };
  subjectName?: string;
  obtainedMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
  teacherId?: { _id: string; firstName: string; lastName: string };
}

export interface ReportCard {
  _id: string;
  tenantId?: string;
  studentId: { _id: string; firstName: string; lastName: string; studentId?: string };
  classId: { _id: string; name: string; grade?: string; section?: string };
  academicYear: string;
  term: string;
  subjects: SubjectGrade[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
  rank?: number;
  attendance?: number;
  conduct?: string;
  teacherRemarks?: string;
  principalRemarks?: string;
  status: ReportCardStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

class GradesService {
  private baseUrl = '/grades';

  // Grades
  async createGrade(data: {
    studentId: string;
    classId: string;
    subjectId: string;
    type: GradeType;
    assessmentName?: string;
    maxScore: number;
    score: number;
    remarks?: string;
    academicYear?: string;
    term?: string;
    assessmentDate?: string;
  }): Promise<Grade> {
    const response = await apiClient.post<Grade>(this.baseUrl, data);
    return response.data;
  }

  async createBulkGrades(data: {
    classId: string;
    subjectId: string;
    type: GradeType;
    assessmentName?: string;
    maxScore: number;
    academicYear?: string;
    term?: string;
    assessmentDate?: string;
    grades: { studentId: string; score: number; remarks?: string }[];
  }): Promise<Grade[]> {
    const response = await apiClient.post<Grade[]>(`${this.baseUrl}/bulk`, data);
    return response.data;
  }

  async getStudentGrades(
    studentId: string,
    filters?: { subjectId?: string; type?: GradeType; academicYear?: string; term?: string },
  ): Promise<Grade[]> {
    const params = new URLSearchParams();
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.academicYear) params.append('academicYear', filters.academicYear);
    if (filters?.term) params.append('term', filters.term);

    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/student/${studentId}?${queryString}`
      : `${this.baseUrl}/student/${studentId}`;
    const response = await apiClient.get<Grade[]>(url);
    return response.data;
  }

  async getClassGrades(
    classId: string,
    filters?: { subjectId?: string; type?: GradeType; assessmentName?: string },
  ): Promise<Grade[]> {
    const params = new URLSearchParams();
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.assessmentName) params.append('assessmentName', filters.assessmentName);

    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/class/${classId}?${queryString}`
      : `${this.baseUrl}/class/${classId}`;
    const response = await apiClient.get<Grade[]>(url);
    return response.data;
  }

  async updateGrade(id: string, score: number, remarks?: string): Promise<Grade> {
    const response = await apiClient.put<Grade>(`${this.baseUrl}/${id}`, { score, remarks });
    return response.data;
  }

  async deleteGrade(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // Report Cards
  async createReportCard(data: {
    studentId: string;
    classId: string;
    academicYear: string;
    term: string;
    subjects: {
      subjectId: string;
      subjectName?: string;
      obtainedMarks: number;
      maxMarks: number;
      remarks?: string;
      teacherId?: string;
    }[];
    attendance?: number;
    conduct?: string;
    teacherRemarks?: string;
    principalRemarks?: string;
  }): Promise<ReportCard> {
    const response = await apiClient.post<ReportCard>(`${this.baseUrl}/report-cards`, data);
    return response.data;
  }

  async getStudentReportCards(studentId: string): Promise<ReportCard[]> {
    const response = await apiClient.get<ReportCard[]>(`${this.baseUrl}/report-cards/student/${studentId}`);
    return response.data;
  }

  async getClassReportCards(classId: string, academicYear: string, term: string): Promise<ReportCard[]> {
    const response = await apiClient.get<ReportCard[]>(
      `${this.baseUrl}/report-cards/class/${classId}?academicYear=${academicYear}&term=${term}`,
    );
    return response.data;
  }

  async getReportCardById(id: string): Promise<ReportCard> {
    const response = await apiClient.get<ReportCard>(`${this.baseUrl}/report-cards/${id}`);
    return response.data;
  }

  async updateReportCard(id: string, data: Partial<ReportCard>): Promise<ReportCard> {
    const response = await apiClient.put<ReportCard>(`${this.baseUrl}/report-cards/${id}`, data);
    return response.data;
  }

  async publishReportCards(classId: string, academicYear: string, term: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`${this.baseUrl}/report-cards/publish`, {
      classId,
      academicYear,
      term,
    });
    return response.data;
  }

  async deleteReportCard(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/report-cards/${id}`);
  }
}

export const gradesService = new GradesService();
