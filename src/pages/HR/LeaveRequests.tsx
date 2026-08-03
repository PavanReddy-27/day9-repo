import React, { useState } from 'react';

interface LeaveRequestItem {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const HRLeave: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequestItem[]>([
    { id: '101', employeeName: 'Alex Rivera', type: 'Annual Leave', startDate: '2026-08-05', endDate: '2026-08-08', reason: 'Family Vacation', status: 'Pending' },
    { id: '102', employeeName: 'Priya Sharma', type: 'Sick Leave', startDate: '2026-07-30', endDate: '2026-07-31', reason: 'Medical Recovery', status: 'Approved' },
    { id: '103', employeeName: 'David Kim', type: 'Casual Leave', startDate: '2026-08-01', endDate: '2026-08-01', reason: 'Personal errands', status: 'Pending' },
  ]);

  const handleAction = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req)));
  };

  return (
    <div style={{ padding: '32px', backgroundColor: 'var(--bg)', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--text-h)', margin: 0, fontSize: '28px', fontWeight: '800' }}>🌴 Leave Workflow & Approvals</h1>
        <p style={{ color: 'var(--text-light)', margin: '6px 0 0', fontSize: '15px' }}>Review and manage leave applications submitted across the organization.</p>
      </div>

      <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-light)', fontSize: '14px' }}>
              <th style={{ padding: '12px' }}>Employee</th>
              <th style={{ padding: '12px' }}>Leave Type</th>
              <th style={{ padding: '12px' }}>Duration</th>
              <th style={{ padding: '12px' }}>Reason</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: 'var(--text-h)' }}>
                <td style={{ padding: '14px', fontWeight: '600' }}>{item.employeeName}</td>
                <td style={{ padding: '14px' }}>{item.type}</td>
                <td style={{ padding: '14px' }}>{item.startDate} to {item.endDate}</td>
                <td style={{ padding: '14px' }}>{item.reason}</td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: item.status === 'Approved' ? '#dcfce7' : item.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                    color: item.status === 'Approved' ? '#15803d' : item.status === 'Rejected' ? '#b91c1c' : '#b45309',
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '14px' }}>
                  {item.status === 'Pending' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleAction(item.id, 'Approved')}
                        style={{ backgroundColor: '#10b981', color: 'var(--text-h)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'Rejected')}
                        style={{ backgroundColor: '#ef4444', color: 'var(--text-h)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRLeave;