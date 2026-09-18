import { describe, it, expect } from 'vitest';

/**
 * Authorization checker for data export functionality based on RBAC rules.
 */
function checkExportAuthorization(role: string, exportType: string): { allowed: boolean; reason?: string } {
  const allowedRolesForFullExport = ['Admin', 'HR'];
  const allowedRolesForTeamExport = ['Admin', 'HR', 'Manager'];

  if (exportType === 'ALL_EMPLOYEES' || exportType === 'SYSTEM_AUDIT') {
    if (allowedRolesForFullExport.includes(role)) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Requires Admin or HR role for full data export' };
  }

  if (exportType === 'TEAM_ATTENDANCE') {
    if (allowedRolesForTeamExport.includes(role)) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Requires Admin, HR, or Manager role for team attendance export' };
  }

  if (exportType === 'SELF_ATTENDANCE') {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Unknown export request type' };
}

describe('Export Authorization Security', () => {
  it('allows Admin and HR to export all system data', () => {
    expect(checkExportAuthorization('Admin', 'ALL_EMPLOYEES').allowed).toBe(true);
    expect(checkExportAuthorization('HR', 'SYSTEM_AUDIT').allowed).toBe(true);
  });

  it('allows Manager to export team attendance but rejects full employee export', () => {
    expect(checkExportAuthorization('Manager', 'TEAM_ATTENDANCE').allowed).toBe(true);
    const result = checkExportAuthorization('Manager', 'ALL_EMPLOYEES');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Requires Admin or HR role');
  });

  it('denies standard Employee from exporting team or system data', () => {
    expect(checkExportAuthorization('Employee', 'TEAM_ATTENDANCE').allowed).toBe(false);
    expect(checkExportAuthorization('Employee', 'ALL_EMPLOYEES').allowed).toBe(false);
  });

  it('allows standard Employee to export their own personal attendance', () => {
    expect(checkExportAuthorization('Employee', 'SELF_ATTENDANCE').allowed).toBe(true);
  });
});
