// src/types/kpi.ts

import type { ReactNode } from "react";

export type KPIType =
  | "totalEmployees"
  | "activeEmployees"
  | "inactiveEmployees"
  | "newHires"
  | "attritionRate"
  | "hiringRate"
  | "averageSalary"
  | "averageExperience"
  | "trainingCompletion"
  | "skillCoverage"
  | "engagementScore"
  | "attendanceRate"
  | "performanceScore"
  | "highRiskEmployees"
  | "promotionRate"
  | "departments";

export interface KPIItem {
  id: KPIType;
  title: string;
  value: number | string;
  trend: number;
  trendLabel?: string;
  target?: number;
  unit?: string;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
}

export interface KPIStatistics {
  title: string;
  value: number | string;
  trend: number;
  previousValue?: number | string;
  percentage?: number;
  color?: string;
}

export interface KPICardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  trend: number;
  trendLabel?: string;
  subtitle?: string;
  loading?: boolean;
  onClick?: () => void;
}

export interface KPIGroup {
  title: string;
  items: KPIItem[];
}

export interface KPISummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  newHires: number;
  attritionRate: number;
  hiringRate: number;
  averageSalary: number;
  averageExperience: number;
  trainingCompletion: number;
  skillCoverage: number;
  engagementScore: number;
  attendanceRate: number;
  performanceScore: number;
  highRiskEmployees: number;
  promotionRate: number;
  departments: number;
}