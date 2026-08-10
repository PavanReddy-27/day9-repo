import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  location: string;
  status: string;
  skills: string[];
  experienceYears: number;
  risk: string;
  hireDate: string;
}

export interface FilterState {
  search: string;
  departments: string[];
  roles: string[];
  locations: string[];
  statuses: string[];
  skills: string[];
  riskLevels: string[];
  startDate: string;
  endDate: string;
}

// Map departments to dependent roles and skills
export const DEPARTMENT_DEPENDENCIES: Record<string, { roles: string[]; skills: string[] }> = {
  Engineering: {
    roles: ['Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'QA Engineer'],
    skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'TypeScript'],
  },
  Design: {
    roles: ['UI/UX Designer', 'Product Designer', 'Graphic Designer'],
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
  },
  Analytics: {
    roles: ['Data Analyst', 'Data Scientist', 'BI Developer'],
    skills: ['Python', 'SQL', 'Tableau', 'Power BI', 'Machine Learning'],
  },
  Management: {
    roles: ['Team Lead', 'Project Manager', 'Product Owner'],
    skills: ['Agile', 'Scrum', 'Leadership', 'Risk Management'],
  },
};

// Generate 10,000 Mock Records efficiently
const generateMockEmployees = (count: number): Employee[] => {
  const depts = Object.keys(DEPARTMENT_DEPENDENCIES);
  const locations = ['India', 'USA', 'UK', 'Germany', 'Canada'];
  const statuses = ['Active', 'Inactive', 'On Leave'];
  const risks = ['Low', 'Medium', 'High'];
  const firstNames = ['Ravi', 'Sridhika', 'Pavan', 'Maheswari', 'Ananya', 'Vikram', 'Neha', 'Arjun'];
  const lastNames = ['Prasad', 'Kumar', 'Reddy', 'Sharma', 'Verma', 'Patel', 'Nair'];

  const employees: Employee[] = [];
  for (let i = 1; i <= count; i++) {
    const dept = depts[i % depts.length];
    const deptData = DEPARTMENT_DEPENDENCIES[dept];
    const role = deptData.roles[i % deptData.roles.length];
    const skill = deptData.skills[i % deptData.skills.length];

    employees.push({
      id: `EMP-${String(i).padStart(5, '0')}`,
      name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
      email: `emp${i}@company.com`,
      department: dept,
      role: role,
      location: locations[i % locations.length],
      status: statuses[i % statuses.length],
      skills: [skill],
      experienceYears: (i % 15) + 1,
      risk: risks[i % risks.length],
      hireDate: new Date(2020, (i % 12), (i % 28) + 1).toISOString().split('T')[0],
    });
  }
  return employees;
};

const initialEmployees = generateMockEmployees(10000);

const initialFilters: FilterState = {
  search: '',
  departments: [],
  roles: [],
  locations: [],
  statuses: [],
  skills: [],
  riskLevels: [],
  startDate: '',
  endDate: '',
};

export interface DashboardState {
  employees: Employee[];
  filters: FilterState;
  filteredEmployees: Employee[];
}

const initialState: DashboardState = {
  employees: initialEmployees,
  filters: initialFilters,
  filteredEmployees: initialEmployees,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };

      const { search, departments, roles, locations, statuses, skills, riskLevels, startDate, endDate } = state.filters;
      const searchLower = search.toLowerCase().trim();

      state.filteredEmployees = state.employees.filter((emp) => {
        // Search by Employee Name or Employee ID
        const matchesSearch =
          !searchLower ||
          emp.name.toLowerCase().includes(searchLower) ||
          emp.id.toLowerCase().includes(searchLower);

        // Multi-select Filters
        const matchesDept = departments.length === 0 || departments.includes(emp.department);
        const matchesRole = roles.length === 0 || roles.includes(emp.role);
        const matchesLocation = locations.length === 0 || locations.includes(emp.location);
        const matchesStatus = statuses.length === 0 || statuses.includes(emp.status);
        const matchesRisk = riskLevels.length === 0 || riskLevels.includes(emp.risk);
        const matchesSkill = skills.length === 0 || emp.skills.some((s) => skills.includes(s));

        // Date Range Filter
        const matchesStartDate = !startDate || emp.hireDate >= startDate;
        const matchesEndDate = !endDate || emp.hireDate <= endDate;

        return (
          matchesSearch &&
          matchesDept &&
          matchesRole &&
          matchesLocation &&
          matchesStatus &&
          matchesRisk &&
          matchesSkill &&
          matchesStartDate &&
          matchesEndDate
        );
      });
    },
    resetFilters: (state) => {
      state.filters = initialFilters;
      state.filteredEmployees = state.employees;
    },
  },
});

export const { setFilter, resetFilters } = dashboardSlice.actions;

export const selectRestrictedDashboardEmployees = (state: RootState) => {
  const { filteredEmployees } = state.dashboard;
  const { user } = state.auth;

  if (!user) return [];
  // Admin and HR can see all departments in the dashboard
  if (user.role === 'Admin' || user.role === 'HR') return filteredEmployees;
  // Managers can only see their own department's employees
  if (user.role === 'Manager') {
    return filteredEmployees.filter((emp) => emp.department === user.department);
  }
  return [];
};

export default dashboardSlice.reducer;