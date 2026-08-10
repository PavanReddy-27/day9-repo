// src/features/kpi/services/kpiComparison.ts

import type { Employee } from "../../../types/employee";

import {
  getTotalEmployees,
  getActiveEmployees,
  getInactiveEmployees,
  getAverageSalary,
  getAverageExperience,
  getAttritionRate,
  getHighRiskEmployees,
} from "./kpiAggregation";

export interface KPIComparisonResult {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  averageSalary: number;
  averageExperience: number;
  attritionRate: number;
  highRiskEmployees: number;
}

export interface KPIComparison {
  left: KPIComparisonResult;

  right: KPIComparisonResult;

  difference: KPIComparisonResult;

  growth: {
    totalEmployees: number;

    activeEmployees: number;

    inactiveEmployees: number;

    averageSalary: number;

    averageExperience: number;

    attritionRate: number;

    highRiskEmployees: number;
  };
}

const percentageDifference = (
  left: number,
  right: number
): number => {
  if (right === 0) {
    return left === 0 ? 0 : 100;
  }

  return Number(
    (((left - right) / right) * 100).toFixed(1)
  );
};

export const calculateKPIs = (
  employees: Employee[]
): KPIComparisonResult => ({
  totalEmployees:
    getTotalEmployees(employees),

  activeEmployees:
    getActiveEmployees(employees),

  inactiveEmployees:
    getInactiveEmployees(employees),

  averageSalary:
    getAverageSalary(employees),

  averageExperience:
    getAverageExperience(employees),

  attritionRate:
    getAttritionRate(employees),

  highRiskEmployees:
    getHighRiskEmployees(employees),
});

export const compareKPIs = (
  leftEmployees: Employee[],
  rightEmployees: Employee[]
): KPIComparison => {
  const left =
    calculateKPIs(leftEmployees);

  const right =
    calculateKPIs(rightEmployees);

  return {
    left,

    right,

    difference: {
      totalEmployees:
        left.totalEmployees -
        right.totalEmployees,

      activeEmployees:
        left.activeEmployees -
        right.activeEmployees,

      inactiveEmployees:
        left.inactiveEmployees -
        right.inactiveEmployees,

      averageSalary:
        left.averageSalary -
        right.averageSalary,

      averageExperience:
        Number(
          (
            left.averageExperience -
            right.averageExperience
          ).toFixed(1)
        ),

      attritionRate:
        Number(
          (
            left.attritionRate -
            right.attritionRate
          ).toFixed(1)
        ),

      highRiskEmployees:
        left.highRiskEmployees -
        right.highRiskEmployees,
    },

    growth: {
      totalEmployees:
        percentageDifference(
          left.totalEmployees,
          right.totalEmployees
        ),

      activeEmployees:
        percentageDifference(
          left.activeEmployees,
          right.activeEmployees
        ),

      inactiveEmployees:
        percentageDifference(
          left.inactiveEmployees,
          right.inactiveEmployees
        ),

      averageSalary:
        percentageDifference(
          left.averageSalary,
          right.averageSalary
        ),

      averageExperience:
        percentageDifference(
          left.averageExperience,
          right.averageExperience
        ),

      attritionRate:
        percentageDifference(
          left.attritionRate,
          right.attritionRate
        ),

      highRiskEmployees:
        percentageDifference(
          left.highRiskEmployees,
          right.highRiskEmployees
        ),
    },
  };
};

export const compareDepartments = (
  employees: Employee[],
  leftDepartment: string,
  rightDepartment: string
): KPIComparison =>
  compareKPIs(
    employees.filter(
      (employee) =>
        employee.department ===
        leftDepartment
    ),
    employees.filter(
      (employee) =>
        employee.department ===
        rightDepartment
    )
  );

export const compareLocations = (
  employees: Employee[],
  leftLocation: string,
  rightLocation: string
): KPIComparison =>
  compareKPIs(
    employees.filter(
      (employee) =>
        employee.location ===
        leftLocation
    ),
    employees.filter(
      (employee) =>
        employee.location ===
        rightLocation
    )
  );

export const compareDateRanges = (
  employees: Employee[],
  leftStart: string,
  leftEnd: string,
  rightStart: string,
  rightEnd: string
): KPIComparison => {
  const leftEmployees =
    employees.filter((employee) => {
      const date = new Date(
        employee.joiningDate
      );

      return (
        date >= new Date(leftStart) &&
        date <= new Date(leftEnd)
      );
    });

  const rightEmployees =
    employees.filter((employee) => {
      const date = new Date(
        employee.joiningDate
      );

      return (
        date >= new Date(rightStart) &&
        date <= new Date(rightEnd)
      );
    });

  return compareKPIs(
    leftEmployees,
    rightEmployees
  );
};

export default compareKPIs;