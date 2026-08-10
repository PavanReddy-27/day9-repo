// src/types/employee.ts

export type EmployeeStatus =
  | "Active"
  | "Inactive"
  | "On Leave"
  | "Notice Period";

export type RiskLevel =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

export type Gender =
  | "Male"
  | "Female"
  | "Other";

export type EmploymentType =
  | "Permanent"
  | "Contract"
  | "Intern"
  | "Consultant";

export interface Employee {
  // Identity
  id: number;
  employeeId: string;

  firstName: string;
  lastName: string;
  fullName: string;
  name?: string;

  email: string;
  phone: string;

  avatar?: string;

  // Organization
  department: string;
  team: string;
  role: string;
  designation: string;

  manager: string;

  location: string;
  country: string;

  employmentType: EmploymentType;

  // Workforce
  status: EmployeeStatus;
  risk: RiskLevel;

  joiningDate: string;
  confirmationDate?: string;

  // Personal
  gender: Gender;
  age: number;

  // Compensation
  salary: number;
  bonus: number;

  // Experience
  experience: number;

  // Performance
  performanceScore: number;
  engagementScore: number;
  attendancePercentage: number;

  // Learning
  trainingCompletion: number;
  skillCoverage: number;

  // Career
  promotionCount: number;

  // Projects
  project: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}