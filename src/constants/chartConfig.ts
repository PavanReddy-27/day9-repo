export interface ChartVisualConfig {
  title: string;
  subtitle: string;
  emptyMessage: string;
  errorMessage: string;
  retryLabel: string;
  height: number;
  colors: {
    light: string[];
    dark: string[];
  };
}

export const chartConfig = {
  workforceTrend: {
    title: "Workforce Trend",
    subtitle: "Employee growth, hiring and attrition",
    emptyMessage: "No workforce trend data is available for the selected filters.",
    errorMessage: "Unable to load workforce trend data.",
    retryLabel: "Retry",
    height: 420,
    colors: {
      light: ["#1976d2", "#2e7d32", "#fb8c00", "#d32f2f"],
      dark: ["#60a5fa", "#34d399", "#f59e0b", "#fb7185"],
    },
  },
  departmentDistribution: {
    title: "Department Distribution",
    subtitle: "Employee distribution by department",
    emptyMessage: "No department data is available for the selected filters.",
    errorMessage: "Unable to load department distribution data.",
    retryLabel: "Retry",
    height: 420,
    colors: {
      light: ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"],
      dark: ["#60a5fa", "#34d399", "#f59e0b", "#a78bfa", "#f87171", "#22d3ee", "#f472b6", "#bef264"],
    },
  },
  locationDistribution: {
    title: "Location Distribution",
    subtitle: "Employees across office locations",
    emptyMessage: "No location data is available for the selected filters.",
    errorMessage: "Unable to load location distribution data.",
    retryLabel: "Retry",
    height: 420,
    colors: {
      light: ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"],
      dark: ["#60a5fa", "#34d399", "#f59e0b", "#a78bfa", "#f87171", "#22d3ee", "#f472b6"],
    },
  },
  roleDistribution: {
    title: "Role Distribution",
    subtitle: "Employees grouped by job role",
    emptyMessage: "No role distribution data is available for the selected filters.",
    errorMessage: "Unable to load role distribution data.",
    retryLabel: "Retry",
    height: 420,
    colors: {
      light: ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"],
      dark: ["#60a5fa", "#34d399", "#f59e0b", "#a78bfa", "#f87171", "#22d3ee", "#f472b6", "#bef264"],
    },
  },
  statusDistribution: {
    title: "Employee Status",
    subtitle: "Current workforce distribution",
    emptyMessage: "No status distribution data is available for the selected filters.",
    errorMessage: "Unable to load employee status data.",
    retryLabel: "Retry",
    height: 420,
    colors: {
      light: ["#2e7d32", "#f9a825", "#d32f2f", "#1976d2"],
      dark: ["#34d399", "#fbbf24", "#fb7185", "#60a5fa"],
    },
  },
  riskDistribution: {
    title: "Risk Distribution",
    subtitle: "Employees grouped by risk level",
    emptyMessage: "No risk distribution data is available for the selected filters.",
    errorMessage: "Unable to load risk distribution data.",
    retryLabel: "Retry",
    height: 420,
    colors: {
      light: ["#2e7d32", "#fb8c00", "#d32f2f", "#8b0000"],
      dark: ["#34d399", "#f59e0b", "#fb7185", "#f43f5e"],
    },
  },
} satisfies Record<string, ChartVisualConfig>;

export const getChartPalette = (
  chartKey: keyof typeof chartConfig,
  mode: "light" | "dark" = "light"
): string[] => {
  const palette = chartConfig[chartKey].colors[mode];

  return palette ?? chartConfig[chartKey].colors.light;
};
