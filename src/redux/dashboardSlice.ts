import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { apiClient } from '../services/apiClient';

export interface Employee {
  _id: string; // MongoDB ObjectId
  employeeId: string;
  name?: string; // Add if backend supports it, but fallback to fullName
  fullName: string;
  email: string;
  department: { name: string, code: string } | string;
  role: string;
  location: { name: string, code: string } | string;
  status: string;
  skills?: string[];
  experience?: number;
  risk: string;
  joiningDate: string;
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
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  employees: [],
  filters: initialFilters,
  filteredEmployees: [],
  isLoading: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk(
  'dashboard/fetchEmployees',
  async () => {
    return await apiClient<Employee[]>('/employees');
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = { ...state.filters, ...action.payload };

      const { search, departments, roles, locations, statuses, skills, riskLevels, startDate, endDate } = state.filters;
      const searchLower = search.toLowerCase().trim();

      state.filteredEmployees = state.employees.filter((emp) => {
        const empName = emp.fullName || emp.name || '';
        // Search by Employee Name or Employee ID
        const matchesSearch =
          !searchLower ||
          empName.toLowerCase().includes(searchLower) ||
          emp.employeeId.toLowerCase().includes(searchLower);

        // Normalize department and location (can be populated objects or strings)
        const empDept = typeof emp.department === 'object' ? emp.department.name : emp.department;
        const empLoc = typeof emp.location === 'object' ? emp.location.name : emp.location;

        // Multi-select Filters
        const matchesDept = departments.length === 0 || (empDept && departments.includes(empDept));
        const matchesRole = roles.length === 0 || roles.includes(emp.role);
        const matchesLocation = locations.length === 0 || (empLoc && locations.includes(empLoc));
        const matchesStatus = statuses.length === 0 || statuses.includes(emp.status);
        const matchesRisk = riskLevels.length === 0 || riskLevels.includes(emp.risk);
        const matchesSkill = skills.length === 0 || (emp.skills && emp.skills.some((s) => skills.includes(s)));

        // Date Range Filter
        const matchesStartDate = !startDate || emp.joiningDate >= startDate;
        const matchesEndDate = !endDate || emp.joiningDate <= endDate;

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload || [];
        // Re-apply filters
        dashboardSlice.caseReducers.setFilter(state, { payload: {} } as any);
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      });
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
    return filteredEmployees.filter((emp) => {
      const empDept = typeof emp.department === 'object' ? emp.department.name : emp.department;
      return empDept === user.department;
    });
  }
  return [];
};

export default dashboardSlice.reducer;