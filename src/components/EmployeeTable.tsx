import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setFilter, resetFilters, DEPARTMENT_DEPENDENCIES, type Employee } from '../redux/dashboardSlice';
import type { RootState } from '../redux/store';

export const EmployeeTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filteredEmployees, filters } = useAppSelector((state: RootState) => state.dashboard);

  // Local state for search debouncing (300ms)
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce effect (300ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setFilter({ search: searchInput }));
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, dispatch]);

  // Compute dependent roles & skills based on selected departments
  const availableOptions = useMemo(() => {
    if (filters.departments.length === 0) {
      const allRoles = Object.values(DEPARTMENT_DEPENDENCIES).flatMap((d) => d.roles);
      const allSkills = Object.values(DEPARTMENT_DEPENDENCIES).flatMap((d) => d.skills);
      return {
        roles: Array.from(new Set(allRoles)),
        skills: Array.from(new Set(allSkills)),
      };
    }

    const roles = filters.departments.flatMap((dept) => DEPARTMENT_DEPENDENCIES[dept]?.roles || []);
    const skills = filters.departments.flatMap((dept) => DEPARTMENT_DEPENDENCIES[dept]?.skills || []);

    return {
      roles: Array.from(new Set(roles)),
      skills: Array.from(new Set(skills)),
    };
  }, [filters.departments]);

  // Multi-select toggle helper
  const handleMultiSelectChange = (key: keyof typeof filters, value: string) => {
    const currentValues = (filters[key] as string[]) || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    dispatch(setFilter({ [key]: updatedValues }));
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '24px', borderRadius: '12px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#38bdf8', marginTop: 0 }}>👥 Workforce Directory (10k Dataset)</h2>

      {/* 300ms Debounced Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="🔍 Search by Employee Name or ID (e.g. EMP-00042)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155' }}
        />
      </div>

      {/* Filter Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        
        {/* Multi-select Department */}
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>Departments</label>
          <div style={{ maxHeight: '100px', overflowY: 'auto', backgroundColor: '#1e293b', padding: '8px', borderRadius: '6px', border: '1px solid #334155' }}>
            {Object.keys(DEPARTMENT_DEPENDENCIES).map((dept) => (
              <label key={dept} style={{ display: 'block', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.departments.includes(dept)}
                  onChange={() => handleMultiSelectChange('departments', dept)}
                />{' '}
                {dept}
              </label>
            ))}
          </div>
        </div>

        {/* Dependent Multi-select Roles */}
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>Roles (Dependent)</label>
          <div style={{ maxHeight: '100px', overflowY: 'auto', backgroundColor: '#1e293b', padding: '8px', borderRadius: '6px', border: '1px solid #334155' }}>
            {availableOptions.roles.map((role) => (
              <label key={role} style={{ display: 'block', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.roles.includes(role)}
                  onChange={() => handleMultiSelectChange('roles', role)}
                />{' '}
                {role}
              </label>
            ))}
          </div>
        </div>

        {/* Dependent Multi-select Skills */}
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>Skills (Dependent)</label>
          <div style={{ maxHeight: '100px', overflowY: 'auto', backgroundColor: '#1e293b', padding: '8px', borderRadius: '6px', border: '1px solid #334155' }}>
            {availableOptions.skills.map((skill) => (
              <label key={skill} style={{ display: 'block', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.skills.includes(skill)}
                  onChange={() => handleMultiSelectChange('skills', skill)}
                />{' '}
                {skill}
              </label>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8' }}>Hire Date Range</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => dispatch(setFilter({ startDate: e.target.value }))}
              style={{ padding: '6px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => dispatch(setFilter({ endDate: e.target.value }))}
              style={{ padding: '6px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>
          Showing <strong>{filteredEmployees.length.toLocaleString()}</strong> of 10,000 records
        </span>
        <button
          onClick={() => {
            setSearchInput('');
            dispatch(resetFilters());
          }}
          style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Reset All Filters
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #334155' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '12px' }}>Emp ID</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Department</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px' }}>Skills</th>
              <th style={{ padding: '12px' }}>Location</th>
              <th style={{ padding: '12px' }}>Hire Date</th>
              <th style={{ padding: '12px' }}>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.slice(0, 50).map((emp) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#38bdf8' }}>{emp.id}</td>
                <td style={{ padding: '12px' }}>{emp.name}</td>
                <td style={{ padding: '12px' }}>{emp.department}</td>
                <td style={{ padding: '12px' }}>{emp.role}</td>
                <td style={{ padding: '12px' }}>{emp.skills.join(', ')}</td>
                <td style={{ padding: '12px' }}>{emp.location}</td>
                <td style={{ padding: '12px' }}>{emp.hireDate}</td>
                <td style={{ padding: '12px' }}>{emp.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEmployees.length > 50 && (
          <div style={{ padding: '10px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            Showing top 50 records for optimal UI rendering performance.
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTable;