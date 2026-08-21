import { apiClient } from "./apiClient";

export interface WorkforceAnalyticsResponse {
  totalEmployees: number;
  activeEmployees: number;
  statusDistribution: { name: string; value: number }[];
  riskDistribution: { name: string; value: number }[];
  workModeDistribution: { name: string; value: number }[];
}

export interface HiringAnalyticsResponse {
  month: string;
  hires: number;
}

export interface AttendanceAnalyticsResponse {
  summary: {
    _id: string;
    count: number;
    avgWorkMinutes: number;
    avgLateMinutes: number;
    totalOvertimeMinutes: number;
  }[];
  trends: {
    date: string;
    present: number;
    late: number;
    total: number;
    attendanceRate: number;
  }[];
}

export interface DepartmentAnalyticsResponse {
  departments: { name: string; count: number }[];
  locations: { code: string; count: number }[];
}

export interface SkillsAnalyticsResponse {
  skills: { name: string; category: string; count: number; experts: number }[];
  coveragePercentage: number;
}

export interface PerformanceAnalyticsResponse {
  month: string;
  avgRating: number;
  avgKpiScore: number;
  completedGoals: number;
}

export interface ProductivityAnalyticsResponse {
  avgProductivityScore: number;
  avgFocusScore: number;
  avgActiveHours: number;
  totalTasksCompleted: number;
}

export const getWorkforceAnalytics = async (): Promise<WorkforceAnalyticsResponse> => {
  return await apiClient("/analytics/workforce", { method: "GET" });
};

export const getHiringAnalytics = async (): Promise<HiringAnalyticsResponse[]> => {
  return await apiClient("/analytics/hiring", { method: "GET" });
};

export const getAttendanceAnalytics = async (): Promise<AttendanceAnalyticsResponse> => {
  return await apiClient("/analytics/attendance", { method: "GET" });
};

export const getDepartmentAnalytics = async (): Promise<DepartmentAnalyticsResponse> => {
  return await apiClient("/analytics/departments", { method: "GET" });
};

export const getSkillsAnalytics = async (): Promise<SkillsAnalyticsResponse> => {
  return await apiClient("/analytics/skills", { method: "GET" });
};

export const getPerformanceAnalytics = async (): Promise<PerformanceAnalyticsResponse[]> => {
  return await apiClient("/analytics/performance", { method: "GET" });
};

export const getProductivityAnalytics = async (): Promise<ProductivityAnalyticsResponse> => {
  return await apiClient("/analytics/productivity", { method: "GET" });
};

export const subscribeToAnalytics = (onUpdate: (data: any) => void) => {
  const token = localStorage.getItem("accessToken");
  let abortController = new AbortController();
  let reconnectTimeout: ReturnType<typeof setTimeout>;

  const connect = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/analytics/stream`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: abortController.signal,
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              onUpdate(data);
            } catch (e) {
              console.error("Failed to parse SSE data", e);
            }
          }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("SSE error:", e);
        // Attempt to reconnect after 5 seconds to prevent infinite tight loops
        reconnectTimeout = setTimeout(connect, 5000);
      }
    }
  };

  connect();

  return () => {
    abortController.abort();
    clearTimeout(reconnectTimeout);
  };
};
