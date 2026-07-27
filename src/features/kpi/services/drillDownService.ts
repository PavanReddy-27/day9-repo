// src/features/kpi/services/drillDownService.ts
// PART 1 (Day 8 Update)

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
   Static KPI Values
===================================================== */

const trainingCompletion = () => 92;

const skillCoverage = () => 88;

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

    trend: 5.2,

    color: "#2563EB",
  },

  {
    id: "averageExperience",

    title: "Experience",

    value: `${getAverageExperience(
      employees
    )} Years`,

    trend: 3.1,

    color: "#16A34A",
  },

  {
    id: "performance",

    title: "Performance",

    value: `${getAveragePerformance(
      employees
    )}%`,

    trend: 4.6,

    color: "#7C3AED",
  },

  {
    id: "engagement",

    title: "Engagement",

    value: `${getAverageEngagement(
      employees
    )}%`,

    trend: 2.8,

    color: "#0891B2",
  },

  {
    id: "attendance",

    title: "Attendance",

    value: `${getAverageAttendance(
      employees
    )}%`,

    trend: 1.7,

    color: "#EA580C",
  },

  {
    id: "training",

    title: "Training",

    value: `${getAverageTraining(
      employees
    )}%`,

    trend: 5.8,

    color: "#9333EA",
  },

  {
    id: "skillCoverage",

    title: "Skill Coverage",

    value: `${getAverageSkillCoverage(
      employees
    )}%`,

    trend: 3.5,

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

        growth: "+6.2%",

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

        growth: "+4.1%",

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

        growth: "+12.5%",

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

        growth: "-1.8%",

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

        total: `${trainingCompletion()}%`,

        growth: "+5.2%",

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

        total: `${skillCoverage()}%`,

        growth: "+3.1%",

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

        growth: "-2.4%",

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

        growth: "0%",

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
            trend: 4.2,
            color: "#16A34A",
          },
          {
            id: "averageSalary",
            title:
              "Average Salary",
            value: `$${getAverageSalary(
              employees
            ).toLocaleString()}`,
            trend: 5.1,
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

        growth: "0%",

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