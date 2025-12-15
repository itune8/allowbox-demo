import { apiClient } from '../api-client';

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export enum AllergyType {
  FOOD = 'FOOD',
  MEDICINE = 'MEDICINE',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  OTHER = 'OTHER',
}

export enum VaccinationStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
}

export interface Allergy {
  type: AllergyType;
  name: string;
  severity?: string;
  notes?: string;
}

export interface Vaccination {
  name: string;
  doseNumber?: number;
  dateAdministered?: string;
  nextDueDate?: string;
  status: VaccinationStatus;
  administeredBy?: string;
  notes?: string;
}

export interface MedicalCondition {
  name: string;
  diagnosedDate?: string;
  description?: string;
  treatment?: string;
  isOngoing?: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
}

export interface HealthRecord {
  _id: string;
  tenantId?: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    studentId?: string;
  };
  bloodGroup?: BloodGroup;
  height?: number;
  weight?: number;
  allergies: Allergy[];
  vaccinations: Vaccination[];
  medicalConditions: MedicalCondition[];
  emergencyContacts: EmergencyContact[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  primaryPhysician?: string;
  physicianPhone?: string;
  specialInstructions?: string;
  lastUpdatedBy?: { _id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthRecordDto {
  studentId: string;
  bloodGroup?: BloodGroup;
  height?: number;
  weight?: number;
  allergies?: Allergy[];
  vaccinations?: Vaccination[];
  medicalConditions?: MedicalCondition[];
  emergencyContacts?: EmergencyContact[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  primaryPhysician?: string;
  physicianPhone?: string;
  specialInstructions?: string;
}

class HealthRecordsService {
  private baseUrl = '/health-records';

  async create(data: CreateHealthRecordDto): Promise<HealthRecord> {
    const response = await apiClient.post<HealthRecord>(this.baseUrl, data);
    return response.data;
  }

  async getAll(): Promise<HealthRecord[]> {
    const response = await apiClient.get<HealthRecord[]>(this.baseUrl);
    return response.data;
  }

  async getByStudent(studentId: string): Promise<HealthRecord> {
    const response = await apiClient.get<HealthRecord>(`${this.baseUrl}/student/${studentId}`);
    return response.data;
  }

  async getById(id: string): Promise<HealthRecord> {
    const response = await apiClient.get<HealthRecord>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async update(id: string, data: Partial<CreateHealthRecordDto>): Promise<HealthRecord> {
    const response = await apiClient.put<HealthRecord>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async addVaccination(id: string, vaccination: Vaccination): Promise<HealthRecord> {
    const response = await apiClient.post<HealthRecord>(`${this.baseUrl}/${id}/vaccinations`, vaccination);
    return response.data;
  }

  async addAllergy(id: string, allergy: Allergy): Promise<HealthRecord> {
    const response = await apiClient.post<HealthRecord>(`${this.baseUrl}/${id}/allergies`, allergy);
    return response.data;
  }

  async addMedicalCondition(id: string, condition: MedicalCondition): Promise<HealthRecord> {
    const response = await apiClient.post<HealthRecord>(`${this.baseUrl}/${id}/medical-conditions`, condition);
    return response.data;
  }

  async getVaccinationAlerts(): Promise<HealthRecord[]> {
    const response = await apiClient.get<HealthRecord[]>(`${this.baseUrl}/vaccination-alerts`);
    return response.data;
  }

  async getMedicalAlerts(): Promise<HealthRecord[]> {
    const response = await apiClient.get<HealthRecord[]>(`${this.baseUrl}/medical-alerts`);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const healthRecordsService = new HealthRecordsService();
