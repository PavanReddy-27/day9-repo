// ====================================
// File: src/api/clients/employeeApi.ts
// Employee API Client
// ====================================

import authApi from "../../services/authApi";

const API_BASE = "/api/v1";

export interface Employee {
  _id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  locationId: string;
  locationCode: string;
  departmentId: string;
  departmentName: string;
  teamId?: string;
  managerId?: string;
  designation: string;
  role: string;
  workMode: string;
  employmentStatus: string;
  riskLevel: string;
  avatar: string;
  joiningDate: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getEmployees = async (filters?: {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  department?: string;
  team?: string;
  role?: string;
  status?: string;
  riskLevel?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PaginatedResponse<Employee>> => {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.search) params.append("search", filters.search);
  if (filters?.location) params.append("location", filters.location);
  if (filters?.department) params.append("department", filters.department);
  if (filters?.team) params.append("team", filters.team);
  if (filters?.role) params.append("role", filters.role);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.riskLevel) params.append("riskLevel", filters.riskLevel);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/employees?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch employees");
  }
  return data;
};

export const getEmployeeById = async (id: string): Promise<Employee> => {
  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/employees/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch employee");
  }
  return data.data;
};
