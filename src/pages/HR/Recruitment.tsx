import React from 'react';
import { useAppSelector } from '../../redux/hooks';

export const HRRecruitment: React.FC = () => {
  const { openPositions } = useAppSelector((state) => state.hr);

  return (
    <div style={{ padding: '24px', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ color: '#38bdf8' }}>🎯 Recruitment & Open Positions</h1>
      <p style={{ color: '#94a3b8' }}>Track hiring pipelines, applicants, and job requisitions.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {openPositions.map((job) => (
          <div key={job.id} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '20px' }}>
            <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{job.department}</span>
            <h3 style={{ margin: '8px 0', color: '#f8fafc' }}>{job.title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Applicants: <strong style={{ color: '#fff' }}>{job.applicantsCount}</strong></p>
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              backgroundColor: job.status === 'Open' ? '#166534' : '#854d0e',
              color: '#fff',
            }}>
              {job.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HRRecruitment;