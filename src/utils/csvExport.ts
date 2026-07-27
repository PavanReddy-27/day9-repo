// src/utils/csvExport.ts
// PART 1 (Day 8 Update)

import type { Employee } from "../types/employee";

const escapeCSV = (
  value: string | number | boolean | null | undefined
): string => {
  const text = String(value ?? "");

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

const downloadFile = (
  content: string,
  fileName: string,
  mimeType: string
): void => {
  const blob = new Blob([content], {
    type: mimeType,
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = fileName;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export interface ExportMetadata {
  generatedAt: string;

  exportedBy: string;

  totalRecords: number;

  filters?: string[];

  version?: string;
}

export const exportEmployeesToCSV = (
  employees: Employee[],
  fileName = `employees-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`,
  metadata?: ExportMetadata
): void => {
  if (!employees.length) {
    return;
  }

  const lines: string[] = [];

  if (metadata) {
    lines.push(
      `Generated At,${escapeCSV(
        metadata.generatedAt
      )}`
    );

    lines.push(
      `Exported By,${escapeCSV(
        metadata.exportedBy
      )}`
    );

    lines.push(
      `Total Records,${metadata.totalRecords}`
    );

    if (metadata.version) {
      lines.push(
        `Version,${metadata.version}`
      );
    }

    if (
      metadata.filters &&
      metadata.filters.length
    ) {
      lines.push(
        `Filters,${metadata.filters.join(
          " | "
        )}`
      );
    }

    lines.push("");
  }

  const headers = [
    "Employee ID",
    "Full Name",
    "Department",
    "Team",
    "Designation",
    "Role",
    "Manager",
    "Location",
    "Country",
    "Employment Type",
    "Status",
    "Risk",
    "Gender",
    "Age",
    "Experience",
    "Salary",
    "Bonus",
    "Performance",
    "Engagement",
    "Attendance",
    "Training",
    "Skill Coverage",
    "Promotions",
    "Project",
    "Joining Date",
  ];

  lines.push(headers.join(","));
    const rows = employees.map((employee) => [
    employee.employeeId,
    employee.fullName,
    employee.department,
    employee.team,
    employee.designation,
    employee.role,
    employee.manager,
    employee.location,
    employee.country,
    employee.employmentType,
    employee.status,
    employee.risk,
    employee.gender,
    employee.age,
    employee.experience,
    employee.salary,
    employee.bonus,
    employee.performanceScore,
    employee.engagementScore,
    employee.attendancePercentage,
    employee.trainingCompletion,
    employee.skillCoverage,
    employee.promotionCount,
    employee.project,
    employee.joiningDate,
  ]);

  rows.forEach((row) => {
    lines.push(
      row
        .map((value) =>
          escapeCSV(value)
        )
        .join(",")
    );
  });

  downloadFile(
    lines.join("\n"),
    fileName,
    "text/csv;charset=utf-8;"
  );
};

export const exportJSON = <T>(
  data: T[],
  fileName = "data.json"
): void => {
  downloadFile(
    JSON.stringify(data, null, 2),
    fileName,
    "application/json"
  );
};

export const exportDashboardSummary = (
  summary: Record<
    string,
    string | number
  >,
  fileName = "dashboard-summary.csv"
): void => {
  const rows = Object.entries(
    summary
  ).map(
    ([key, value]) =>
      `${escapeCSV(
        key
      )},${escapeCSV(value)}`
  );

  downloadFile(
    rows.join("\n"),
    fileName,
    "text/csv;charset=utf-8;"
  );
};

export const exportComparisonReport = (
  comparison: Record<
    string,
    string | number
  >,
  fileName = "comparison-report.csv"
): void => {
  const rows = Object.entries(
    comparison
  ).map(
    ([key, value]) =>
      `${escapeCSV(
        key
      )},${escapeCSV(value)}`
  );

  downloadFile(
    rows.join("\n"),
    fileName,
    "text/csv;charset=utf-8;"
  );
};

export default exportEmployeesToCSV;