import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../server/index.js';
import connectDB, { closeDB } from '../../server/config/db.js';
import { generateTokens } from '../../server/controllers/authController.js';
import { checkEmployeeScope, isTeamInManagerDepartment } from '../../server/middleware/dataScopeMiddleware.js';
import { buildEmployeeScopeFilter } from '../../server/middleware/authMiddleware.js';

import Company from '../../server/models/Company.js';
import Department from '../../server/models/Department.js';
import Team from '../../server/models/Team.js';
import Location from '../../server/models/Location.js';
import Employee from '../../server/models/Employee.js';
import { AdminAuth, HRAuth, ManagerAuth, EmployeeAuth } from '../../server/models/User.js';
import AttendanceRecord from '../../server/models/AttendanceRecord.js';
import LeaveRequest from '../../server/models/LeaveRequest.js';
import PayrollRecord from '../../server/models/PayrollRecord.js';
import PayrollPeriod from '../../server/models/PayrollPeriod.js';
import ComplianceViolation from '../../server/models/ComplianceViolation.js';

describe('Strict Data-Level Authorization & Multi-Tenant Security Suite', () => {
  let companyAId: any;
  let companyBId: any;

  let locationAId: any;
  let dept1Id: any;
  let dept2Id: any;
  let team1AId: any;
  let team1BId: any;
  let team2AId: any;

  let adminUser: any;
  let hrUser: any;
  let manager1Emp: any;
  let manager1User: any;
  let teamLead1AEmp: any;
  let teamLead1AUser: any;
  let emp1A1Emp: any;
  let emp1A1User: any;
  let emp1A2Emp: any;
  let emp1A2User: any;
  let emp2A1Emp: any;
  let emp2A1User: any;

  let empB1Emp: any;
  let empB1User: any;

  let tokenAdmin: string;
  let tokenHR: string;
  let tokenManager1: string;
  let tokenTeamLead1A: string;
  let tokenEmp1A1: string;
  let tokenEmp1A2: string;
  let tokenEmp2A1: string;
  let tokenEmpB1: string;

  beforeAll(async () => {
    await connectDB();

    const compA = await Company.create({ name: 'Acme Corp', code: 'ACM_' + Date.now() });
    const compB = await Company.create({ name: 'Beta Global', code: 'BET_' + Date.now() });
    companyAId = compA._id;
    companyBId = compB._id;

    const locA = await Location.create({
      companyId: companyAId,
      name: 'HQ Campus',
      code: 'HQ_' + Date.now(),
      coordinates: { latitude: 12.9716, longitude: 77.5946 },
      geofenceRadiusMeters: 500,
    });
    locationAId = locA._id;

    const d1 = await Department.create({ companyId: companyAId, locationId: locationAId, name: 'Engineering', code: 'ENG_' + Date.now() });
    const d2 = await Department.create({ companyId: companyAId, locationId: locationAId, name: 'Marketing', code: 'MKT_' + Date.now() });
    dept1Id = d1._id;
    dept2Id = d2._id;

    const t1A = await Team.create({ companyId: companyAId, departmentId: dept1Id, name: 'Frontend Eng' });
    const t1B = await Team.create({ companyId: companyAId, departmentId: dept1Id, name: 'Backend Eng' });
    const t2A = await Team.create({ companyId: companyAId, departmentId: dept2Id, name: 'Growth Mkt' });
    team1AId = t1A._id;
    team1BId = t1B._id;
    team2AId = t2A._id;

    // Admin Auth
    adminUser = await AdminAuth.create({
      employeeId: 'ADM001_' + Date.now(),
      email: `admin_${Date.now()}@acme.com`,
      password: 'password123',
      companyId: companyAId,
      role: 'Admin',
    });
    tokenAdmin = generateTokens(adminUser._id, 'Admin').accessToken;

    // HR Auth
    hrUser = await HRAuth.create({
      employeeId: 'HR001_' + Date.now(),
      email: `hr_${Date.now()}@acme.com`,
      password: 'password123',
      companyId: companyAId,
      role: 'HR',
    });
    tokenHR = generateTokens(hrUser._id, 'HR').accessToken;

    // Manager 1 (Dept 1 - Engineering)
    const mgrEmpCode = 'MGR001_' + Date.now();
    manager1User = await ManagerAuth.create({
      employeeId: mgrEmpCode,
      email: `mgr1_${Date.now()}@acme.com`,
      password: 'password123',
      companyId: companyAId,
      role: 'Manager',
    });
    manager1Emp = await Employee.create({
      employeeId: mgrEmpCode,
      companyId: companyAId,
      userId: manager1User._id,
      email: manager1User.email,
      firstName: 'Alice',
      lastName: 'Manager',
      fullName: 'Alice Manager',
      locationId: locationAId,
      departmentId: dept1Id,
      role: 'Manager',
      joiningDate: new Date(),
    });
    tokenManager1 = generateTokens(manager1User._id, 'Manager').accessToken;

    // Team Lead 1A (Dept 1, Team 1A)
    const tlEmpCode = 'TL001_' + Date.now();
    teamLead1AUser = await EmployeeAuth.create({
      employeeId: tlEmpCode,
      email: `lead1a_${Date.now()}@acme.com`,
      password: 'password123',
      companyId: companyAId,
      role: 'Team Lead',
    });
    teamLead1AEmp = await Employee.create({
      employeeId: tlEmpCode,
      companyId: companyAId,
      userId: teamLead1AUser._id,
      email: teamLead1AUser.email,
      firstName: 'Bob',
      lastName: 'Lead',
      fullName: 'Bob Lead',
      locationId: locationAId,
      departmentId: dept1Id,
      teamId: team1AId,
      managerId: manager1Emp._id,
      role: 'Team Lead',
      joiningDate: new Date(),
    });
    tokenTeamLead1A = generateTokens(teamLead1AUser._id, 'Team Lead').accessToken;

    // Employee 1A1 (Dept 1, Team 1A)
    const emp1A1Code = 'EMP1A1_' + Date.now();
    emp1A1User = await EmployeeAuth.create({
      employeeId: emp1A1Code,
      email: `emp1a1_${Date.now()}@acme.com`,
      password: 'password123',
      companyId: companyAId,
      role: 'Employee',
    });
    emp1A1Emp = await Employee.create({
      employeeId: emp1A1Code,
      companyId: companyAId,
      userId: emp1A1User._id,
      email: emp1A1User.email,
      firstName: 'Charlie',
      lastName: 'Dev',
      fullName: 'Charlie Dev',
      locationId: locationAId,
      departmentId: dept1Id,
      teamId: team1AId,
      managerId: manager1Emp._id,
      role: 'Employee',
      joiningDate: new Date(),
    });
    tokenEmp1A1 = generateTokens(emp1A1User._id, 'Employee').accessToken;

    // Employee 1A2 (Dept 1, Team 1A)
    const emp1A2Code = 'EMP1A2_' + Date.now();
    emp1A2User = await EmployeeAuth.create({
      employeeId: emp1A2Code,
      email: `emp1a2_${Date.now()}@acme.com`,
      password: 'password123',
      companyId: companyAId,
      role: 'Employee',
    });
    emp1A2Emp = await Employee.create({
      employeeId: emp1A2Code,
      companyId: companyAId,
      userId: emp1A2User._id,
      email: emp1A2User.email,
      firstName: 'Diana',
      lastName: 'Dev',
      fullName: 'Diana Dev',
      locationId: locationAId,
      departmentId: dept1Id,
      teamId: team1AId,
      managerId: manager1Emp._id,
      role: 'Employee',
      joiningDate: new Date(),
    });
    tokenEmp1A2 = generateTokens(emp1A2User._id, 'Employee').accessToken;

    // Employee 2A1 (Dept 2, Team 2A - Marketing)
    const emp2A1Code = 'EMP2A1_' + Date.now();
    emp2A1User = await EmployeeAuth.create({
      employeeId: emp2A1Code,
      email: `emp2a1_${Date.now()}@acme.com`,
      password: 'password123',
      companyId: companyAId,
      role: 'Employee',
    });
    emp2A1Emp = await Employee.create({
      employeeId: emp2A1Code,
      companyId: companyAId,
      userId: emp2A1User._id,
      email: emp2A1User.email,
      firstName: 'Evan',
      lastName: 'Marketer',
      fullName: 'Evan Marketer',
      locationId: locationAId,
      departmentId: dept2Id,
      teamId: team2AId,
      role: 'Employee',
      joiningDate: new Date(),
    });
    tokenEmp2A1 = generateTokens(emp2A1User._id, 'Employee').accessToken;

    // Company B Employee
    const empB1Code = 'EMPB1_' + Date.now();
    empB1User = await EmployeeAuth.create({
      employeeId: empB1Code,
      email: `empB1_${Date.now()}@beta.com`,
      password: 'password123',
      companyId: companyBId,
      role: 'Employee',
    });
    empB1Emp = await Employee.create({
      employeeId: empB1Code,
      companyId: companyBId,
      userId: empB1User._id,
      email: empB1User.email,
      firstName: 'Frank',
      lastName: 'Beta',
      fullName: 'Frank Beta',
      locationId: locationAId,
      departmentId: dept1Id,
      role: 'Employee',
      joiningDate: new Date(),
    });
    tokenEmpB1 = generateTokens(empB1User._id, 'Employee').accessToken;

    // Seed Attendance, Leave, and Payroll records for Employee 1A2
    const today = new Date().toISOString().split('T')[0];
    await AttendanceRecord.create({
      companyId: companyAId,
      employeeId: emp1A2Emp._id,
      locationId: locationAId,
      date: today,
      checkInTime: new Date(),
      status: 'Working',
    });

    await LeaveRequest.create({
      companyId: companyAId,
      employeeId: emp1A2Emp._id,
      type: 'Annual',
      startDate: '2026-10-01',
      endDate: '2026-10-05',
      durationDays: 5,
      reason: 'Vacation',
      status: 'Pending',
    });

    const period = await PayrollPeriod.create({
      companyId: companyAId,
      name: 'Oct 2026',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-31'),
    });

    await PayrollRecord.create({
      companyId: companyAId,
      periodId: period._id,
      employeeId: emp1A2Emp._id,
      baseSalary: 60000,
      payableDays: 30,
      regularHours: 160,
      overtimeHours: 0,
      unpaidLeaveDays: 0,
      shiftAllowance: 0,
      deductions: 0,
      netSalary: 60000,
      status: 'Draft',
    });
  }, 60000);

  afterAll(async () => {
    await closeDB();
  });

  describe('1. Unit Scope Helpers & Pure Logic', () => {
    it('isTeamInManagerDepartment validates team belonging to manager department', async () => {
      const valid = await isTeamInManagerDepartment(team1AId, dept1Id, companyAId);
      expect(valid).toBe(true);

      const invalid = await isTeamInManagerDepartment(team2AId, dept1Id, companyAId);
      expect(invalid).toBe(false);
    });

    it('checkEmployeeScope restricts Employee to self-only', async () => {
      const selfCheck = await checkEmployeeScope(emp1A1Emp._id, 'Employee', { _id: emp1A1Emp._id }, companyAId);
      expect(selfCheck.allowed).toBe(true);

      const otherCheck = await checkEmployeeScope(emp1A2Emp._id, 'Employee', { _id: emp1A1Emp._id }, companyAId);
      expect(otherCheck.allowed).toBe(false);
      expect(otherCheck.status).toBe(403);
    });

    it('checkEmployeeScope restricts Team Lead to team members', async () => {
      const teamMemberCheck = await checkEmployeeScope(emp1A1Emp._id, 'Team Lead', { _id: teamLead1AEmp._id, teamId: team1AId }, companyAId);
      expect(teamMemberCheck.allowed).toBe(true);

      const otherDeptCheck = await checkEmployeeScope(emp2A1Emp._id, 'Team Lead', { _id: teamLead1AEmp._id, teamId: team1AId }, companyAId);
      expect(otherDeptCheck.allowed).toBe(false);
      expect(otherDeptCheck.status).toBe(403);
    });

    it('checkEmployeeScope restricts Manager to department members or direct reports', async () => {
      const deptMemberCheck = await checkEmployeeScope(emp1A1Emp._id, 'Manager', { _id: manager1Emp._id, departmentId: dept1Id }, companyAId);
      expect(deptMemberCheck.allowed).toBe(true);

      const otherDeptCheck = await checkEmployeeScope(emp2A1Emp._id, 'Manager', { _id: manager1Emp._id, departmentId: dept1Id }, companyAId);
      expect(otherDeptCheck.allowed).toBe(false);
      expect(otherDeptCheck.status).toBe(403);
    });

    it('checkEmployeeScope catches cross-company access and flags 403', async () => {
      const crossCheck = await checkEmployeeScope(empB1Emp._id, 'Admin', { _id: adminUser._id }, companyAId);
      expect(crossCheck.allowed).toBe(false);
      expect(crossCheck.status).toBe(403);
      expect(crossCheck.message).toMatch(/cross-organization/i);
    });
  });

  describe('2. Admin: Organization-Wide Access within Authorized Company', () => {
    it('Admin can list all company employees', async () => {
      const res = await request(app)
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    });

    it('Admin is rejected with 403 when supplying another companyId', async () => {
      const res = await request(app)
        .get(`/api/v1/employees?companyId=${companyBId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(403);
      expect(res.body.message || res.body.error).toMatch(/cross-organization/i);
    });
  });

  describe('3. HR: Authorized Organization and Department Data', () => {
    it('HR can view organization departments and employees', async () => {
      const res = await request(app)
        .get('/api/v1/departments')
        .set('Authorization', `Bearer ${tokenHR}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('HR is rejected with 403 when attempting cross-company query', async () => {
      const res = await request(app)
        .get(`/api/v1/departments?companyId=${companyBId}`)
        .set('Authorization', `Bearer ${tokenHR}`);
      expect(res.status).toBe(403);
      expect(res.body.message || res.body.error).toMatch(/cross-organization/i);
    });
  });

  describe('4. Manager: Only Assigned Departments and Teams', () => {
    it('Manager can list departments (pinned to assigned department)', async () => {
      const res = await request(app)
        .get('/api/v1/departments')
        .set('Authorization', `Bearer ${tokenManager1}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id).toBe(dept1Id.toString());
    });

    it('Manager accessing unrelated department is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/departments?departmentId=${dept2Id}`)
        .set('Authorization', `Bearer ${tokenManager1}`);
      expect(res.status).toBe(403);
      expect(res.body.message || res.body.error).toMatch(/department outside your assigned department/i);
    });

    it('Manager accessing unrelated team is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/teams?teamId=${team2AId}`)
        .set('Authorization', `Bearer ${tokenManager1}`);
      expect(res.status).toBe(403);
      expect(res.body.message || res.body.error).toMatch(/unrelated team/i);
    });

    it('Manager attempting to query employees in unrelated team is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/employees?teamId=${team2AId}`)
        .set('Authorization', `Bearer ${tokenManager1}`);
      expect(res.status).toBe(403);
      expect(res.body.message || res.body.error).toMatch(/unrelated team/i);
    });

    it('Manager attempting to access employee in another department via getEmployeeById is rejected with 403', async () => {
      const res = await request(app)
        .get(`/api/v1/employees/${emp2A1Emp._id}`)
        .set('Authorization', `Bearer ${tokenManager1}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/outside your department/i);
    });
  });

  describe('5. Team Lead: Only Assigned Team Members', () => {
    it('Team Lead can access member of own team', async () => {
      const res = await request(app)
        .get(`/api/v1/employees/${emp1A1Emp._id}`)
        .set('Authorization', `Bearer ${tokenTeamLead1A}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(emp1A1Emp._id.toString());
    });

    it('Team Lead accessing employee outside assigned team is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/employees/${emp2A1Emp._id}`)
        .set('Authorization', `Bearer ${tokenTeamLead1A}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/outside your assigned team/i);
    });

    it('Team Lead querying unrelated team is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/teams?teamId=${team2AId}`)
        .set('Authorization', `Bearer ${tokenTeamLead1A}`);
      expect(res.status).toBe(403);
      expect(res.body.message || res.body.error).toMatch(/outside your assigned team/i);
    });
  });

  describe('6. Employee: Only Personal Records (Attendance, Payroll, Leave)', () => {
    it('Employee can access their own attendance history', async () => {
      const res = await request(app)
        .get(`/api/v1/attendance/history?employeeId=${emp1A1Emp._id}`)
        .set('Authorization', `Bearer ${tokenEmp1A1}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('Employee accessing another employee attendance is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/attendance/history?employeeId=${emp1A2Emp._id}`)
        .set('Authorization', `Bearer ${tokenEmp1A1}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/cannot access another employee|forbidden/i);
    });

    it('Employee accessing another employee payroll records is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/payroll/my-pay?employeeId=${emp1A2Emp._id}`)
        .set('Authorization', `Bearer ${tokenEmp1A1}`);
      expect(res.status).toBe(403);
      expect(res.body.error || res.body.message).toMatch(/cannot access another employee|cannot view another employee|forbidden/i);
    });

    it('Employee accessing another employee leave requests is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/leaves?employeeId=${emp1A2Emp._id}`)
        .set('Authorization', `Bearer ${tokenEmp1A1}`);
      expect(res.status).toBe(403);
      expect(res.body.error || res.body.message).toMatch(/cannot access another employee|forbidden/i);
    });

    it('Employee accessing another employee profile is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/v1/employees/${emp1A2Emp._id}`)
        .set('Authorization', `Bearer ${tokenEmp1A1}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/cannot access another employee/i);
    });

    it('Employee submitting check-in with modified employeeId is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/check-in')
        .set('Authorization', `Bearer ${tokenEmp1A1}`)
        .send({
          employeeId: emp1A2Emp._id.toString(),
          location: { latitude: 12.9716, longitude: 77.5946, accuracy: 10 },
          idempotencyKey: 'tamper_chk_' + Date.now(),
        });
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/cannot record attendance for another employee/i);
    });

    it('Employee submitting leave request with modified employeeId is rejected with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/leaves')
        .set('Authorization', `Bearer ${tokenEmp1A1}`)
        .send({
          employeeId: emp1A2Emp._id.toString(),
          type: 'Annual',
          startDate: '2026-11-01',
          endDate: '2026-11-02',
          reason: 'Tampered employee request',
        });
      expect(res.status).toBe(403);
      expect(res.body.error || res.body.message).toMatch(/cannot submit leave request for another employee/i);
    });
  });

  describe('7. Cross-Organization Rejection & Compliance Audit Logging', () => {
    it('Rejects cross-organization access and logs compliance violation', async () => {
      const countBefore = await ComplianceViolation.countDocuments({ ruleType: 'CROSS_COMPANY_ACCESS' });

      const res = await request(app)
        .get(`/api/v1/employees?companyId=${companyBId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(403);

      const countAfter = await ComplianceViolation.countDocuments({ ruleType: 'CROSS_COMPANY_ACCESS' });
      expect(countAfter).toBeGreaterThan(countBefore);
    });

    it('Rejects cross-organization employee access by ID with 403', async () => {
      const res = await request(app)
        .get(`/api/v1/employees/${empB1Emp._id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/cross-organization/i);
    });
  });
});
