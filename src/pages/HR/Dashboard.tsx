import React from 'react';
import { useAppSelector } from '../../redux/hooks';

import { selectRestrictedHROpenPositions, selectRestrictedHRLeaveRequests } from '../../redux/hrSlice';

export const HRDashboard: React.FC = () => {
  const openPositions = useAppSelector(selectRestrictedHROpenPositions) || [];
  const leaveRequests = useAppSelector(selectRestrictedHRLeaveRequests) || [];



  return (
    <div style={{ padding: '32px', backgroundColor: 'var(--bg)', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--text-h)', margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            HR Management Overview
          </h1>
          <p style={{ color: 'var(--text-light)', margin: '6px 0 0', fontSize: '15px' }}>
            Monitor key workforce metrics, active recruitment, and pending employee requests in real time.
          </p>
        </div>
        <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
          Live Analytics
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        
        {/* Card 1: Total Workforce */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'var(--text-h)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>Total Workforce</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '16px 0 8px' }}>
            10,000
          </div>
          <span style={{ fontSize: '12px', opacity: 0.85 }}>+2.4% vs last quarter</span>
        </div>

        {/* Card 2: New Onboarded */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          color: 'var(--text-h)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>New Onboarded (Q3)</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '16px 0 8px' }}>
            38
          </div>
          <span style={{ fontSize: '12px', opacity: 0.85 }}>Onboarding on schedule</span>
        </div>

        {/* Card 3: Open Positions */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          color: 'var(--text-h)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>Open Positions</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '16px 0 8px' }}>
            {openPositions.length}
          </div>
          <span style={{ fontSize: '12px', opacity: 0.85 }}>Active requisitions</span>
        </div>

        {/* Card 4: Monthly Attrition Rate */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          color: 'var(--text-h)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', opacity: 0.9 }}>Monthly Attrition Rate</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '16px 0 8px' }}>
            4.2%
          </div>
          <span style={{ fontSize: '12px', opacity: 0.85 }}>-0.5% lower than target</span>
        </div>

      </div>

      {/* Main Content Panels Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Left Panel: Active Job Requisitions */}
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-h)', margin: 0 }}>
              Active Requisitions
            </h2>
            <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}>View All</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {openPositions.map((pos) => {
              const posRecord = pos as unknown as Record<string, unknown>;
              const applicants = String(posRecord.applicantCount || posRecord.applicants || 0);
              const statusStr = String(posRecord.status || 'Open');

              return (
                <div key={pos.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg)', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-h)', fontSize: '15px' }}>{pos.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '2px' }}>{pos.department} • {applicants} Applicants</div>
                  </div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: statusStr === 'Open' ? '#dcfce7' : '#fef3c7',
                    color: statusStr === 'Open' ? '#15803d' : '#b45309'
                  }}>
                    {statusStr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Pending Leave Workflow */}
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-h)', margin: 0 }}>
              Pending Leave Requests
            </h2>
            <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}>Manage</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leaveRequests.map((req) => {
              const reqRecord = req as unknown as Record<string, unknown>;
              const empName = String(reqRecord.employeeName || reqRecord.name || 'Employee');
              const leaveType = String(reqRecord.type || reqRecord.leaveType || 'Leave');
              const statusStr = String(reqRecord.status || 'Pending');

              return (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg)', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-h)', fontSize: '15px' }}>{empName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '2px' }}>{leaveType}</div>
                  </div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: statusStr === 'Approved' ? '#e0f2fe' : '#fef3c7',
                    color: statusStr === 'Approved' ? '#0369a1' : '#b45309'
                  }}>
                    {statusStr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HRDashboard;