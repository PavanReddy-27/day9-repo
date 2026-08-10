// src/features/charts/hooks/useChartData.ts
// PART 1

import { useMemo } from "react";

import type { Employee } from "../../../types/employee";

import {
  getMonthlyTrend,
  getDepartmentChart,
  getLocationChart,
  getRoleChart,
  getStatusChart,
  getRiskChart,
} from "../../../utils/chartutils";

import {
  getDashboardSummary,
  getActiveEmployees,
  getAverageSalary,
} from "../../../features/kpi/services/kpiAggregation";

export interface ChartComparison {
  enabled: boolean;

  leftEmployees: Employee[];

  rightEmployees: Employee[];
}

export interface ChartRefreshState {
  lastUpdated: string;

  refreshCount: number;
}

const sortDescending = <T,>(
  data: T[],
  key: keyof T
): T[] =>
  [...data].sort(
    (a, b) =>
      Number(b[key]) - Number(a[key])
  );

export const useChartData = (
  employees: Employee[],
  comparison?: ChartComparison
) => {
  const sourceEmployees = useMemo(() => {
    if (
      comparison?.enabled &&
      comparison.leftEmployees.length
    ) {
      return comparison.leftEmployees;
    }

    return employees;
  }, [employees, comparison]);

  /* ==========================
     Charts
  ========================== */

  const trendData = useMemo(
    () => getMonthlyTrend(sourceEmployees),
    [sourceEmployees]
  );

  const departmentData = useMemo(
    () =>
      sortDescending(
        getDepartmentChart(sourceEmployees),
        "value"
      ),
    [sourceEmployees]
  );

  const locationData = useMemo(
    () =>
      sortDescending(
        getLocationChart(sourceEmployees),
        "employees"
      ),
    [sourceEmployees]
  );

  const roleData = useMemo(
    () =>
      sortDescending(
        getRoleChart(sourceEmployees),
        "employees"
      ),
    [sourceEmployees]
  );

  const statusData = useMemo(
    () =>
      sortDescending(
        getStatusChart(sourceEmployees),
        "employees"
      ),
    [sourceEmployees]
  );

  const riskData = useMemo(
    () =>
      sortDescending(
        getRiskChart(sourceEmployees),
        "employees"
      ),
    [sourceEmployees]
  );

  /* ==========================
     Dashboard Summary
  ========================== */

  const dashboardSummary = useMemo(
    () => getDashboardSummary(sourceEmployees),
    [sourceEmployees]
  );

  /* ==========================
     Comparison Summary
  ========================== */

  const comparisonSummary = useMemo(() => {
    if (
      !comparison?.enabled ||
      !comparison.leftEmployees.length ||
      !comparison.rightEmployees.length
    ) {
      return null;
    }

    const leftTotal =
      comparison.leftEmployees.length;

    const rightTotal =
      comparison.rightEmployees.length;

    return {
      left: {
        employees: leftTotal,
        active:
          getActiveEmployees(
            comparison.leftEmployees
          ),
        averageSalary:
          getAverageSalary(
            comparison.leftEmployees
          ),
      },

      right: {
        employees: rightTotal,
        active:
          getActiveEmployees(
            comparison.rightEmployees
          ),
        averageSalary:
          getAverageSalary(
            comparison.rightEmployees
          ),
      },

      difference: {
        employees:
          leftTotal - rightTotal,

        salary:
          getAverageSalary(
            comparison.leftEmployees
          ) -
          getAverageSalary(
            comparison.rightEmployees
          ),
      },
    };
  }, [comparison]);

  /* ==========================
     Export Dataset
  ========================== */

  const exportData = useMemo(
    () => [...sourceEmployees],
    [sourceEmployees]
  );

  /* ==========================
     Refresh State
  ========================== */

  const refreshState: ChartRefreshState =
    useMemo(
      () => ({
        lastUpdated:
          new Date().toLocaleString(),

        refreshCount: sourceEmployees.length,
      }),
      [sourceEmployees]
    );

  const isEmpty =
    sourceEmployees.length === 0;

  const hasData =
    sourceEmployees.length > 0;

  const loading = false;

  const error = null;

  /* ==========================
     Filter Summary
  ========================== */

  const filterSummary = useMemo(
    () => ({
      totalEmployees: employees.length,

      visibleEmployees:
        sourceEmployees.length,

      hiddenEmployees:
        employees.length -
        sourceEmployees.length,

      percentage:
        employees.length === 0
          ? 0
          : Number(
              (
                (sourceEmployees.length /
                  employees.length) *
                100
              ).toFixed(1)
            ),
    }),
    [employees, sourceEmployees]
  );

  return {
    /* Employees */

    employees: sourceEmployees,

    exportData,

    /* Charts */

    trendData,

    departmentData,

    locationData,

    roleData,

    statusData,

    riskData,

    /* KPI */

    dashboardSummary,

    /* Comparison */

    comparisonSummary,

    /* Filter */

    filterSummary,

    /* State */

    refreshState,

    loading,

    error,

    hasData,

    isEmpty,
  };
};

export default useChartData;