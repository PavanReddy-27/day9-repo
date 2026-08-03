import React from 'react';

export const HRAnalytics: React.FC = () => {
  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: '28px', fontWeight: '800' }}>📈 HR Analytics & Export Center</h1>
          <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: '15px' }}>Export filtered workforce metrics, headcount distributions, and audit summary logs.</p>
        </div>
        <button
          onClick={() => alert('Exporting full HR report as CSV...')}
          style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
        >
          📥 Download Full HR Report (.CSV)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 12px', color: '#0f172a' }}>📊 Headcount by Department</h3>
          <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: '1.8' }}>
            <li>Engineering: <strong>4,200</strong></li>
            <li>Sales & Marketing: <strong>2,800</strong></li>
            <li>Analytics & Data: <strong>1,500</strong></li>
            <li>Human Resources: <strong>1,500</strong></li>
          </ul>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 12px', color: '#0f172a' }}>🎯 Annual Retention Targets</h3>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>Target Retention Rate: <strong>95%</strong></p>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>Current Retention Rate: <strong>95.8%</strong> (On Track)</p>
        </div>
      </div>
    </div>
  );
};

export default HRAnalytics;