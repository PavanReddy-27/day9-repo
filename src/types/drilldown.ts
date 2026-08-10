// src/types/drilldown.ts

import type { KPIType } from "./kpi";

export interface DrillDownItem {
  id: string;
  label: string;
  value: number | string;
  percentage?: number;
  color?: string;
}

export interface DrillDownStatistics {
  id: string;
  title: string;
  value: number | string;
  trend: number;
  color?: string;
}

export interface DrillDownChartData {
  label: string;
  value: number;
}

import type { Employee } from "./employee";

export interface DrillDownData {
  kpi: KPIType;

  title: string;

  total: number | string;

  growth: string;

  description: string;

  items: DrillDownItem[];

  statistics: DrillDownStatistics[];

  chartData?: DrillDownChartData[];

  employees?: Employee[];
}

export interface DrillDownState {
  open: boolean;
  loading: boolean;
  selectedKPI: KPIType | null;
}

export interface KPIDrillDownProps {
  open: boolean;
  onClose: () => void;
  data: DrillDownData | null;
}