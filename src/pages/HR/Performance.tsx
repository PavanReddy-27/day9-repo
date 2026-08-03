import React from 'react';

interface ReviewItem {
  id: string;
  employeeName: string;
  role: string;
  department: string;
  rating: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastReview: string;
}

export const HRPerformance: React.FC = () => {
  const reviews: ReviewItem[] = [
    { id: '1', employeeName: 'Alex Rivera', role: 'Senior Developer', department: 'Engineering', rating: 4.8, riskLevel: 'Low', lastReview: '2026-06-15' },
    { id: '2', employeeName: 'Priya Sharma', role: 'Business Analyst', department: 'Analytics', rating: 4.2, riskLevel: 'Low', lastReview: '2026-05-20' },
    { id: '3', employeeName: 'David Kim', role: 'HR Specialist', department: 'Human Resources', rating: 3.1, riskLevel: 'High', lastReview: '2026-07-10' },
  ];

  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#0f172a', margin: 0, fontSize: '28px', fontWeight: '800' }}>⭐ Performance & Attrition Monitoring</h1>
        <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: '15px' }}>Track performance appraisal scores and flight-risk indicators across departments.</p>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '14px' }}>
              <th style={{ padding: '12px' }}>Employee</th>
              <th style={{ padding: '12px' }}>Department</th>
              <th style={{ padding: '12px' }}>Rating (out of 5)</th>
              <th style={{ padding: '12px' }}>Attrition Risk</th>
              <th style={{ padding: '12px' }}>Last Review</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((rev) => (
              <tr key={rev.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#1e293b' }}>
                <td style={{ padding: '14px', fontWeight: '600' }}>
                  {rev.employeeName}
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>{rev.role}</div>
                </td>
                <td style={{ padding: '14px' }}>{rev.department}</td>
                <td style={{ padding: '14px', fontWeight: '700', color: '#2563eb' }}>{rev.rating} / 5.0</td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: rev.riskLevel === 'Low' ? '#dcfce7' : rev.riskLevel === 'Medium' ? '#fef3c7' : '#fee2e2',
                    color: rev.riskLevel === 'Low' ? '#15803d' : rev.riskLevel === 'Medium' ? '#b45309' : '#b91c1c',
                  }}>
                    {rev.riskLevel} Risk
                  </span>
                </td>
                <td style={{ padding: '14px' }}>{rev.lastReview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRPerformance;