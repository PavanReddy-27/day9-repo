// src/features/kpi/services/kpiAggregation.ts
// PART 1 (Day 8 Update)

import type { Employee } from "../../../types/employee";
import type {
  DrillDownItem,
} from "../../../types/drilldown";

/* =====================================================
   Generic Group By
===================================================== */

const createGroup = <T extends object>(
  employees: T[],
  key: keyof T
): DrillDownItem[] => {
  const map = new Map<string, number>();

  employees.forEach((employee) => {
    const value = String(
      employee[key] ?? "Unknown"
    );

    map.set(
      value,
      (map.get(value) ?? 0) + 1
    );
  });

  return [...map.entries()]
    .map(([label, value]) => ({
      id: label,

      label,

      value,

      percentage:
        employees.length === 0
          ? 0
          : Number(
              (
                (value /
                  employees.length) *
                100
              ).toFixed(1)
            ),
    }))
    .sort(
      (a, b) =>
        Number(b.value) -
        Number(a.value)
    );
};

/* =====================================================
   Generic Statistics
===================================================== */

export const calculatePercentage = (
  value: number,
  total: number
): number =>
  total === 0
    ? 0
    : Number(
        (
          (value / total) *
          100
        ).toFixed(1)
      );

export const calculateAverage = (
  values: number[]
): number =>
  values.length === 0
    ? 0
    : Number(
        (
          values.reduce(
            (sum, value) =>
              sum + value,
            0
          ) / values.length
        ).toFixed(1)
      );

export const calculateTotal = (
  values: number[]
): number =>
  values.reduce(
    (sum, value) => sum + value,
    0
  );

export const calculateGrowth = (
  current: number,
  previous: number
): number => {
  if (previous === 0) {
    return current === 0
      ? 0
      : 100;
  }

  return Number(
    (
      ((current - previous) /
        previous) *
      100
    ).toFixed(1)
  );
};

/* =====================================================
   Group By
===================================================== */

export const groupByDepartment = (
  employees: Employee[]
) =>
  createGroup(
    employees,
    "department"
  );

export const groupByLocation = (
  employees: Employee[]
) =>
  createGroup(
    employees,
    "location"
  );

export const groupByRole = (
  employees: Employee[]
) =>
  createGroup(
    employees,
    "role"
  );

export const groupByStatus = (
  employees: Employee[]
) =>
  createGroup(
    employees,
    "status"
  );

export const groupByRisk = (
  employees: Employee[]
) =>
  createGroup(
    employees,
    "risk"
  );

export const groupByManager = (
  employees: Employee[]
) =>
  createGroup(
    employees,
    "manager"
  );
  /* =====================================================
   Experience & Salary Groups
===================================================== */

export const groupByExperience = (
  employees: Employee[]
) =>
  createGroup(
    employees.map((employee) => ({
      ...employee,
      experience:
        employee.experience < 2
          ? "0-2 Years"
          : employee.experience < 5
            ? "2-5 Years"
            : employee.experience < 8
              ? "5-8 Years"
              : "8+ Years",
    })),
    "experience"
  );

export const groupBySalaryRange = (
  employees: Employee[]
) =>
  createGroup(
    employees.map((employee) => ({
      ...employee,
      salary:
        employee.salary < 50000
          ? "<50K"
          : employee.salary < 80000
            ? "50K-80K"
            : employee.salary < 120000
              ? "80K-120K"
              : "120K+",
    })),
    "salary"
  );

/* =====================================================
   KPI Calculations
===================================================== */

export const getTotalEmployees = (
  employees: Employee[]
) => employees.length;

export const getActiveEmployees = (
  employees: Employee[]
) =>
  employees.filter(
    (employee) =>
      employee.status === "Active"
  ).length;

export const getInactiveEmployees = (
  employees: Employee[]
) =>
  employees.filter(
    (employee) =>
      employee.status === "Inactive"
  ).length;

export const getNoticePeriodEmployees = (
  employees: Employee[]
) =>
  employees.filter(
    (employee) =>
      employee.status ===
      "Notice Period"
  ).length;

export const getHighRiskEmployees = (
  employees: Employee[]
) =>
  employees.filter(
    (employee) =>
      employee.risk === "High"
  ).length;

export const getAverageSalary = (
  employees: Employee[]
) =>
  employees.length === 0
    ? 0
    : Math.round(
        calculateTotal(
          employees.map(
            (employee) =>
              employee.salary
          )
        ) / employees.length
      );

export const getAverageExperience = (
  employees: Employee[]
) =>
  calculateAverage(
    employees.map(
      (employee) =>
        employee.experience
    )
  );

export const getAveragePerformance = (
  employees: Employee[]
) =>
  calculateAverage(
    employees.map(
      (employee) =>
        employee.performanceScore
    )
  );

export const getAverageEngagement = (
  employees: Employee[]
) =>
  calculateAverage(
    employees.map(
      (employee) =>
        employee.engagementScore
    )
  );

export const getAverageAttendance = (
  employees: Employee[]
) =>
  calculateAverage(
    employees.map(
      (employee) =>
        employee.attendancePercentage
    )
  );

export const getAverageTraining = (
  employees: Employee[]
) =>
  calculateAverage(
    employees.map(
      (employee) =>
        employee.trainingCompletion
    )
  );

export const getAverageSkillCoverage = (
  employees: Employee[]
) =>
  calculateAverage(
    employees.map(
      (employee) =>
        employee.skillCoverage
    )
  );
  /* =====================================================
   Advanced KPI Statistics
===================================================== */

export const getAttritionRate = (
  employees: Employee[]
): number => {
  if (employees.length === 0) {
    return 0;
  }

  return calculatePercentage(
    getInactiveEmployees(employees),
    employees.length
  );
};

export const getDepartmentCount = (
  employees: Employee[]
): number =>
  new Set(
    employees.map(
      (employee) => employee.department
    )
  ).size;

export const getLocationCount = (
  employees: Employee[]
): number =>
  new Set(
    employees.map(
      (employee) => employee.location
    )
  ).size;

export const getRoleCount = (
  employees: Employee[]
): number =>
  new Set(
    employees.map(
      (employee) => employee.role
    )
  ).size;

export const getManagerCount = (
  employees: Employee[]
): number =>
  new Set(
    employees.map(
      (employee) => employee.manager
    )
  ).size;

export const getMonthlyHiring = (
  employees: Employee[]
) => {
  const map = new Map<
    string,
    number
  >();

  employees.forEach((employee) => {
    const month = new Date(
      employee.joiningDate
    ).toLocaleString("default", {
      month: "short",
    });

    map.set(
      month,
      (map.get(month) ?? 0) + 1
    );
  });

  return [...map.entries()].map(
    ([month, value]) => ({
      month,
      value,
    })
  );
};

/* =====================================================
   Dashboard Summary
===================================================== */

export const getDashboardSummary = (
  employees: Employee[]
) => ({
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

  averageTraining:
    getAverageTraining(employees),

  averageSkillCoverage:
    getAverageSkillCoverage(employees),

  attritionRate:
    getAttritionRate(employees),
});

/* =====================================================
   Filter Summary
===================================================== */

export const getFilterSummary = (
  filteredEmployees: Employee[],
  totalEmployees: number
) => ({
  totalEmployees,

  filteredEmployees:
    filteredEmployees.length,

  hiddenEmployees:
    totalEmployees -
    filteredEmployees.length,

  visiblePercentage:
    calculatePercentage(
      filteredEmployees.length,
      totalEmployees
    ),
});

/* =====================================================
   Export Helpers
===================================================== */

export const getExportSummary = (
  employees: Employee[]
) => ({
  generatedAt:
    new Date().toISOString(),

  employeeCount:
    employees.length,

  dashboard:
    getDashboardSummary(
      employees
    ),
});