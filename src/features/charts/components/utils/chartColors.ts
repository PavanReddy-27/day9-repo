// src/features/charts/utils/chartColors.ts

export const CHART_COLORS = {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--error)",
  info: "var(--info)",

  blue: "var(--primary)",
  indigo: "var(--primary-dark)",
  purple: "var(--secondary)",
  cyan: "var(--info)",
  emerald: "var(--success)",
  amber: "var(--warning)",
  orange: "var(--warning)",
  red: "var(--error)",
  pink: "var(--secondary)",
  slate: "var(--text-light)",

  background: "var(--surface)",
  surface: "var(--surface)",
  border: "var(--border)",
  grid: "var(--border)",
  text: "var(--text)",
};

export const PIE_COLORS = [
  "var(--primary)",
  "var(--success)",
  "var(--secondary)",
  "var(--warning)",
  "var(--info)",
  "var(--error)",
  "var(--primary-light)",
  "var(--secondary-bg)",
];

export const STATUS_COLORS = {
  Active: "var(--success)",
  Inactive: "var(--text-light)",
  Resigned: "var(--error)",
  OnLeave: "var(--warning)",
};

export const RISK_COLORS = {
  Low: "var(--success)",
  Medium: "var(--warning)",
  High: "var(--error)",
  Critical: "var(--error)",
};

export default CHART_COLORS;