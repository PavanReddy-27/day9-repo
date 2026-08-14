// ====================================
// File: src/api/clients/analyticsApi.ts
// Analytics API Client
// ====================================

import authApi from "../../services/authApi";

const API_BASE = "/api/v1";

export interface WorkforceAnalytics {
  totalEmployees: number;
  statusDistribution: { name: string; value: number }[];
  riskDistribution: { name: string; value: number }[];
  workModeDistribution: { name: string; value: number }[];
}

export interface HiringTrend {
  month: string;
  hires: number;
}

export interface AttendanceAnalytics {
  summary: { _id: string; count: number; avgWorkMinutes: number; totalOvertimeMinutes: number }[];
  trends: {
    date: string;
    present: number;
    late: number;
    total: number;
    attendanceRate: number;
  }[];
}

export interface DepartmentAnalytics {
  departments: { name: string; count: number }[];
  locations: { code: string; count: number }[];
}

export interface SkillAnalytics {
  skills: {
    name: string;
    category: string;
    count: number;
    experts: number;
  }[];
  coveragePercentage: number;
}

export interface PerformanceAnalytics {
  month: string;
  avgRating: number;
  avgKpiScore: number;
  completedGoals: number;
}

export interface ProductivityAnalytics {
  avgProductivityScore: number;
  avgFocusScore: number;
  avgActiveHours: number;
  totalTasksCompleted: number;
}

export const getWorkforceAnalytics = async (filters?: {
  location?: string;
  department?: string;
  role?: string;
  status?: string;
  riskLevel?: string;
}): Promise<WorkforceAnalytics> => {
  const params = new URLSearchParams();
  if (filters?.location) params.append("location", filters.location);
  if (filters?.department) params.append("department", filters.department);
  if (filters?.role) params.append("role", filters.role);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.riskLevel) params.append("riskLevel", filters.riskLevel);

  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/analytics/workforce?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch workforce analytics");
  }
  return data.data;
};

export const getHiringAnalytics = async (filters?: {
  location?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}): Promise<HiringTrend[]> => {
  const params = new URLSearchParams();
  if (filters?.location) params.append("location", filters.location);
  if (filters?.department) params.append("department", filters.department);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/analytics/hiring?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch hiring analytics");
  }
  return data.data;
};

export const getAttendanceAnalytics = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<AttendanceAnalytics> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/analytics/attendance?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch attendance analytics");
  }
  return data.data;
};

export const getDepartmentAnalytics = async (filters?: {
  location?: string;
  department?: string;
  role?: string;
}): Promise<DepartmentAnalytics> => {
  const params = new URLSearchParams();
  if (filters?.location) params.append("location", filters.location);
  if (filters?.department) params.append("department", filters.department);
  if (filters?.role) params.append("role", filters.role);

  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/analytics/departments?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch department analytics");
  }
  return data.data;
};

export const getSkillAnalytics = async (): Promise<SkillAnalytics> => {
  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/analytics/skills`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch skill analytics");
  }
  return data.data;
};

export const getPerformanceAnalytics = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<PerformanceAnalytics[]> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/analytics/performance?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch performance analytics");
  }
  return data.data;
};

export const getProductivityAnalytics = async (filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<ProductivityAnalytics> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const token = authApi.getAccessToken();
  const res = await fetch(`${API_BASE}/analytics/productivity?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch productivity analytics");
  }
  return data.data;
};
