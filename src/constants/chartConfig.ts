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
      light: ["var(--primary)", "var(--success)", "var(--warning)", "var(--error)"],
      dark: ["#60a5fa", "#34d399", "var(--warning)", "#fb7185"],
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
      light: ["var(--info)", "var(--success)", "var(--warning)", "var(--secondary)", "var(--error)", "#06b6d4", "var(--secondary)", "#84cc16"],
      dark: ["#60a5fa", "#34d399", "var(--warning)", "#a78bfa", "#f87171", "#22d3ee", "#f472b6", "#bef264"],
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
      light: ["var(--info)", "var(--success)", "var(--warning)", "var(--secondary)", "var(--error)", "#06b6d4", "var(--secondary)"],
      dark: ["#60a5fa", "#34d399", "var(--warning)", "#a78bfa", "#f87171", "#22d3ee", "#f472b6"],
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
      light: ["var(--info)", "var(--success)", "var(--warning)", "var(--secondary)", "var(--error)", "#06b6d4", "var(--secondary)", "#84cc16"],
      dark: ["#60a5fa", "#34d399", "var(--warning)", "#a78bfa", "#f87171", "#22d3ee", "#f472b6", "#bef264"],
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
      light: ["var(--success)", "#f9a825", "var(--error)", "var(--primary)"],
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
      light: ["var(--success)", "var(--warning)", "var(--error)", "#8b0000"],
      dark: ["#34d399", "var(--warning)", "#fb7185", "#f43f5e"],
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
