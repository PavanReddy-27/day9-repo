// src/utils/dashboardMetrics.ts

import type { Employee } from "../types/employee";

import {
  getTotalEmployees,
  getActiveEmployees,
  getInactiveEmployees,
  getAverageSalary,
  getAverageExperience,
  getAveragePerformance,
  getAverageEngagement,
  getAverageAttendance,
  getTrainingCompletion,
  getSkillCoverage,
  getAttritionRate,
  getHiringRate,
  getPromotionRate,
  getHighRiskEmployees,
} from "./aggregation";

export interface DashboardMetrics {
  totalEmployees: number;

  activeEmployees: number;

  inactiveEmployees: number;

  highRiskEmployees: number;

  averageSalary: number;

  averageExperience: number;

  averagePerformance: number;

  averageEngagement: number;

  averageAttendance: number;

  trainingCompletion: number;

  skillCoverage: number;

  attritionRate: number;

  hiringRate: number;

  promotionRate: number;
}

export interface DashboardHealth {
  score: number;

  level:
    | "Excellent"
    | "Good"
    | "Average"
    | "Poor";

  color: string;
}

export interface DashboardSummary {
  metrics: DashboardMetrics;

  health: DashboardHealth;

  generatedAt: string;

  employeeCount: number;
}

const calculateHealth = (
  metrics: DashboardMetrics
): DashboardHealth => {
  const score = Number(
    (
      metrics.averagePerformance * 0.3 +
      metrics.averageEngagement * 0.2 +
      metrics.averageAttendance * 0.2 +
      metrics.trainingCompletion * 0.15 +
      metrics.skillCoverage * 0.15
    ).toFixed(1)
  );

  if (score >= 90) {
    return {
      score,
      level: "Excellent",
      color: "#16a34a",
    };
  }

  if (score >= 75) {
    return {
      score,
      level: "Good",
      color: "#2563eb",
    };
  }

  if (score >= 60) {
    return {
      score,
      level: "Average",
      color: "#f59e0b",
    };
  }

  return {
    score,
    level: "Poor",
    color: "#dc2626",
  };
};

export const getDashboardMetrics = (
  employees: Employee[]
): DashboardMetrics => ({
  totalEmployees:
    getTotalEmployees(employees),

  activeEmployees:
    getActiveEmployees(employees),

  inactiveEmployees:
    getInactiveEmployees(employees),

  highRiskEmployees:
    getHighRiskEmployees(employees),

  averageSalary:
    getAverageSalary(employees),

  averageExperience:
    getAverageExperience(employees),

  averagePerformance:
    getAveragePerformance(employees),

  averageEngagement:
    getAverageEngagement(employees),

  averageAttendance:
    getAverageAttendance(employees),

  trainingCompletion:
    getTrainingCompletion(employees),

  skillCoverage:
    getSkillCoverage(employees),

  attritionRate:
    getAttritionRate(employees),

  hiringRate:
    getHiringRate(employees),

  promotionRate:
    getPromotionRate(employees),
});

export const getDashboardSummary = (
  employees: Employee[]
): DashboardSummary => {
  const metrics =
    getDashboardMetrics(employees);

  return {
    metrics,

    health:
      calculateHealth(metrics),

    generatedAt:
      new Date().toISOString(),

    employeeCount:
      employees.length,
  };
};

export const getMetricDifference = (
  current: number,
  previous: number
): number => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Number(
    (
      ((current - previous) /
        previous) *
      100
    ).toFixed(1)
  );
};

export const compareDashboardMetrics = (
  currentEmployees: Employee[],
  previousEmployees: Employee[]
) => {
  const current =
    getDashboardMetrics(
      currentEmployees
    );

  const previous =
    getDashboardMetrics(
      previousEmployees
    );

  return {
    current,

    previous,

    growth: {
      totalEmployees:
        getMetricDifference(
          current.totalEmployees,
          previous.totalEmployees
        ),

      activeEmployees:
        getMetricDifference(
          current.activeEmployees,
          previous.activeEmployees
        ),

      averageSalary:
        getMetricDifference(
          current.averageSalary,
          previous.averageSalary
        ),

      performance:
        getMetricDifference(
          current.averagePerformance,
          previous.averagePerformance
        ),

      engagement:
        getMetricDifference(
          current.averageEngagement,
          previous.averageEngagement
        ),

      attrition:
        getMetricDifference(
          current.attritionRate,
          previous.attritionRate
        ),
    },
  };
};

export default getDashboardSummary;