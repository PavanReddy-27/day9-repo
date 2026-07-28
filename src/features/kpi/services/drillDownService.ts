// src/features/kpi/services/drillDownService.ts
// PART 1 (Day 8 Update — FIXED)
//
// Changes from the previous version:
// 1. trainingCompletion()/skillCoverage() static functions (92 / 88) are
//    removed. Both KPIs now use the real getAverageTraining() /
//    getAverageSkillCoverage() aggregators — the same ones already used
//    inside statistics() — so the drill-down total can never disagree
//    with its own breakdown panel.
// 2. statistics() no longer returns the same seven hardcoded trend
//    numbers (5.2, 3.1, 4.6, 2.8, 1.7, 5.8, 3.5) for every KPI. This
//    function has no access to a prior-period employee snapshot, so
//    there is no real growth figure it could compute honestly — trend
//    is now 0 (neutral) instead of an invented value that never
//    changed no matter what data it was fed.
// 3. Each getDrillDownData() case no longer returns a hardcoded
//    "growth" string (e.g. "+6.2%"). Same reasoning as above — this
//    function only ever sees a single snapshot of employees, so there
//    is nothing to compare against. growth is now "N/A" everywhere
//    until a real previous-period data source is wired in. See
//    KPIDrillDown.tsx for how "N/A" is handled in the UI (hidden
//    rather than shown as a fake percentage).

import type { Employee } from "../../../types/employee";
import type { KPIType } from "../../../types/kpi";

import type {
  DrillDownData,
  DrillDownStatistics,
  DrillDownChartData,
} from "../../../types/drilldown";

import {
  groupByDepartment,
  groupByLocation,
  groupByRole,
  groupByRisk,
  groupByStatus,

  getAverageSalary,
  getAverageExperience,
  getAveragePerformance,
  getAverageEngagement,
  getAverageAttendance,
  getAverageTraining,
  getAverageSkillCoverage,

  getAttritionRate,
  getDepartmentCount,
  getActiveEmployees,
  getHighRiskEmployees,
} from "./kpiAggregation";

/* =====================================================
   No-Baseline Placeholder
   ---------------------------------------------------
   Used anywhere a "growth vs previous period" figure
   would be shown but this function has no previous
   period to compare against. Showing "N/A" is honest;
   showing a percentage would not be.
===================================================== */

const NO_BASELINE_GROWTH = "N/A";

/* =====================================================
   Employee Mapper
===================================================== */

const mapEmployees = (
  employees: Employee[]
): Employee[] => employees;

/* =====================================================
   Chart Mapper
===================================================== */

const toChartData = (
  items: ReturnType<
    typeof groupByDepartment
  >
): DrillDownChartData[] =>
  items.map((item) => ({
    label: item.label,

    value: Number(item.value),
  }));

/* =====================================================
   Statistics Builder
   ---------------------------------------------------
   trend is 0 (neutral) for every entry: this function
   only receives a single snapshot of employees, so it
   has no prior-period figure to diff against. A real
   trend requires a historical data source — wire one
   in here (and swap the 0s for calculateGrowth(...)
   calls) once that's available.
===================================================== */

const statistics = (
  employees: Employee[]
): DrillDownStatistics[] => [
  {
    id: "averageSalary",

    title: "Average Salary",

    value: `$${getAverageSalary(
      employees
    ).toLocaleString()}`,

    trend: 0,

    color: "#2563EB",
  },

  {
    id: "averageExperience",

    title: "Experience",

    value: `${getAverageExperience(
      employees
    )} Years`,

    trend: 0,

    color: "#16A34A",
  },

  {
    id: "performance",

    title: "Performance",

    value: `${getAveragePerformance(
      employees
    )}%`,

    trend: 0,

    color: "#7C3AED",
  },

  {
    id: "engagement",

    title: "Engagement",

    value: `${getAverageEngagement(
      employees
    )}%`,

    trend: 0,

    color: "#0891B2",
  },

  {
    id: "attendance",

    title: "Attendance",

    value: `${getAverageAttendance(
      employees
    )}%`,

    trend: 0,

    color: "#EA580C",
  },

  {
    id: "training",

    title: "Training",

    value: `${getAverageTraining(
      employees
    )}%`,

    trend: 0,

    color: "#9333EA",
  },

  {
    id: "skillCoverage",

    title: "Skill Coverage",

    value: `${getAverageSkillCoverage(
      employees
    )}%`,

    trend: 0,

    color: "#0EA5E9",
  },
];
/* =====================================================
   KPI DrillDown Builder
===================================================== */

export const getDrillDownData = (
  kpi: KPIType,
  employees: Employee[]
): DrillDownData => {
  switch (kpi) {
    case "totalEmployees": {
      const items =
        groupByDepartment(employees);

      return {
        kpi,

        title: "Total Employees",

        total: employees.length,

        growth: NO_BASELINE_GROWTH,

        description:
          "Overall workforce distribution across departments.",

        items,

        chartData:
          toChartData(items),

        statistics:
          statistics(employees),

        employees:
          mapEmployees(employees),
      };
    }

    case "activeEmployees": {
      const active =
        employees.filter(
          (employee) =>
            employee.status ===
            "Active"
        );

      const items =
        groupByDepartment(active);

      return {
        kpi,

        title:
          "Active Employees",

        total: active.length,

        growth: NO_BASELINE_GROWTH,

        description:
          "Currently active employees across the organization.",

        items,

        chartData:
          toChartData(items),

        statistics:
          statistics(active),

        employees:
          mapEmployees(active),
      };
    }

    case "newHires": {
      const currentYear =
        new Date().getFullYear();

      const hires =
        employees.filter(
          (employee) =>
            new Date(
              employee.joiningDate
            ).getFullYear() ===
            currentYear
        );

      const items =
        groupByLocation(
          hires
        );

      return {
        kpi,

        title:
          "New Hires",

        total: hires.length,

        growth: NO_BASELINE_GROWTH,

        description:
          "Employees hired during the current year.",

        items,

        chartData:
          toChartData(items),

        statistics:
          statistics(hires),

        employees:
          mapEmployees(hires),
      };
    }

    case "attritionRate": {
      const items =
        groupByStatus(
          employees
        );

      return {
        kpi,

        title:
          "Attrition Rate",

        total: `${getAttritionRate(
          employees
        )}%`,

        growth: NO_BASELINE_GROWTH,

        description:
          "Employee attrition analysis.",

        items,

        chartData:
          toChartData(items),

        statistics:
          statistics(employees),

        employees:
          mapEmployees(employees),
      };
    }

    case "trainingCompletion": {
      const items =
        groupByRole(
          employees
        );

      return {
        kpi,

        title:
          "Training Completion",

        total: `${getAverageTraining(
          employees
        )}%`,

        growth: NO_BASELINE_GROWTH,

        description:
          "Training completion across workforce.",

        items,

        chartData:
          toChartData(items),

        statistics:
          statistics(employees),

        employees:
          mapEmployees(employees),
      };
    }
        case "skillCoverage": {
      const items =
        groupByRole(employees);

      return {
        kpi,

        title: "Skill Coverage",

        total: `${getAverageSkillCoverage(
          employees
        )}%`,

        growth: NO_BASELINE_GROWTH,

        description:
          "Certified skills available across the organization.",

        items,

        chartData:
          toChartData(items),

        statistics:
          statistics(employees),

        employees:
          mapEmployees(employees),
      };
    }

    case "highRiskEmployees": {
      const highRisk =
        employees.filter(
          (employee) =>
            employee.risk === "High"
        );

      const items =
        groupByRisk(highRisk);

      return {
        kpi,

        title:
          "High Risk Employees",

        total:
          getHighRiskEmployees(
            employees
          ),

        growth: NO_BASELINE_GROWTH,

        description:
          "Employees requiring immediate attention.",

        items,

        chartData:
          toChartData(items),

        statistics:
          statistics(highRisk),

        employees:
          mapEmployees(highRisk),
      };
    }

    case "departments": {
      const items =
        groupByDepartment(
          employees
        );

      return {
        kpi,

        title: "Departments",

        total:
          getDepartmentCount(
            employees
          ),

        growth: NO_BASELINE_GROWTH,

        description:
          "Department-wise workforce distribution.",

        items,

        chartData:
          toChartData(items),

        statistics: [
          {
            id: "departments",
            title: "Departments",
            value:
              getDepartmentCount(
                employees
              ),
            trend: 0,
            color: "#2563EB",
          },
          {
            id: "activeEmployees",
            title:
              "Active Employees",
            value:
              getActiveEmployees(
                employees
              ),
            trend: 0,
            color: "#16A34A",
          },
          {
            id: "averageSalary",
            title:
              "Average Salary",
            value: `$${getAverageSalary(
              employees
            ).toLocaleString()}`,
            trend: 0,
            color: "#9333EA",
          },
        ],

        employees:
          mapEmployees(employees),
      };
    }

    default:
      return {
        kpi,

        title: "No Data",

        total: 0,

        growth: NO_BASELINE_GROWTH,

        description:
          "No drill-down data available.",

        items: [],

        chartData: [],

        statistics: [],

        employees: [],
      };
  }
};

export default getDrillDownData;