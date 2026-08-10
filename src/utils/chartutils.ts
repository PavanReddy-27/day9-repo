// src/utils/chartUtils.ts
// PART 1 (Day 8 Update — FIXED)
//
// Change from the previous version:
// getMonthlyTrend() previously incremented totalEmployees and newHires
// together for every employee, so within any given month the two were
// always identical — the "Total Employees" area and "New Hires" line on
// the Workforce Trend chart rendered as exact duplicates of each other.
// totalEmployees is now a running cumulative sum of hires across months
// (in chronological order), so it represents actual headcount growth
// over time, while newHires stays as the count of hires in that single
// month. activeEmployees/attrition are unchanged — they still describe
// the cohort that joined in that month, since there's no termination
// date on Employee to compute a true point-in-time active headcount.

import type { Employee } from "../types/employee";

import type {
  TrendChartData,
  DepartmentChartData,
  LocationChartData,
  RoleChartData,
  StatusChartData,
  RiskChartData,
} from "../types/chart";

import {
  groupByWithSum,
  groupByPercentage,
} from "./groupBy";

/* ==========================================================
   Generic Helpers
========================================================== */

export const sortDescending = <
  T,
>(
  data: T[],
  selector: (item: T) => number
): T[] =>
  [...data].sort(
    (a, b) =>
      selector(b) - selector(a)
  );

export const sortAscending = <
  T,
>(
  data: T[],
  selector: (item: T) => number
): T[] =>
  [...data].sort(
    (a, b) =>
      selector(a) - selector(b)
  );

export const getChartColors = (
  count: number
): string[] => {
  const colors = [
    "#2563EB",
    "#7C3AED",
    "#16A34A",
    "#EA580C",
    "#0891B2",
    "#EC4899",
    "#F59E0B",
    "#0EA5E9",
    "#22C55E",
    "#DC2626",
  ];

  return Array.from(
    { length: count },
    (_, index) =>
      colors[
        index % colors.length
      ]
  );
};

export const hasChartData = (
  data: unknown[]
): boolean =>
  Array.isArray(data) &&
  data.length > 0;

export const getEmptyChartData = <
  T,
>(): T[] => [];

/* ==========================================================
   Department Chart
========================================================== */

export const getDepartmentChart = (
  employees: Employee[]
): DepartmentChartData[] => {
  const grouped =
    groupByWithSum(
      employees,
      "department",
      "salary"
    );

  return sortDescending(
    grouped.map((item) => {
      const departmentEmployees =
        employees.filter(
          (employee) =>
            employee.department ===
            item.key
        );

      return {
        id: item.key,

        name: item.key,

        value: item.count,

        activeEmployees:
          departmentEmployees.filter(
            (employee) =>
              employee.status ===
              "Active"
          ).length,

        inactiveEmployees:
          departmentEmployees.filter(
            (employee) =>
              employee.status !==
              "Active"
          ).length,

        averageSalary:
          Math.round(
            item.average
          ),

        averageExperience:
          Number(
            (
              departmentEmployees.reduce(
                (sum, employee) =>
                  sum +
                  employee.experience,
                0
              ) /
              departmentEmployees.length
            ).toFixed(1)
          ),

        performanceScore:
          Number(
            (
              departmentEmployees.reduce(
                (sum, employee) =>
                  sum +
                  employee.performanceScore,
                0
              ) /
              departmentEmployees.length
            ).toFixed(1)
          ),

        trainingCompletion:
          Number(
            (
              departmentEmployees.reduce(
                (sum, employee) =>
                  sum +
                  employee.trainingCompletion,
                0
              ) /
              departmentEmployees.length
            ).toFixed(1)
          ),
      };
    }),
    (item) => item.value
  );
};
/* ==========================================================
   Location Chart
========================================================== */

export const getLocationChart = (
  employees: Employee[]
): LocationChartData[] => {
  const grouped =
    groupByWithSum(
      employees,
      "location",
      "salary"
    );

  return sortDescending(
    grouped.map((item) => {
      const locationEmployees =
        employees.filter(
          (employee) =>
            employee.location ===
            item.key
        );

      return {
        id: item.key,

        location: item.key,

        employees: item.count,

        activeEmployees:
          locationEmployees.filter(
            (employee) =>
              employee.status ===
              "Active"
          ).length,

        averageSalary:
          Math.round(
            item.average
          ),

        performanceScore:
          Number(
            (
              locationEmployees.reduce(
                (sum, employee) =>
                  sum +
                  employee.performanceScore,
                0
              ) /
              locationEmployees.length
            ).toFixed(1)
          ),
      };
    }),
    (item) => item.employees
  );
};

/* ==========================================================
   Role Chart
========================================================== */

export const getRoleChart = (
  employees: Employee[]
): RoleChartData[] => {
  const grouped =
    groupByWithSum(
      employees,
      "role",
      "salary"
    );

  return sortDescending(
    grouped.map((item) => {
      const roleEmployees =
        employees.filter(
          (employee) =>
            employee.role ===
            item.key
        );

      return {
        id: item.key,

        role: item.key,

        employees: item.count,

        averageSalary:
          Math.round(
            item.average
          ),

        averageExperience:
          Number(
            (
              roleEmployees.reduce(
                (sum, employee) =>
                  sum +
                  employee.experience,
                0
              ) /
              roleEmployees.length
            ).toFixed(1)
          ),
      };
    }),
    (item) => item.employees
  );
};

/* ==========================================================
   Status Chart
========================================================== */

export const getStatusChart = (
  employees: Employee[]
): StatusChartData[] =>
  sortDescending(
    groupByPercentage(
      employees,
      "status"
    ).map((item) => ({
      id: item.key,

      status: item.key,

      employees:
        item.count,

      percentage:
        item.percentage,
    })),
    (item) => item.employees
  );
  /* ==========================================================
   Risk Chart
========================================================== */

export const getRiskChart = (
  employees: Employee[]
): RiskChartData[] =>
  sortDescending(
    groupByPercentage(
      employees,
      "risk"
    ).map((item) => ({
      id: item.key,

      risk: item.key,

      employees:
        item.count,

      percentage:
        item.percentage,
    })),
    (item) => item.employees
  );

/* ==========================================================
   Workforce Trend
   ----------------------------------------------------------
   Step 1: bucket employees by joining month. Within a bucket,
   newHires/activeEmployees/attrition describe that month's
   cohort only.

   Step 2 (the fix): walk the buckets in chronological order
   and turn totalEmployees into a running cumulative sum of
   newHires, so it reflects actual headcount growth over time
   instead of duplicating the newHires figure for that month.
========================================================== */

export const getMonthlyTrend = (
  employees: Employee[]
): TrendChartData[] => {
  const monthly =
    new Map<
      string,
      TrendChartData
    >();

  employees.forEach(
    (employee) => {
      const month =
        new Date(
          employee.joiningDate
        ).toLocaleString(
          "default",
          {
            month: "short",
          }
        );

      if (!monthly.has(month)) {
        monthly.set(month, {
          month,

          totalEmployees: 0,

          activeEmployees: 0,

          newHires: 0,

          attrition: 0,
        });
      }

      const record =
        monthly.get(month)!;

      record.newHires++;

      if (
        employee.status ===
        "Active"
      ) {
        record.activeEmployees++;
      }

      if (
        employee.status ===
          "Inactive" ||
        employee.status ===
          "Notice Period"
      ) {
        record.attrition++;
      }
    }
  );

  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chronological = [
    ...monthly.values(),
  ].sort(
    (a, b) =>
      monthOrder.indexOf(
        a.month
      ) -
      monthOrder.indexOf(
        b.month
      )
  );

  let cumulativeTotal = 0;

  return chronological.map(
    (record) => {
      cumulativeTotal +=
        record.newHires;

      return {
        ...record,

        totalEmployees:
          cumulativeTotal,
      };
    }
  );
};

/* ==========================================================
   Dashboard Charts
========================================================== */

export const getDashboardCharts = (
  employees: Employee[]
) => ({
  trend:
    getMonthlyTrend(
      employees
    ),

  departments:
    getDepartmentChart(
      employees
    ),

  locations:
    getLocationChart(
      employees
    ),

  roles:
    getRoleChart(
      employees
    ),

  status:
    getStatusChart(
      employees
    ),

  risk:
    getRiskChart(
      employees
    ),
});

/* ==========================================================
   Comparison Charts
========================================================== */

export const getComparisonCharts = (
  leftEmployees: Employee[],
  rightEmployees: Employee[]
) => ({
  left:
    getDashboardCharts(
      leftEmployees
    ),

  right:
    getDashboardCharts(
      rightEmployees
    ),
});