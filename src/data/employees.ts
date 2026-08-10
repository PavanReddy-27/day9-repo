// src/data/employees.ts

import type { Employee } from "../types/employee";

export const employees: Employee[] = [
  {
    id: 1,
    employeeId: "EMP001",
    firstName: "John",
    lastName: "Smith",
    fullName: "John Smith",
    name: "John Smith",
    email: "john.smith@company.com",
    phone: "+91-9876500001",
    avatar: "",

    department: "Engineering",
    team: "Frontend",
    role: "Frontend Developer",
    designation: "Senior Software Engineer",
    manager: "Robert King",

    location: "Hyderabad",
    country: "India",
    employmentType: "Permanent",

    status: "Active",
    risk: "Low",

    joiningDate: "2022-01-15",
    confirmationDate: "2022-07-15",

    gender: "Male",
    age: 28,

    salary: 85000,
    bonus: 10000,

    experience: 5,

    performanceScore: 92,
    engagementScore: 90,
    attendancePercentage: 98,

    trainingCompletion: 95,
    skillCoverage: 91,

    promotionCount: 2,

    project: "Workforce Analytics",

    createdAt: "2022-01-15",
    updatedAt: "2026-07-01",
  },
  {
    id: 2,
    employeeId: "EMP002",
    firstName: "Sarah",
    lastName: "Johnson",
    fullName: "Sarah Johnson",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    phone: "+91-9876500002",
    avatar: "",

    department: "Engineering",
    team: "Backend",
    role: "Backend Developer",
    designation: "Software Engineer",
    manager: "Robert King",

    location: "Bangalore",
    country: "India",
    employmentType: "Permanent",

    status: "Active",
    risk: "Medium",

    joiningDate: "2023-03-18",
    confirmationDate: "2023-09-18",

    gender: "Female",
    age: 27,

    salary: 92000,
    bonus: 12000,

    experience: 4,

    performanceScore: 88,
    engagementScore: 86,
    attendancePercentage: 96,

    trainingCompletion: 92,
    skillCoverage: 89,

    promotionCount: 1,

    project: "Payroll",

    createdAt: "2023-03-18",
    updatedAt: "2026-07-01",
  },
  {
    id: 3,
    employeeId: "EMP003",
    firstName: "David",
    lastName: "Miller",
    fullName: "David Miller",
    name: "David Miller",
    email: "david.miller@company.com",
    phone: "+91-9876500003",
    avatar: "",

    department: "HR",
    team: "Talent",
    role: "HR Manager",
    designation: "Manager",
    manager: "Linda White",

    location: "Chennai",
    country: "India",
    employmentType: "Permanent",

    status: "Active",
    risk: "Low",

    joiningDate: "2021-08-10",
    confirmationDate: "2022-02-10",

    gender: "Male",
    age: 36,

    salary: 76000,
    bonus: 15000,

    experience: 10,

    performanceScore: 95,
    engagementScore: 93,
    attendancePercentage: 99,

    trainingCompletion: 98,
    skillCoverage: 96,

    promotionCount: 3,

    project: "Recruitment",

    createdAt: "2021-08-10",
    updatedAt: "2026-07-01",
  },
  {
    id: 4,
    employeeId: "EMP004",
    firstName: "Emma",
    lastName: "Wilson",
    fullName: "Emma Wilson",
    name: "Emma Wilson",
    email: "emma.wilson@company.com",
    phone: "+91-9876500004",
    avatar: "",

    department: "Sales",
    team: "Enterprise",
    role: "Sales Executive",
    designation: "Executive",
    manager: "Chris Evans",

    location: "Hyderabad",
    country: "India",
    employmentType: "Permanent",

    status: "Notice Period",
    risk: "High",

    joiningDate: "2024-01-12",
    confirmationDate: "2024-07-12",

    gender: "Female",
    age: 29,

    salary: 62000,
    bonus: 8000,

    experience: 4,

    performanceScore: 71,
    engagementScore: 64,
    attendancePercentage: 90,

    trainingCompletion: 75,
    skillCoverage: 72,

    promotionCount: 0,

    project: "Retail Sales",

    createdAt: "2024-01-12",
    updatedAt: "2026-07-01",
  },
  {
    id: 5,
    employeeId: "EMP005",
    firstName: "Michael",
    lastName: "Brown",
    fullName: "Michael Brown",
    name: "Michael Brown",
    email: "michael.brown@company.com",
    phone: "+91-9876500005",
    avatar: "",

    department: "Finance",
    team: "Accounting",
    role: "Accountant",
    designation: "Senior Accountant",
    manager: "Grace Thomas",

    location: "Pune",
    country: "India",
    employmentType: "Permanent",

    status: "On Leave",
    risk: "Medium",

    joiningDate: "2022-09-04",
    confirmationDate: "2023-03-04",

    gender: "Male",
    age: 33,

    salary: 70000,
    bonus: 11000,

    experience: 8,

    performanceScore: 86,
    engagementScore: 84,
    attendancePercentage: 95,

    trainingCompletion: 91,
    skillCoverage: 88,

    promotionCount: 2,

    project: "Budget Planning",

    createdAt: "2022-09-04",
    updatedAt: "2026-07-01",
  },
  {
    id: 6,
    employeeId: "EMP006",
    firstName: "Sophia",
    lastName: "Davis",
    fullName: "Sophia Davis",
    name: "Sophia Davis",
    email: "sophia.davis@company.com",
    phone: "+91-9876500006",
    avatar: "",

    department: "Marketing",
    team: "Digital",
    role: "Marketing Specialist",
    designation: "Specialist",
    manager: "Nancy Cooper",

    location: "Bangalore",
    country: "India",
    employmentType: "Permanent",

    status: "Active",
    risk: "Low",

    joiningDate: "2023-06-14",
    confirmationDate: "2023-12-14",

    gender: "Female",
    age: 26,

    salary: 64000,
    bonus: 9000,

    experience: 3,

    performanceScore: 89,
    engagementScore: 91,
    attendancePercentage: 97,

    trainingCompletion: 94,
    skillCoverage: 90,

    promotionCount: 1,

    project: "Brand Campaign",

    createdAt: "2023-06-14",
    updatedAt: "2026-07-01",
  },
  {
    id: 7,
    employeeId: "EMP007",
    firstName: "James",
    lastName: "Taylor",
    fullName: "James Taylor",
    name: "James Taylor",
    email: "james.taylor@company.com",
    phone: "+91-9876500007",
    avatar: "",

    department: "Engineering",
    team: "DevOps",
    role: "DevOps Engineer",
    designation: "Lead Engineer",
    manager: "Robert King",

    location: "Hyderabad",
    country: "India",
    employmentType: "Permanent",

    status: "Active",
    risk: "Low",

    joiningDate: "2020-11-22",
    confirmationDate: "2021-05-22",

    gender: "Male",
    age: 35,

    salary: 105000,
    bonus: 18000,

    experience: 11,

    performanceScore: 96,
    engagementScore: 94,
    attendancePercentage: 99,

    trainingCompletion: 99,
    skillCoverage: 98,

    promotionCount: 4,

    project: "Cloud Migration",

    createdAt: "2020-11-22",
    updatedAt: "2026-07-01",
  },
  {
    id: 8,
    employeeId: "EMP008",
    firstName: "Olivia",
    lastName: "Anderson",
    fullName: "Olivia Anderson",
    name: "Olivia Anderson",
    email: "olivia.anderson@company.com",
    phone: "+91-9876500008",
    avatar: "",

    department: "Operations",
    team: "Business Operations",
    role: "Operations Manager",
    designation: "Manager",
    manager: "Daniel Scott",

    location: "Chennai",
    country: "India",
    employmentType: "Permanent",

    status: "Inactive",
    risk: "Critical",

    joiningDate: "2019-02-18",
    confirmationDate: "2019-08-18",

    gender: "Female",
    age: 38,

    salary: 98000,
    bonus: 17000,

    experience: 14,

    performanceScore: 69,
    engagementScore: 60,
    attendancePercentage: 82,

    trainingCompletion: 70,
    skillCoverage: 73,

    promotionCount: 3,

    project: "Operations Excellence",

    createdAt: "2019-02-18",
    updatedAt: "2026-07-01",
  },
];