import { apiClient } from "../apiClient";

export interface SystemHealthData {
  health: {
    database: string;
    api: string;
  };
  avgResponseTime?: number;
  connectedClients?: number;
  backgroundJobStatus?: string;
  activeSessions: number;
  errorCounts: Record<string, number>;
  recentErrors: Array<{
    _id: string;
    timestamp: string;
    level: string;
    category: string;
    message: string;
    userId?: { email: string; firstName: string; lastName: string };
  }>;
}

export const monitoringApi = {
  getSystemHealth: async (): Promise<SystemHealthData> => {
    return apiClient<SystemHealthData>("/admin/monitoring/health-metrics", {
      method: "GET"
    });
  }
};
