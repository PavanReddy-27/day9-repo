import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  DEPARTMENT_DEPENDENCIES,
  resetFilters,
  setFilter,
} from "../redux/dashboardSlice";
import type { RootState } from "../redux/store";

export const EmployeeTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filteredEmployees, filters } = useAppSelector(
    (state: RootState) => state.dashboard
  );

  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      dispatch(setFilter({ search: searchInput }));
    }, 300);

    return () => window.clearTimeout(handler);
  }, [searchInput, dispatch]);

  const availableOptions = useMemo(() => {
    if (filters.departments.length === 0) {
      const allRoles = Object.values(DEPARTMENT_DEPENDENCIES).flatMap(
        (department) => department.roles
      );
      const allSkills = Object.values(DEPARTMENT_DEPENDENCIES).flatMap(
        (department) => department.skills
      );

      return {
        roles: Array.from(new Set(allRoles)),
        skills: Array.from(new Set(allSkills)),
      };
    }

    const roles = filters.departments.flatMap(
      (department) => DEPARTMENT_DEPENDENCIES[department]?.roles ?? []
    );
    const skills = filters.departments.flatMap(
      (department) => DEPARTMENT_DEPENDENCIES[department]?.skills ?? []
    );

    return {
      roles: Array.from(new Set(roles)),
      skills: Array.from(new Set(skills)),
    };
  }, [filters.departments]);

  const handleMultiSelectChange = (
    key: keyof typeof filters,
    value: string
  ) => {
    const currentValues = (filters[key] as string[]) || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    dispatch(setFilter({ [key]: updatedValues }));
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text-h)",
        padding: "24px",
        borderRadius: "12px",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ color: "#38bdf8", marginTop: 0 }}>
        👥 Workforce Directory (10k Dataset)
      </h2>

      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="🔍 Search by Employee Name or ID (e.g. EMP-00042)..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            backgroundColor: "var(--surface)",
            color: "var(--text-h)",
            border: "1px solid #334155",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label style={{ fontSize: "12px", color: "var(--text-light)" }}>
            Departments
          </label>
          <div
            style={{
              maxHeight: "100px",
              overflowY: "auto",
              backgroundColor: "var(--surface)",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #334155",
            }}
          >
            {Object.keys(DEPARTMENT_DEPENDENCIES).map((department) => (
              <label
                key={department}
                style={{
                  display: "block",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.departments.includes(department)}
                  onChange={() =>
                    handleMultiSelectChange("departments", department)
                  }
                />{" "}
                {department}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-light)" }}>
            Roles (Dependent)
          </label>
          <div
            style={{
              maxHeight: "100px",
              overflowY: "auto",
              backgroundColor: "var(--surface)",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #334155",
            }}
          >
            {availableOptions.roles.map((role) => (
              <label
                key={role}
                style={{
                  display: "block",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.roles.includes(role)}
                  onChange={() => handleMultiSelectChange("roles", role)}
                />{" "}
                {role}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-light)" }}>
            Skills (Dependent)
          </label>
          <div
            style={{
              maxHeight: "100px",
              overflowY: "auto",
              backgroundColor: "var(--surface)",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #334155",
            }}
          >
            {availableOptions.skills.map((skill) => (
              <label
                key={skill}
                style={{
                  display: "block",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.skills.includes(skill)}
                  onChange={() => handleMultiSelectChange("skills", skill)}
                />{" "}
                {skill}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: "12px", color: "var(--text-light)" }}>
            Hire Date Range
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) =>
                dispatch(setFilter({ startDate: event.target.value }))
              }
              style={{
                padding: "6px",
                backgroundColor: "var(--surface)",
                color: "var(--text-h)",
                border: "1px solid #334155",
                borderRadius: "4px",
              }}
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) =>
                dispatch(setFilter({ endDate: event.target.value }))
              }
              style={{
                padding: "6px",
                backgroundColor: "var(--surface)",
                color: "var(--text-h)",
                border: "1px solid #334155",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          marginBottom: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "14px", color: "var(--text-light)" }}>
          Showing <strong>{filteredEmployees.length.toLocaleString()}</strong> of
          10,000 records
        </span>
        <button
          onClick={() => {
            setSearchInput("");
            dispatch(resetFilters());
          }}
          style={{
            padding: "6px 12px",
            backgroundColor: "#ef4444",
            color: "var(--text-h)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset All Filters
        </button>
      </div>

      <div
        style={{
          overflowX: "auto",
          borderRadius: "8px",
          border: "1px solid #334155",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "var(--surface)", color: "var(--text-light)" }}>
              <th style={{ padding: "12px" }}>Emp ID</th>
              <th style={{ padding: "12px" }}>Name</th>
              <th style={{ padding: "12px" }}>Department</th>
              <th style={{ padding: "12px" }}>Role</th>
              <th style={{ padding: "12px" }}>Skills</th>
              <th style={{ padding: "12px" }}>Location</th>
              <th style={{ padding: "12px" }}>Hire Date</th>
              <th style={{ padding: "12px" }}>Risk Level</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.slice(0, 50).map((employee) => (
              <tr key={employee.id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "12px", fontWeight: "bold", color: "#38bdf8" }}>
                  {employee.id}
                </td>
                <td style={{ padding: "12px" }}>{employee.name}</td>
                <td style={{ padding: "12px" }}>{employee.department}</td>
                <td style={{ padding: "12px" }}>{employee.role}</td>
                <td style={{ padding: "12px" }}>{employee.skills.join(", ")}</td>
                <td style={{ padding: "12px" }}>{employee.location}</td>
                <td style={{ padding: "12px" }}>{employee.hireDate}</td>
                <td style={{ padding: "12px" }}>{employee.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length > 50 && (
          <div
            style={{
              padding: "10px",
              textAlign: "center",
              color: "var(--text-light)",
              fontSize: "13px",
            }}
          >
            Showing top 50 records for optimal UI rendering performance.
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTable;
