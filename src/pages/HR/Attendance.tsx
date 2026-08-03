import React, { useState } from 'react';

interface AttendanceRecord {
  id: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day';
}

export const HRAttendance: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');

  const attendanceData: AttendanceRecord[] = [
    { id: '1', employeeName: 'Alex Rivera', department: 'Engineering', date: '2026-07-31', checkIn: '09:00 AM', checkOut: '05:30 PM', status: 'Present' },
    { id: '2', employeeName: 'Priya Sharma', department: 'Analytics', date: '2026-07-31', checkIn: '09:42 AM', checkOut: '06:00 PM', status: 'Late' },
    { id: '3', employeeName: 'David Kim', department: 'Human Resources', date: '2026-07-31', checkIn: '-', checkOut: '-', status: 'Absent' },
    { id: '4', employeeName: 'Maria Garcia', department: 'Marketing', date: '2026-07-31', checkIn: '09:05 AM', checkOut: '01:30 PM', status: 'Half Day' },
  ];

  const filteredData = filter === 'All' ? attendanceData : attendanceData.filter((rec) => rec.status === filter);

  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '28px', fontWeight: '800' }}>⏰ Workforce Attendance</h1>
        <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: '15px' }}>Monitor daily check-ins, tardiness, and absence trends across departments.</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['All', 'Present', 'Late', 'Absent', 'Half Day'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: filter === status ? '#3b82f6' : '#e2e8f0',
              color: filter === status ? '#ffffff' : '#334155',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
              <th style={{ padding: '12px' }}>Employee</th>
              <th style={{ padding: '12px' }}>Department</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Check In</th>
              <th style={{ padding: '12px' }}>Check Out</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#1e293b' }}>
                <td style={{ padding: '14px', fontWeight: '600' }}>{row.employeeName}</td>
                <td style={{ padding: '14px' }}>{row.department}</td>
                <td style={{ padding: '14px' }}>{row.date}</td>
                <td style={{ padding: '14px' }}>{row.checkIn}</td>
                <td style={{ padding: '14px' }}>{row.checkOut}</td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: row.status === 'Present' ? '#dcfce7' : row.status === 'Late' ? '#fef3c7' : row.status === 'Absent' ? '#fee2e2' : '#e0f2fe',
                    color: row.status === 'Present' ? '#15803d' : row.status === 'Late' ? '#b45309' : row.status === 'Absent' ? '#b91c1c' : '#0369a1',
                  }}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRAttendance;