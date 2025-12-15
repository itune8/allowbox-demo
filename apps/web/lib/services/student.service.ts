// apps/web/lib/services/student.service.ts
import { apiClient } from '../api-client';
import { StudentFormData } from '../../components/modals/create-student-modal';

export interface StudentResponse {
  id: string;
  _id?: string; // MongoDB ID
  firstName: string;
  lastName: string;
  email?: string;
  studentId?: string;
  tenantId: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  phoneNumber?: string;
  classId?: string;
  isActive: boolean;
}

// Alias for backward compatibility
export type Student = StudentResponse;

class StudentService {
  /**
   * Create a new student
   */
  async createStudent(studentData: StudentFormData): Promise<StudentResponse> {
    // Use simple default password for all students (can be changed later)
    const defaultPassword = 'student123';

    // Only send student-relevant fields (exclude teacher/staff fields)
    const payload = {
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email || `student${Date.now()}@temp.local`,
      password: defaultPassword,
      role: 'student',
      dateOfBirth: studentData.dateOfBirth,
      gender: studentData.gender,
      bloodGroup: studentData.bloodGroup,
      address: studentData.address,
      phoneNumber: studentData.phoneNumber,
      studentId: studentData.studentId || undefined, // Only if provided
      parentEmail: studentData.parentEmail,
      parentPhone: studentData.parentPhone,
    };

    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined || payload[key as keyof typeof payload] === '') {
        delete payload[key as keyof typeof payload];
      }
    });

    const response = await apiClient.post<StudentResponse>('/users', payload);
    return response.data;
  }

  /**
   * Get all students
   */
  async getStudents(): Promise<StudentResponse[]> {
    const response = await apiClient.get<StudentResponse[]>('/users?role=student');
    return response.data;
  }

  /**
   * Get student by ID
   */
  async getStudentById(studentId: string): Promise<StudentResponse> {
    const response = await apiClient.get<StudentResponse>(`/users/${studentId}`);
    return response.data;
  }

  /**
   * Update student
   */
  async updateStudent(studentId: string, data: Partial<StudentFormData>): Promise<StudentResponse> {
    const response = await apiClient.patch<StudentResponse>(`/users/${studentId}`, data);
    return response.data;
  }

  /**
   * Delete student
   */
  async deleteStudent(studentId: string): Promise<void> {
    await apiClient.delete(`/users/${studentId}`);
  }

  /**
   * Get students by class ID
   */
  async getStudentsByClass(classId: string): Promise<StudentResponse[]> {
    const allStudents = await this.getStudents();
    return allStudents.filter(student => student.classId === classId);
  }
}

export const studentService = new StudentService();
