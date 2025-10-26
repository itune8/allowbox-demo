import { apiClient } from '../api-client';

export interface Mark {
  _id: string;
  tenantId: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
  enteredBy: string;
  isAbsent: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  student?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
  };
  subject?: {
    _id: string;
    name: string;
    code: string;
  };
  exam?: {
    _id: string;
    name: string;
  };
}

export interface EnterMarkDto {
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
  isAbsent?: boolean;
}

export interface UpdateMarkDto {
  marksObtained?: number;
  maxMarks?: number;
  grade?: string;
  remarks?: string;
  isAbsent?: boolean;
}

export interface StudentMarksReport {
  studentId: string;
  studentName: string;
  examName: string;
  marks: {
    subjectName: string;
    subjectCode: string;
    marksObtained: number;
    maxMarks: number;
    percentage: number;
    grade?: string;
    isAbsent: boolean;
  }[];
  totalMarks: number;
  totalMaxMarks: number;
  overallPercentage: number;
}

class MarkService {
  private baseUrl = '/marks';

  async enterMark(data: EnterMarkDto): Promise<Mark> {
    const response = await apiClient.post<Mark>(this.baseUrl, data);
    return response.data;
  }

  async getMarks(filters?: { examId?: string; studentId?: string; subjectId?: string }): Promise<Mark[]> {
    const response = await apiClient.get<Mark[]>(this.baseUrl, { params: filters });
    return response.data;
  }

  async getMarksByExam(examId: string): Promise<Mark[]> {
    const response = await apiClient.get<Mark[]>(`${this.baseUrl}/by-exam/${examId}`);
    return response.data;
  }

  async getMarksByStudent(studentId: string): Promise<Mark[]> {
    const response = await apiClient.get<Mark[]>(`${this.baseUrl}/by-student/${studentId}`);
    return response.data;
  }

  async getMarkById(id: string): Promise<Mark> {
    const response = await apiClient.get<Mark>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateMark(id: string, data: UpdateMarkDto): Promise<Mark> {
    const response = await apiClient.patch<Mark>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteMark(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getStudentMarksReport(studentId: string, examId: string): Promise<StudentMarksReport | null> {
    const marks = await this.getMarks({ studentId, examId });

    if (marks.length === 0) {
      return null;
    }

    const student = marks[0]?.student;
    const exam = marks[0]?.exam;

    const marksData = marks.map(mark => ({
      subjectName: mark.subject?.name || '',
      subjectCode: mark.subject?.code || '',
      marksObtained: mark.marksObtained,
      maxMarks: mark.maxMarks,
      percentage: (mark.marksObtained / mark.maxMarks) * 100,
      grade: mark.grade,
      isAbsent: mark.isAbsent,
    }));

    const totalMarks = marks.reduce((sum, mark) => sum + (mark.isAbsent ? 0 : mark.marksObtained), 0);
    const totalMaxMarks = marks.reduce((sum, mark) => sum + mark.maxMarks, 0);

    return {
      studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : '',
      examName: exam?.name || '',
      marks: marksData,
      totalMarks,
      totalMaxMarks,
      overallPercentage: totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0,
    };
  }
}

export const markService = new MarkService();
