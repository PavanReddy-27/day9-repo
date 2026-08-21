import { apiClient } from "./apiClient";

export const getWorkforceAnalytics = async () => {
  return await apiClient("/analytics/workforce", { method: "GET" });
};

export const getHiringAnalytics = async () => {
  return await apiClient("/analytics/hiring", { method: "GET" });
};

export const getAttendanceAnalytics = async () => {
  return await apiClient("/analytics/attendance", { method: "GET" });
};

export const getDepartmentAnalytics = async () => {
  return await apiClient("/analytics/departments", { method: "GET" });
};

export const getSkillsAnalytics = async () => {
  return await apiClient("/analytics/skills", { method: "GET" });
};

export const getPerformanceAnalytics = async () => {
  return await apiClient("/analytics/performance", { method: "GET" });
};

export const getProductivityAnalytics = async () => {
  return await apiClient("/analytics/productivity", { method: "GET" });
};

export const subscribeToAnalytics = (onUpdate: (data: any) => void) => {
  const token = localStorage.getItem("accessToken");
  let abortController = new AbortController();

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
      }
    }
  };

  connect();

  return () => {
    abortController.abort();
  };
};
