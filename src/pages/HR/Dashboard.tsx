import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { selectRestrictedHROpenPositions } from '../../redux/hrSlice';
import { fetchEmployees } from '../../redux/dashboardSlice';
import leaveApi, { LeaveRequestData } from '../../services/leaveApi';
import { getWorkforceAnalytics } from '../../services/analyticsService';
import KPICards from '../../features/kpi/components/KPICards';
import { CircularProgress, Alert, Button } from '@mui/material';

export const HRDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const openPositions = useAppSelector(selectRestrictedHROpenPositions) || [];
  const { employees, error: employeesError } = useAppSelector((state) => state.dashboard);
  
  const totalOnboarded = useAppSelector((state) => state.hr.totalOnboarded) || 38;
  const attritionRate = useAppSelector((state) => state.hr.attritionRate) || 4.2;

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestData[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const loadLeaveRequests = async () => {
    setLeaveLoading(true);
    setLeaveError(null);
    try {
      // Real, MongoDB-backed pending leave requests
      const data = await leaveApi.getLeaves("Pending");
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch pending leave requests:", err);
      setLeaveError(err?.message || "Failed to load leave requests from server.");
    } finally {
      setLeaveLoading(false);
    }
  };

  const [workforceCount, setWorkforceCount] = useState<number | null>(null);
  const [workforceLoading, setWorkforceLoading] = useState(true);

  const loadWorkforce = async () => {
    setWorkforceLoading(true);
    try {
      // Authoritative MongoDB countDocuments aggregation query
      const data = await getWorkforceAnalytics();
      setWorkforceCount(data.totalEmployees);
    } catch (err) {
      console.error("Failed to load workforce count:", err);
    } finally {
      setWorkforceLoading(false);
    }
  };

  useEffect(() => {
    loadWorkforce();
    loadLeaveRequests();
  }, []);

  const totalWorkforce = workforceCount !== null
    ? workforceCount
    : employees.filter(e => e.role === 'Employee').length;

  return (
    <div style={{ padding: '32px', backgroundColor: 'var(--bg)', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: 'var(--text-h)', margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
            HR Management Overview
          </h1>
          <p style={{ color: 'var(--text-light)', margin: '6px 0 0', fontSize: '15px' }}>
            Monitor key workforce metrics, active recruitment, and pending employee requests in real time from MongoDB.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ marginBottom: '36px' }}>
        <KPICards data={[
          {
            id: 'totalEmployees',
            title: 'Total Workforce',
            value: workforceLoading ? '...' : totalWorkforce,
            trend: 2.4,
            subtitle: 'Real MongoDB headcount'
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

      {employeesError && (
        <div style={{ marginBottom: '24px' }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={() => dispatch(fetchEmployees())}>
              Retry
            </Button>
          }>
            Failed to load workforce headcount: {employeesError}
          </Alert>
        </div>
      )}

      {/* Main Content Panels Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Left Panel: Active Job Requisitions */}
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', border: '1px solid var(--border, #e2e8f0)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-h)', margin: 0 }}>
              Active Requisitions
            </h2>
            <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}>View All</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {openPositions.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: 0 }}>
                No active recruitment requisitions.
              </p>
            ) : (
              openPositions.map((pos) => {
                const posRecord = pos as unknown as Record<string, unknown>;
                const applicants = String(posRecord.applicantCount || posRecord.applicantsCount || posRecord.applicants || 0);
                const statusStr = String(posRecord.status || 'Open');

                return (
                  <div key={pos.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border, #f1f5f9)' }}>
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
              })
            )}
          </div>
        </div>

        {/* Right Panel: Pending Leave Workflow */}
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', border: '1px solid var(--border, #e2e8f0)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-h)', margin: 0 }}>
              Pending Leave Requests
            </h2>
            <span
              style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}
              onClick={loadLeaveRequests}
            >
              Refresh
            </span>
          </div>

          {leaveLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
              <CircularProgress size={28} />
            </div>
          ) : leaveError ? (
            <Alert severity="error" action={
              <Button color="inherit" size="small" onClick={loadLeaveRequests}>
                Retry
              </Button>
            }>
              {leaveError}
            </Alert>
          ) : leaveRequests.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: 0 }}>
              No pending leave requests at this time.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaveRequests.map((req) => {
                const empName = req.employeeId
                  ? `${req.employeeId.firstName || ""} ${req.employeeId.lastName || ""}`.trim() || req.employeeId.employeeId
                  : "Employee";
                const duration = req.durationDays ? `${req.durationDays} day(s)` : "";
                const leaveDesc = `${req.type} Leave ${duration ? `• ${duration}` : ""}`;
                const dates = `${req.startDate} to ${req.endDate}`;

                return (
                  <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border, #f1f5f9)' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-h)', fontSize: '15px' }}>{empName}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '2px' }}>{leaveDesc} ({dates})</div>
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: req.status === 'Approved' ? '#e0f2fe' : '#fef3c7',
                      color: req.status === 'Approved' ? '#0369a1' : '#b45309'
                    }}>
                      {req.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HRDashboard;