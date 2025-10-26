import { apiClient } from '../api-client';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
  _id: string;
  tenantId: string;
  studentId: string;
  classId: string;
  date: string;
  period?: number;
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
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
  class?: {
    _id: string;
    name: string;
    grade: string;
  };
}

export interface MarkAttendanceDto {
  studentId: string;
  classId: string;
  date: string;
  period?: number;
  status: AttendanceStatus;
  remarks?: string;
}

export interface BulkMarkAttendanceDto {
  classId: string;
  section?: string;
  date: string;
  period?: number;
  attendanceRecords: {
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
  }[];
}

export interface UpdateAttendanceDto {
  status?: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendancePercentage: number;
}

class AttendanceService {
  private baseUrl = '/attendance';

  async markAttendance(data: MarkAttendanceDto): Promise<Attendance> {
    const response = await apiClient.post<Attendance>(this.baseUrl, data);
    return response.data;
  }

  async bulkMarkAttendance(data: BulkMarkAttendanceDto): Promise<Attendance[]> {
    const promises = data.attendanceRecords.map(record =>
      this.markAttendance({
        studentId: record.studentId,
        classId: data.classId,
        date: data.date,
        period: data.period,
        status: record.status,
        remarks: record.remarks,
      })
    );
    return Promise.all(promises);
  }

  async getAttendanceRecords(filters?: {
    studentId?: string;
    classId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Attendance[]> {
    const response = await apiClient.get<Attendance[]>(this.baseUrl, { params: filters });
    return response.data;
  }

  async getAttendanceByClass(classId: string, date: string, section?: string): Promise<Attendance[]> {
    const params = section ? { date, section } : { date };
    const response = await apiClient.get<Attendance[]>(`${this.baseUrl}/by-class/${classId}`, { params });
    return response.data;
  }

  async getAttendanceByStudent(studentId: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
    const params = { startDate, endDate };
    const response = await apiClient.get<Attendance[]>(`${this.baseUrl}/by-student/${studentId}`, { params });
    return response.data;
  }

  async getAttendanceById(id: string): Promise<Attendance> {
    const response = await apiClient.get<Attendance>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateAttendance(id: string, data: UpdateAttendanceDto): Promise<Attendance> {
    const response = await apiClient.patch<Attendance>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteAttendance(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getStudentAttendanceStats(studentId: string, startDate?: string, endDate?: string): Promise<AttendanceStats> {
    const records = await this.getAttendanceByStudent(studentId, startDate, endDate);

    const stats = {
      totalDays: records.length,
      presentDays: records.filter(r => r.status === 'present').length,
      absentDays: records.filter(r => r.status === 'absent').length,
      lateDays: records.filter(r => r.status === 'late').length,
      excusedDays: records.filter(r => r.status === 'excused').length,
      attendancePercentage: 0,
    };

    if (stats.totalDays > 0) {
      stats.attendancePercentage = ((stats.presentDays + stats.lateDays) / stats.totalDays) * 100;
    }

    return stats;
  }
}

export const attendanceService = new AttendanceService();
