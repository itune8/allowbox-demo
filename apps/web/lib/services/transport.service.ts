import { apiClient } from '../api-client';

export enum VehicleType {
  BUS = 'BUS',
  VAN = 'VAN',
  CAR = 'CAR',
  OTHER = 'OTHER',
}

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}

export enum RouteStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Vehicle {
  _id: string;
  tenantId?: string;
  vehicleNumber: string;
  type: VehicleType;
  make?: string;
  model?: string;
  vehicleModel?: string;
  year?: number;
  capacity: number;
  driverId?: { _id: string; firstName: string; lastName: string; phone?: string };
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;
  assistantName?: string;
  assistantPhone?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  gpsDeviceId?: string;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RouteStop {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  pickupTime?: string;
  dropTime?: string;
  order?: number;
}

export interface TransportRoute {
  _id: string;
  tenantId?: string;
  name: string;
  description?: string;
  vehicleId?: Vehicle;
  stops: RouteStop[];
  startTime?: string;
  endTime?: string;
  distance?: number;
  estimatedDuration?: number;
  monthlyFee?: number;
  status: RouteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudentTransport {
  _id: string;
  tenantId?: string;
  studentId: { _id: string; firstName: string; lastName: string; studentId?: string };
  routeId: TransportRoute;
  pickupStop: string;
  dropStop: string;
  startDate?: string;
  endDate?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportStatistics {
  totalVehicles: number;
  activeVehicles: number;
  totalRoutes: number;
  activeRoutes: number;
  totalStudentsAssigned: number;
}

class TransportService {
  private baseUrl = '/transport';

  // Vehicles
  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await apiClient.post<Vehicle>(`${this.baseUrl}/vehicles`, data);
    return response.data;
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    const response = await apiClient.get<Vehicle[]>(`${this.baseUrl}/vehicles`);
    return response.data;
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const response = await apiClient.get<Vehicle>(`${this.baseUrl}/vehicles/${id}`);
    return response.data;
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await apiClient.put<Vehicle>(`${this.baseUrl}/vehicles/${id}`, data);
    return response.data;
  }

  async deleteVehicle(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/vehicles/${id}`);
  }

  // Routes
  async createRoute(data: Partial<TransportRoute>): Promise<TransportRoute> {
    const response = await apiClient.post<TransportRoute>(`${this.baseUrl}/routes`, data);
    return response.data;
  }

  async getAllRoutes(): Promise<TransportRoute[]> {
    const response = await apiClient.get<TransportRoute[]>(`${this.baseUrl}/routes`);
    return response.data;
  }

  async getRouteById(id: string): Promise<TransportRoute> {
    const response = await apiClient.get<TransportRoute>(`${this.baseUrl}/routes/${id}`);
    return response.data;
  }

  async updateRoute(id: string, data: Partial<TransportRoute>): Promise<TransportRoute> {
    const response = await apiClient.put<TransportRoute>(`${this.baseUrl}/routes/${id}`, data);
    return response.data;
  }

  async deleteRoute(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/routes/${id}`);
  }

  async getStudentsByRoute(routeId: string): Promise<StudentTransport[]> {
    const response = await apiClient.get<StudentTransport[]>(`${this.baseUrl}/routes/${routeId}/students`);
    return response.data;
  }

  // Student Assignments
  async assignStudent(data: Partial<StudentTransport>): Promise<StudentTransport> {
    const response = await apiClient.post<StudentTransport>(`${this.baseUrl}/assignments`, data);
    return response.data;
  }

  async getStudentTransport(studentId: string): Promise<StudentTransport> {
    const response = await apiClient.get<StudentTransport>(`${this.baseUrl}/assignments/student/${studentId}`);
    return response.data;
  }

  async updateAssignment(id: string, data: Partial<StudentTransport>): Promise<StudentTransport> {
    const response = await apiClient.put<StudentTransport>(`${this.baseUrl}/assignments/${id}`, data);
    return response.data;
  }

  async removeAssignment(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/assignments/${id}`);
  }

  // Statistics
  async getStatistics(): Promise<TransportStatistics> {
    const response = await apiClient.get<TransportStatistics>(`${this.baseUrl}/statistics`);
    return response.data;
  }
}

export const transportService = new TransportService();
