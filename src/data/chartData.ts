// src/data/chartData.ts
// PART 1 (Day 8 Update)

import { employees } from "./employees";

import type {
  TrendChartData,
  DepartmentChartData,
  LocationChartData,
  RoleChartData,
  StatusChartData,
  RiskChartData,
} from "../types/chart";

import type { Employee } from "../types/employee";

/* ==========================================================
   Generic Helpers
========================================================== */

const average = (
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

const percentage = (
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

/* ==========================================================
   Workforce Trend Generator
========================================================== */

export const generateTrendChartData = (
  data: Employee[]
): TrendChartData[] => {
  const monthMap = new Map<
    string,
    TrendChartData
  >();

  data.forEach((employee) => {
    const month = new Date(
      employee.joiningDate
    ).toLocaleString("default", {
      month: "short",
    });

    if (!monthMap.has(month)) {
      monthMap.set(month, {
        month,

        totalEmployees: 0,

        activeEmployees: 0,

        newHires: 0,

        attrition: 0,
      });
    }

    const record =
      monthMap.get(month)!;

    record.totalEmployees++;

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
  });

  return [...monthMap.values()];
};

/* ==========================================================
   Department Generator
========================================================== */

export const generateDepartmentChartData =
  (
    data: Employee[]
  ): DepartmentChartData[] =>
    Object.values(
      data.reduce<
        Record<
          string,
          DepartmentChartData
        >
      >((acc, employee) => {
        if (
          !acc[
            employee.department
          ]
        ) {
          acc[
            employee.department
          ] = {
            id: employee.department,

            name:
              employee.department,

            value: 0,

            activeEmployees: 0,

            inactiveEmployees: 0,

            averageSalary: 0,

            averageExperience: 0,

            performanceScore: 0,

            trainingCompletion: 0,
          };
        }

        const department =
          acc[
            employee.department
          ];

        department.value++;

        if (
          employee.status ===
          "Active"
        ) {
          department.activeEmployees++;
        } else {
          department.inactiveEmployees++;
        }

        department.averageSalary +=
          employee.salary;

        department.averageExperience +=
          employee.experience;

        department.performanceScore +=
          employee.performanceScore;

        department.trainingCompletion +=
          employee.trainingCompletion;

        return acc;
      }, {})
    ).map((department) => ({
      ...department,

      averageSalary:
        Math.round(
          department.averageSalary /
            department.value
        ),

      averageExperience:
        average([
          department.averageExperience /
            department.value,
        ]),

      performanceScore:
        average([
          department.performanceScore /
            department.value,
        ]),

      trainingCompletion:
        average([
          department.trainingCompletion /
            department.value,
        ]),
    }));

/* ==========================================================
   Default Dashboard Data
========================================================== */

export const trendChartData =
  generateTrendChartData(
    employees
  );

export const departmentChartData =
  generateDepartmentChartData(
    employees
  );
  /* ==========================================================
   Location Generator
========================================================== */

export const generateLocationChartData = (
  data: Employee[]
): LocationChartData[] =>
  Object.values(
    data.reduce<
      Record<string, LocationChartData>
    >((acc, employee) => {
      if (!acc[employee.location]) {
        acc[employee.location] = {
          id: employee.location,

          location: employee.location,

          employees: 0,

          activeEmployees: 0,

          averageSalary: 0,

          performanceScore: 0,
        };
      }

      const location =
        acc[employee.location];

      location.employees++;

      if (employee.status === "Active") {
        location.activeEmployees++;
      }

      location.averageSalary +=
        employee.salary;

      location.performanceScore +=
        employee.performanceScore;

      return acc;
    }, {})
  ).map((location) => ({
    ...location,

    averageSalary: Math.round(
      location.averageSalary /
        location.employees
    ),

    performanceScore: average([
      location.performanceScore /
        location.employees,
    ]),
  }));

/* ==========================================================
   Role Generator
========================================================== */

export const generateRoleChartData = (
  data: Employee[]
): RoleChartData[] =>
  Object.values(
    data.reduce<
      Record<string, RoleChartData>
    >((acc, employee) => {
      if (!acc[employee.role]) {
        acc[employee.role] = {
          id: employee.role,

          role: employee.role,

          employees: 0,

          averageSalary: 0,

          averageExperience: 0,
        };
      }

      const role =
        acc[employee.role];

      role.employees++;

      role.averageSalary +=
        employee.salary;

      role.averageExperience +=
        employee.experience;

      return acc;
    }, {})
  ).map((role) => ({
    ...role,

    averageSalary: Math.round(
      role.averageSalary /
        role.employees
    ),

    averageExperience: average([
      role.averageExperience /
        role.employees,
    ]),
  }));

/* ==========================================================
   Default Dashboard Data
========================================================== */

export const locationChartData =
  generateLocationChartData(
    employees
  );

export const roleChartData =
  generateRoleChartData(
    employees
  );
  /* ==========================================================
   Status Generator
========================================================== */

export const generateStatusChartData = (
  data: Employee[]
): StatusChartData[] => {
  const total = data.length;

  return Object.entries(
    data.reduce<Record<string, number>>(
      (acc, employee) => {
        acc[employee.status] =
          (acc[employee.status] ?? 0) + 1;

        return acc;
      },
      {}
    )
  ).map(([status, count]) => ({
    id: status,

    status,

    employees: count,

    percentage: percentage(
      count,
      total
    ),
  }));
};

/* ==========================================================
   Risk Generator
========================================================== */

export const generateRiskChartData = (
  data: Employee[]
): RiskChartData[] => {
  const total = data.length;

  return Object.entries(
    data.reduce<Record<string, number>>(
      (acc, employee) => {
        acc[employee.risk] =
          (acc[employee.risk] ?? 0) + 1;

        return acc;
      },
      {}
    )
  ).map(([risk, count]) => ({
    id: risk,

    risk,

    employees: count,

    percentage: percentage(
      count,
      total
    ),
  }));
};

/* ==========================================================
   Comparison Dataset
========================================================== */

export interface DashboardComparisonData {
  left: Employee[];

  right: Employee[];

  trend: TrendChartData[];

  departments: DepartmentChartData[];

  locations: LocationChartData[];

  roles: RoleChartData[];

  status: StatusChartData[];

  risk: RiskChartData[];
}

export const generateComparisonData = (
  leftEmployees: Employee[],
  rightEmployees: Employee[]
): DashboardComparisonData => ({
  left: leftEmployees,

  right: rightEmployees,

  trend: generateTrendChartData([
    ...leftEmployees,
    ...rightEmployees,
  ]),

  departments:
    generateDepartmentChartData([
      ...leftEmployees,
      ...rightEmployees,
    ]),

  locations:
    generateLocationChartData([
      ...leftEmployees,
      ...rightEmployees,
    ]),

  roles: generateRoleChartData([
    ...leftEmployees,
    ...rightEmployees,
  ]),

  status:
    generateStatusChartData([
      ...leftEmployees,
      ...rightEmployees,
    ]),

  risk: generateRiskChartData([
    ...leftEmployees,
    ...rightEmployees,
  ]),
});

/* ==========================================================
   Default Dashboard Data
========================================================== */

export const statusChartData =
  generateStatusChartData(
    employees
  );

export const riskChartData =
  generateRiskChartData(
    employees
  );

/* ==========================================================
   Dashboard Factory
========================================================== */

export const createDashboardChartData = (
  data: Employee[]
) => ({
  trend:
    generateTrendChartData(data),

  departments:
    generateDepartmentChartData(
      data
    ),

  locations:
    generateLocationChartData(
      data
    ),

  roles:
    generateRoleChartData(data),

  status:
    generateStatusChartData(
      data
    ),

  risk:
    generateRiskChartData(data),
});