// ====================================
// File: src/services/organizationApi.ts
// ====================================

import { apiClient } from "./apiClient";

export interface Department {
  _id: string;
  name: string;
  code?: string;
  locationId?: any;
  companyId?: string;
  isActive?: boolean;
}

export interface Location {
  _id: string;
  name: string;
  code?: string;
  city?: string;
  country?: string;
  companyId?: string;
  isActive?: boolean;
}

export interface Team {
  _id: string;
  name: string;
  departmentId?: any;
  companyId?: string;
  isActive?: boolean;
}

class OrganizationApi {
  async getLocations(): Promise<Location[]> {
    const data = await apiClient<Location[]>("/locations");
    return Array.isArray(data) ? data : [];
  }

  async getDepartments(locationId?: string): Promise<Department[]> {
    const qs = locationId ? `?locationId=${encodeURIComponent(locationId)}` : "";
    const data = await apiClient<Department[]>(`/departments${qs}`);
    return Array.isArray(data) ? data : [];
  }

  async getTeams(departmentId?: string): Promise<Team[]> {
    const qs = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : "";
    const data = await apiClient<Team[]>(`/teams${qs}`);
    return Array.isArray(data) ? data : [];
  }
}

const organizationApi = new OrganizationApi();
export default organizationApi;
