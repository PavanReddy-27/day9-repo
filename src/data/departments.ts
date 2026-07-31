// src/data/departments.ts

export interface Department {
  id: number;
  code: string;
  name: string;
  shortName: string;
  color: string;

  manager: string;

  totalEmployees: number;
  activeEmployees: number;
  openPositions: number;

  averageSalary: number;
  averageExperience: number;

  performanceScore: number;
  engagementScore: number;
  trainingCompletion: number;

  attritionRate: number;
}

export const departments: Department[] = [
  {
    id: 1,
    code: "ENG",
    name: "Engineering",
    shortName: "ENG",
    color: "#1976d2",
    manager: "Robert King",
    totalEmployees: 320,
    activeEmployees: 305,
    openPositions: 18,
    averageSalary: 94000,
    averageExperience: 6.8,
    performanceScore: 91,
    engagementScore: 88,
    trainingCompletion: 94,
    attritionRate: 3.2,
  },
  {
    id: 2,
    code: "HR",
    name: "Human Resources",
    shortName: "HR",
    color: "#43a047",
    manager: "Linda White",
    totalEmployees: 58,
    activeEmployees: 56,
    openPositions: 3,
    averageSalary: 72000,
    averageExperience: 7.1,
    performanceScore: 89,
    engagementScore: 90,
    trainingCompletion: 97,
    attritionRate: 1.8,
  },
  {
    id: 3,
    code: "SAL",
    name: "Sales",
    shortName: "Sales",
    color: "#fb8c00",
    manager: "Chris Evans",
    totalEmployees: 148,
    activeEmployees: 139,
    openPositions: 10,
    averageSalary: 68000,
    averageExperience: 5.2,
    performanceScore: 84,
    engagementScore: 81,
    trainingCompletion: 87,
    attritionRate: 5.7,
  },
  {
    id: 4,
    code: "FIN",
    name: "Finance",
    shortName: "Finance",
    color: "#8e24aa",
    manager: "Grace Thomas",
    totalEmployees: 82,
    activeEmployees: 79,
    openPositions: 4,
    averageSalary: 79000,
    averageExperience: 8.3,
    performanceScore: 92,
    engagementScore: 89,
    trainingCompletion: 96,
    attritionRate: 2.4,
  },
  {
    id: 5,
    code: "MKT",
    name: "Marketing",
    shortName: "Marketing",
    color: "#00acc1",
    manager: "Nancy Cooper",
    totalEmployees: 94,
    activeEmployees: 91,
    openPositions: 6,
    averageSalary: 69000,
    averageExperience: 4.9,
    performanceScore: 87,
    engagementScore: 86,
    trainingCompletion: 91,
    attritionRate: 3.8,
  },
  {
    id: 6,
    code: "OPS",
    name: "Operations",
    shortName: "Operations",
    color: "#e53935",
    manager: "Daniel Scott",
    totalEmployees: 126,
    activeEmployees: 118,
    openPositions: 7,
    averageSalary: 76000,
    averageExperience: 7.5,
    performanceScore: 90,
    engagementScore: 87,
    trainingCompletion: 93,
    attritionRate: 2.9,
  },
];