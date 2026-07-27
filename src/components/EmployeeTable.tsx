import React, { useState } from 'react';

// Sample workforce dataset
const initialEmployees = [
  { id: '1', name: 'Ravi Prasad', email: 'ravi@gmail.com', department: 'Engineering', role: 'Developer', location: 'India', status: 'Active', risk: 'Low' },
  { id: '2', name: 'Sridhika', email: 'sridhika@gmail.com', department: 'Design', role: 'UI/UX Lead', location: 'India', status: 'Active', risk: 'Low' },
  { id: '3', name: 'Pavan Kumar', email: 'pavan@gmail.com', department: 'Analytics', role: 'Data Analyst', location: 'USA', status: 'Active', risk: 'Medium' },
  { id: '4', name: 'Maheswari', email: 'maheswari@gmail.com', department: 'Management', role: 'Team Lead', location: 'India', status: 'Active', risk: 'High' },
];

export const EmployeeTable = () => {
  // All Filter States
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [role, setRole] = useState('All');
  const [location, setLocation] = useState('All');
  const [status, setStatus] = useState('All');
  const [risk, setRisk] = useState('All');

  // Sorting State
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter Logic
  const filteredEmployees = initialEmployees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = department === 'All' || emp.department === department;
    const matchesRole = role === 'All' || emp.role === role;
    const matchesLocation = location === 'All' || emp.location === location;
    const matchesStatus = status === 'All' || emp.status === status;
    const matchesRisk = risk === 'All' || emp.risk === risk;

    return matchesSearch && matchesDept && matchesRole && matchesLocation && matchesStatus && matchesRisk;
  });

  // Sort Logic
  const sortedEmployees = [...filteredEmployees].sort((a: any, b: any) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // CSV Export Logic
  const handleExportCSV = () => {
    if (sortedEmployees.length === 0) {
      alert('No data available to export');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Department', 'Role', 'Location', 'Status', 'Risk'];
    const rows = sortedEmployees.map((emp) => [
      emp.id, emp.name, emp.email, emp.department, emp.role, emp.location, emp.status, emp.risk
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'employee_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper functions for dynamic badge colors
  const getStatusBadge = (status: string) => {
    const isActive = status === 'Active';
    return (
      <span style={{
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        backgroundColor: isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        color: isActive ? '#4ade80' : '#f87171',
        border: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        display: 'inline-block'
      }}>
        ● {status}
      </span>
    );
  };

  const getRiskBadge = (risk: string) => {
    let bg = 'rgba(34, 197, 94, 0.15)';
    let text = '#4ade80';
    let border = 'rgba(34, 197, 94, 0.3)';

    if (risk === 'Medium') { 
      bg = 'rgba(234, 179, 8, 0.15)'; 
      text = '#facc15'; 
      border = 'rgba(234, 179, 8, 0.3)';
    }
    if (risk === 'High') { 
      bg = 'rgba(239, 68, 68, 0.15)'; 
      text = '#f87171'; 
      border = 'rgba(239, 68, 68, 0.3)';
    }

    return (
      <span style={{
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        display: 'inline-block'
      }}>
        {risk}
      </span>
    );
  };

  // Common styling for dark control inputs
  const controlStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    outline: 'none',
    cursor: 'pointer'
  };

  return (
    <div style={{ 
      padding: '30px', 
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      color: '#f8fafc',
      margin: '20px auto',
      maxWidth: '1200px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', color: '#f8fafc', margin: 0, fontWeight: '700' }}>
          👥 Workforce Directory
        </h2>
        <button 
          onClick={handleExportCSV} 
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#3b82f6', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          📥 Export CSV
        </button>
      </div>

      {/* Filter Bar Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...controlStyle, flexGrow: 1, minWidth: '220px' }}
        />

        <select value={department} onChange={(e) => setDepartment(e.target.value)} style={controlStyle}>
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Design">Design</option>
          <option value="Analytics">Analytics</option>
          <option value="Management">Management</option>
        </select>

        <select value={role} onChange={(e) => setRole(e.target.value)} style={controlStyle}>
          <option value="All">All Roles</option>
          <option value="Developer">Developer</option>
          <option value="UI/UX Lead">UI/UX Lead</option>
          <option value="Data Analyst">Data Analyst</option>
          <option value="Team Lead">Team Lead</option>
        </select>

        <select value={location} onChange={(e) => setLocation(e.target.value)} style={controlStyle}>
          <option value="All">All Locations</option>
          <option value="India">India</option>
          <option value="USA">USA</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={controlStyle}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select value={risk} onChange={(e) => setRisk(e.target.value)} style={controlStyle}>
          <option value="All">All Risk Levels</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Employee Data Table */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #334155' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#1e293b' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '15px', borderBottom: '1px solid #334155' }}>
              <th onClick={() => handleSort('name')} style={{ padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}>
                Name {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('department')} style={{ padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}>
                Department {sortField === 'department' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('role')} style={{ padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}>
                Role {sortField === 'role' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('location')} style={{ padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}>
                Location {sortField === 'location' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('status')} style={{ padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}>
                Status {sortField === 'status' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('risk')} style={{ padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}>
                Risk {sortField === 'risk' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.length > 0 ? (
              sortedEmployees.map((emp, idx) => (
                <tr key={emp.id} style={{ 
                  backgroundColor: idx % 2 === 0 ? '#1e293b' : '#0f172a',
                  borderBottom: '1px solid #334155',
                  fontSize: '16px'
                }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '17px' }}>{emp.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '2px' }}>{emp.email}</div>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#cbd5e1', fontWeight: '500' }}>{emp.department}</td>
                  <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>{emp.role}</td>
                  <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>📍 {emp.location}</td>
                  <td style={{ padding: '16px 20px' }}>{getStatusBadge(emp.status)}</td>
                  <td style={{ padding: '16px 20px' }}>{getRiskBadge(emp.risk)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '18px' }}>
                  No employees found matching selected filters.
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