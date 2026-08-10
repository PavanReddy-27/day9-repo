// src/types/chart.ts

export interface TrendChartData {
  month: string;
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  attrition: number;
}

export interface DepartmentChartData {
  id: string;
  name: string;
  value: number;
  activeEmployees: number;
  inactiveEmployees: number;
  averageSalary: number;
  averageExperience: number;
  performanceScore: number;
  trainingCompletion: number;
  color?: string;
}

export interface LocationChartData {
  id: string;
  location: string;
  employees: number;
  activeEmployees: number;
  averageSalary: number;
  performanceScore: number;
  color?: string;
}

export interface RoleChartData {
  id: string;
  role: string;
  employees: number;
  averageSalary: number;
  averageExperience: number;
  color?: string;
}

export interface StatusChartData {
  id: string;
  status: string;
  employees: number;
  percentage: number;
  color?: string;
}

export interface RiskChartData {
  id: string;
  risk: string;
  employees: number;
  percentage: number;
  color?: string;
}

export interface SalaryChartData {
  range: string;
  employees: number;
}

export interface ExperienceChartData {
  range: string;
  employees: number;
}

export interface KPITrendData {
  label: string;
  value: number;
}

export interface ChartLegendItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  height?: number | string;
  loading?: boolean;
  error?: string;
}