import React, { useMemo } from 'react';
import { useAppSelector } from '../../redux/hooks';

import { selectRestrictedHROpenPositions, selectRestrictedHRLeaveRequests } from '../../redux/hrSlice';
import KPICards from '../../features/kpi/components/KPICards';

export const HRDashboard: React.FC = () => {
  const openPositions = useAppSelector(selectRestrictedHROpenPositions) || [];
  const leaveRequests = useAppSelector(selectRestrictedHRLeaveRequests) || [];
  
  const totalOnboarded = useAppSelector((state) => state.hr.totalOnboarded) || 38;
  const attritionRate = useAppSelector((state) => state.hr.attritionRate) || 4.2;
  const employees = useAppSelector((state) => state.dashboard.employees) || [];
  const totalWorkforce = useMemo(() => employees.filter(e => e.role === 'Employee').length, [employees]);

  return (
    <div style={{ padding: '32px', backgroundColor: 'var(--bg)', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: 'var(--text-h)', margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            HR Management Overview
          </h1>
          <p style={{ color: 'var(--text-light)', margin: '6px 0 0', fontSize: '15px' }}>
            Monitor key workforce metrics, active recruitment, and pending employee requests in real time.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ marginBottom: '36px' }}>
        <KPICards data={[
          {
            id: 'totalEmployees',
            title: 'Total Workforce',
            value: totalWorkforce,
            trend: 2.4,
            subtitle: 'vs last quarter'
          },
          {
            id: 'newHires',
            title: 'New Onboarded (Q3)',
            value: totalOnboarded,
            trend: 5,
            subtitle: 'Onboarding on schedule'
          },
          {
            id: 'activeEmployees',
            title: 'Open Positions',
            value: openPositions.length,
            trend: 0,
            subtitle: 'Active requisitions'
          },
          {
            id: 'attritionRate',
            title: 'Monthly Attrition Rate',
            value: `${attritionRate}%`,
            trend: -0.5,
            subtitle: 'lower than target'
          }
        ]} />
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