// src/utils/aggregation.ts
// PART 1 (Day 8 Update)

import type {
  Employee,
  EmployeeStatus,
  RiskLevel,
} from "../types/employee";

/* ==========================================================
   Generic Helpers
========================================================== */

export const sum = (
  values: number[]
): number =>
  values.reduce(
    (total, value) => total + value,
    0
  );

export const average = (
  values: number[]
): number =>
  values.length === 0
    ? 0
    : Number(
        (
          sum(values) / values.length
        ).toFixed(2)
      );

export const percentage = (
  value: number,
  total: number
): number =>
  total === 0
    ? 0
    : Number(
        (
          (value / total) *
          100
        ).toFixed(2)
      );

export const growthRate = (
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
    ).toFixed(2)
  );
};

/* ==========================================================
   Basic Counts
========================================================== */

export const getTotalEmployees = (
  employees: Employee[]
): number => employees.length;

export const getActiveEmployees = (
  employees: Employee[]
): number =>
  employees.filter(
    (employee) =>
      employee.status === "Active"
  ).length;

export const getInactiveEmployees = (
  employees: Employee[]
): number =>
  employees.filter(
    (employee) =>
      employee.status !== "Active"
  ).length;

export const getHighRiskEmployees = (
  employees: Employee[]
): number =>
  employees.filter(
    (employee) =>
      employee.risk === "High" ||
      employee.risk === "Critical"
  ).length;

/* ==========================================================
   Count Helpers
========================================================== */

export const countByDepartment = (
  employees: Employee[],
  department: string
): number =>
  employees.filter(
    (employee) =>
      employee.department ===
      department
  ).length;

export const countByRole = (
  employees: Employee[],
  role: string
): number =>
  employees.filter(
    (employee) =>
      employee.role === role
  ).length;

export const countByLocation = (
  employees: Employee[],
  location: string
): number =>
  employees.filter(
    (employee) =>
      employee.location ===
      location
  ).length;

export const countByStatus = (
  employees: Employee[],
  status: EmployeeStatus
): number =>
  employees.filter(
    (employee) =>
      employee.status === status
  ).length;

export const countByRisk = (
  employees: Employee[],
  risk: RiskLevel
): number =>
  employees.filter(
    (employee) =>
      employee.risk === risk
  ).length;

/* ==========================================================
   Salary
========================================================== */

export const getTotalSalary = (
  employees: Employee[]
): number =>
  sum(
    employees.map(
      (employee) => employee.salary
    )
  );

export const getAverageSalary = (
  employees: Employee[]
): number =>
  Math.round(
    average(
      employees.map(
        (employee) =>
          employee.salary
      )
    )
  );
  /* ==========================================================
   Experience
========================================================== */

export const getAverageExperience = (
  employees: Employee[]
): number =>
  average(
    employees.map(
      (employee) =>
        employee.experience
    )
  );

/* ==========================================================
   Performance
========================================================== */

export const getAveragePerformance = (
  employees: Employee[]
): number =>
  average(
    employees.map(
      (employee) =>
        employee.performanceScore
    )
  );

export const getAverageEngagement = (
  employees: Employee[]
): number =>
  average(
    employees.map(
      (employee) =>
        employee.engagementScore
    )
  );

export const getAverageAttendance = (
  employees: Employee[]
): number =>
  average(
    employees.map(
      (employee) =>
        employee.attendancePercentage
    )
  );

export const getTrainingCompletion = (
  employees: Employee[]
): number =>
  average(
    employees.map(
      (employee) =>
        employee.trainingCompletion
    )
  );

export const getSkillCoverage = (
  employees: Employee[]
): number =>
  average(
    employees.map(
      (employee) =>
        employee.skillCoverage
    )
  );

/* ==========================================================
   Rates
========================================================== */

export const getAttritionRate = (
  employees: Employee[]
): number =>
  percentage(
    getInactiveEmployees(
      employees
    ),
    employees.length
  );

export const getHiringRate = (
  employees: Employee[]
): number => {
  const currentYear =
    new Date().getFullYear();

  const hires =
    employees.filter(
      (employee) =>
        new Date(
          employee.joiningDate
        ).getFullYear() ===
        currentYear
    ).length;

  return percentage(
    hires,
    employees.length
  );
};

export const getPromotionRate = (
  employees: Employee[]
): number => {
  const promoted =
    employees.filter(
      (employee) =>
        employee.promotionCount > 0
    ).length;

  return percentage(
    promoted,
    employees.length
  );
};

/* ==========================================================
   Dashboard Counts
========================================================== */

export const getDepartmentCount = (
  employees: Employee[]
): number =>
  new Set(
    employees.map(
      (employee) =>
        employee.department
    )
  ).size;

export const getLocationCount = (
  employees: Employee[]
): number =>
  new Set(
    employees.map(
      (employee) =>
        employee.location
    )
  ).size;

export const getRoleCount = (
  employees: Employee[]
): number =>
  new Set(
    employees.map(
      (employee) =>
        employee.role
    )
  ).size;

export const getManagerCount = (
  employees: Employee[]
): number =>
  new Set(
    employees.map(
      (employee) =>
        employee.manager
    )
  ).size;
  /* ==========================================================
   Dashboard Summary
========================================================== */

export interface DashboardSummary {
  totalEmployees: number;

  activeEmployees: number;

  inactiveEmployees: number;

  highRiskEmployees: number;

  departmentCount: number;

  locationCount: number;

  roleCount: number;

  managerCount: number;

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

export const getDashboardSummary = (
  employees: Employee[]
): DashboardSummary => ({
  totalEmployees:
    getTotalEmployees(employees),

  activeEmployees:
    getActiveEmployees(employees),

  inactiveEmployees:
    getInactiveEmployees(employees),

  highRiskEmployees:
    getHighRiskEmployees(employees),

  departmentCount:
    getDepartmentCount(employees),

  locationCount:
    getLocationCount(employees),

  roleCount:
    getRoleCount(employees),

  managerCount:
    getManagerCount(employees),

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

/* ==========================================================
   Filter Summary
========================================================== */

export interface FilterSummary {
  totalEmployees: number;

  filteredEmployees: number;

  hiddenEmployees: number;

  visiblePercentage: number;
}

export const getFilterSummary = (
  totalEmployees: Employee[],
  filteredEmployees: Employee[]
): FilterSummary => ({
  totalEmployees:
    totalEmployees.length,

  filteredEmployees:
    filteredEmployees.length,

  hiddenEmployees:
    totalEmployees.length -
    filteredEmployees.length,

  visiblePercentage:
    percentage(
      filteredEmployees.length,
      totalEmployees.length
    ),
});

/* ==========================================================
   Comparison Helper
========================================================== */

export const compareMetric = (
  current: number,
  previous: number
) => ({
  current,

  previous,

  difference:
    current - previous,

  growth: growthRate(
    current,
    previous
  ),
});

/* ==========================================================
   Export Helpers
========================================================== */

export const getExportMetadata = () => ({
  exportedAt:
    new Date().toISOString(),

  exportedBy:
    "Workforce Analytics Dashboard",

  version: "2.0.0",
});