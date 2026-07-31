import React, { useEffect, useState } from "react";

// Sample workforce dataset
const initialEmployees = [
  {
    id: "1",
    name: "Ravi Prasad",
    email: "ravi@gmail.com",
    department: "Engineering",
    role: "Developer",
    location: "India",
    status: "Active",
    risk: "Low",
  },
  {
    id: "2",
    name: "Sridhika",
    email: "sridhika@gmail.com",
    department: "Design",
    role: "UI/UX Lead",
    location: "India",
    status: "Active",
    risk: "Low",
  },
  {
    id: "3",
    name: "Pavan Kumar",
    email: "pavan@gmail.com",
    department: "Analytics",
    role: "Data Analyst",
    location: "USA",
    status: "Active",
    risk: "Medium",
  },
  {
    id: "4",
    name: "Maheswari",
    email: "maheswari@gmail.com",
    department: "Management",
    role: "Team Lead",
    location: "India",
    status: "Active",
    risk: "High",
  },
];

export const EmployeeTable = () => {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [role, setRole] = useState("All");
  const [location, setLocation] = useState("All");
  const [status, setStatus] = useState("All");
  const [risk, setRisk] = useState("All");

  // Mobile Filter
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sorting
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filtering
  const filteredEmployees = initialEmployees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    return (
      matchesSearch &&
      (department === "All" || emp.department === department) &&
      (role === "All" || emp.role === role) &&
      (location === "All" || emp.location === location) &&
      (status === "All" || emp.status === status) &&
      (risk === "All" || emp.risk === risk)
    );
  });

  // Sorting
  const sortedEmployees = [...filteredEmployees].sort((a: any, b: any) => {
    if (a[sortField] < b[sortField])
      return sortDirection === "asc" ? -1 : 1;

    if (a[sortField] > b[sortField])
      return sortDirection === "asc" ? 1 : -1;

    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (sortedEmployees.length === 0) {
      alert("No data available");
      return;
    }

    const headers = [
      "ID",
      "Name",
      "Email",
      "Department",
      "Role",
      "Location",
      "Status",
      "Risk",
    ];

    const rows = sortedEmployees.map((emp) => [
      emp.id,
      emp.name,
      emp.email,
      emp.department,
      emp.role,
      emp.location,
      emp.status,
      emp.risk,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "employee_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const controlStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--surface-solid)",
    color: "var(--text)",
    fontSize: "16px",
    width: isMobile ? "100%" : undefined,
  };

  const getStatusBadge = (status: string) => (
    <span
      style={{
        padding: "6px 14px",
        borderRadius: "20px",
        background:
          status === "Active"
            ? "rgba(34,197,94,.15)"
            : "rgba(239,68,68,.15)",
        color: status === "Active" ? "#4ade80" : "#f87171",
        fontWeight: 600,
      }}
    >
      ● {status}
    </span>
  );

  const getRiskBadge = (risk: string) => {
    let color = "#4ade80";
    let bg = "rgba(34,197,94,.15)";

    if (risk === "Medium") {
      color = "#facc15";
      bg = "rgba(234,179,8,.15)";
    }

    if (risk === "High") {
      color = "#f87171";
      bg = "rgba(239,68,68,.15)";
    }

    return (
      <span
        style={{
          padding: "6px 14px",
          borderRadius: "20px",
          background: bg,
          color,
          fontWeight: 600,
        }}
      >
        {risk}
      </span>
    );
  };

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 1200,
        margin: "20px auto",
        background: "var(--surface)",
        borderRadius: 16,
      }}
    >
            <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: isMobile ? "22px" : "28px",
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          👥 Workforce Directory
        </h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {isMobile && (
            <button
              onClick={() =>
                setShowMobileFilters(!showMobileFilters)
              }
              style={{
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                background: "var(--primary)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {showMobileFilters
                ? "✖ Close Filters"
                : "☰ Filters"}
            </button>
          )}

          <button
            onClick={handleExportCSV}
            style={{
              padding: "12px 22px",
              border: "none",
              borderRadius: "8px",
              background: "var(--primary)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}

      <div
        style={{
          display:
            !isMobile || showMobileFilters
              ? "flex"
              : "none",
          flexDirection: isMobile ? "column" : "row",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "28px",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...controlStyle,
            flex: isMobile ? undefined : 1,
            minWidth: isMobile ? "100%" : "220px",
          }}
        />

        <select
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
          style={controlStyle}
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Design">Design</option>
          <option value="Analytics">Analytics</option>
          <option value="Management">Management</option>
        </select>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={controlStyle}
        >
          <option value="All">All Roles</option>
          <option value="Developer">Developer</option>
          <option value="UI/UX Lead">UI/UX Lead</option>
          <option value="Data Analyst">Data Analyst</option>
          <option value="Team Lead">Team Lead</option>
        </select>

        <select
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
          style={controlStyle}
        >
          <option value="All">All Locations</option>
          <option value="India">India</option>
          <option value="USA">USA</option>
        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          style={controlStyle}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value)}
          style={controlStyle}
        >
          <option value="All">All Risk Levels</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
            {/* Employee Table */}

            <div
        style={{
          overflowX: "auto",
          borderRadius: "12px",
          border: "1px solid var(--border)",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: "850px",
            borderCollapse: "collapse",
            background: "var(--surface-solid)",
          }}
        >
          <thead>
            <tr
              style={{
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <th
                style={{ padding: 16, cursor: "pointer" }}
                onClick={() => handleSort("name")}
              >
                Name{" "}
                {sortField === "name"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>

              <th
                style={{ padding: 16, cursor: "pointer" }}
                onClick={() => handleSort("department")}
              >
                Department{" "}
                {sortField === "department"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>

              <th
                style={{ padding: 16, cursor: "pointer" }}
                onClick={() => handleSort("role")}
              >
                Role{" "}
                {sortField === "role"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>

              <th
                style={{ padding: 16, cursor: "pointer" }}
                onClick={() => handleSort("location")}
              >
                Location{" "}
                {sortField === "location"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>

              <th
                style={{ padding: 16, cursor: "pointer" }}
                onClick={() => handleSort("status")}
              >
                Status{" "}
                {sortField === "status"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>

              <th
                style={{ padding: 16, cursor: "pointer" }}
                onClick={() => handleSort("risk")}
              >
                Risk{" "}
                {sortField === "risk"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedEmployees.length > 0 ? (
              sortedEmployees.map((emp, index) => (
                <tr
                  key={emp.id}
                  style={{
                    background:
                      index % 2 === 0
                        ? "var(--surface-solid)"
                        : "var(--surface)",
                    borderBottom:
                      "1px solid var(--border)",
                  }}
                >
                  <td style={{ padding: 16 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {emp.name}
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--text-light)",
                        marginTop: 4,
                      }}
                    >
                      {emp.email}
                    </div>
                  </td>

                  <td style={{ padding: 16 }}>
                    {emp.department}
                  </td>

                  <td style={{ padding: 16 }}>
                    {emp.role}
                  </td>

                  <td style={{ padding: 16 }}>
                    📍 {emp.location}
                  </td>

                  <td style={{ padding: 16 }}>
                    {getStatusBadge(emp.status)}
                  </td>

                  <td style={{ padding: 16 }}>
                    {getRiskBadge(emp.risk)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "var(--text-light)",
                    fontSize: 18,
                  }}
                >
                  No employees found matching the selected
                  filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;