import type { ReactNode } from "react";

export type ChartVariant =
  | "line"
  | "bar"
  | "area"
  | "pie"
  | "radar"
  | "composed";

export type TrendDirection = "up" | "down" | "neutral";

export type EmployeeStatus =
  | "Active"
  | "Inactive"
  | "On Leave"
  | "Notice Period";

export type RiskLevel = "Low" | "Medium" | "High";

export type Department =
  | "Engineering"
  | "QA"
  | "Human Resources"
  | "Finance"
  | "Sales"
  | "Operations"
  | "Marketing";

export type EmployeeRole =
  | "Developer"
  | "Senior Developer"
  | "Lead"
  | "Manager"
  | "HR"
  | "QA Engineer"
  | "Intern";

export type Location =
  | "Hyderabad"
  | "Bengaluru"
  | "Chennai"
  | "Pune"
  | "Remote";

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department: Department;
  role: EmployeeRole;
  location: Location;
  status: EmployeeStatus;
  riskLevel: RiskLevel;
  joiningDate: string;
  experience: number;
  age: number;
  salary: number;
  performanceScore: number;
  trainingCompleted: boolean;
  skills: string[];
}

export interface BaseChartDatum {
  name: string;
  value: number;
}

export interface TrendChartDatum {
  month: string;
  employees: number;
  activeEmployees: number;
  newHires: number;
  attrition: number;
}

export interface DistributionChartDatum {
  category: string;
  count: number;
  percentage: number;
}

export interface ChartSeries {
  id: string;
  label: string;
  dataKey: string;
  color: string;
}

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  height?: number;
  children: ReactNode;
}

export interface ChartFilter {
  department?: Department[];
  location?: Location[];
  role?: EmployeeRole[];
  status?: EmployeeStatus[];
  riskLevel?: RiskLevel[];
  fromDate?: Date;
  toDate?: Date;
}

export interface ChartLegendItem {
  label: string;
  color: string;
}

export interface ChartMetric {
  label: string;
  value: number;
  trend?: TrendDirection;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface LineChartDataPoint {
  label: string;
  value: number;
}

export interface AnalyticsChartState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export interface ChartConfiguration {
  title: string;
  description?: string;
  variant: ChartVariant;
  responsive?: boolean;
  legend?: boolean;
  tooltip?: boolean;
}