// ====================================
// File: src/api/clients/orgApi.ts
// Organization API Client
// ====================================

import authApi from "../../services/authApi";

const API_BASE = "/api/v1";

export interface Location {
  id: string;
  code: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  geofenceRadiusMeters: number;
  targetEmployeeCount: number;
  activeEmployeeCount: number;
}

export interface Department {
  _id: string;
  companyId: string;
  code: string;
  name: string;
}

export interface Team {
  _id: string;
  companyId: string;
  departmentId: string;
  name: string;
  leadId?: string;
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

export const getLocations = async (filters?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Location>> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/locations?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch locations");
  }
  return data;
};

export const getDepartments = async (filters?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Department>> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/departments?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch departments");
  }
  return data;
};

export const getTeams = async (filters?: {
  search?: string;
  department?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Team>> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.department) params.append("department", filters.department);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/teams?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch teams");
  }
  return data;
};
