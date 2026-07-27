// src/features/charts/utils/chartFormatter.ts

export const formatNumber = (
  value: number
): string =>
  new Intl.NumberFormat("en-US").format(value);

export const formatCurrency = (
  value: number
): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const formatPercentage = (
  value: number,
  decimals = 1
): string =>
  `${value.toFixed(decimals)}%`;

export const formatAxisLabel = (
  value: number | string
): string =>
  typeof value === "number"
    ? formatNumber(value)
    : value;

export const formatTooltipValue = (
  value: number | string
): string =>
  typeof value === "number"
    ? formatNumber(value)
    : String(value);

export const formatTrend = (
  value: number
): string =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

export const formatCompactNumber = (
  value: number
): string =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export const formatMonth = (
  value: string
): string =>
  value.substring(0, 3);

export const formatDate = (
  date: string
): string =>
  new Date(date).toLocaleDateString("en-US");