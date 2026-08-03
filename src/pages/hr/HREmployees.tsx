import React from 'react';
import { useAppSelector } from '../../redux/hooks';
import type { RootState } from '../../redux/store';

export const HREmployees: React.FC = () => {
  const filteredEmployees = useAppSelector(
    (state: RootState) => state.dashboard?.filteredEmployees
  ) || [];

  const handleExportCSV = () => {
    if (filteredEmployees.length === 0) return;

    const firstEmp = filteredEmployees[0] as unknown as Record<string, unknown>;
    const headers = Object.keys(firstEmp).join(',');

    const rows = filteredEmployees.map((emp) => {
      const record = emp as unknown as Record<string, unknown>;
      return Object.values(record)
        .map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`)
        .join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'employee_data_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#38bdf8', margin: 0 }}>👥 Employee Directory & Analytics</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Manage, filter, and export organization workforce records.</p>
        </div>
        <button
          onClick={handleExportCSV}
          style={{
            backgroundColor: '#22c55e',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          📥 Export Filtered Data (CSV)
        </button>
      </div>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '16px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #334155' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Department</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.slice(0, 15).map((emp, index) => {
              const record = emp as unknown as Record<string, unknown>;
              return (
                <tr key={String(record.id || record.employeeId || index)} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>{String(record.id || record.employeeId || index + 1)}</td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{String(record.fullName || record.name || record.firstName || 'N/A')}</td>
                  <td style={{ padding: '12px' }}>{String(record.department || 'General')}</td>
                  <td style={{ padding: '12px' }}>{String(record.role || record.jobTitle || 'Staff')}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: '#166534',
                        color: '#4ade80',
                      }}
                    >
                      Active
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HREmployees;