import { describe, it, expect } from "vitest";
import { buildEmployeeScopeFilter } from "../../server/middleware/authMiddleware.ts";

// These tests exercise the REAL production scope-builder used by
// GET /api/v1/employees, so a regression that widens a role's data scope
// (e.g. dropping the companyId isolation) fails here.
describe("RBAC & Multi-Tenant Data Isolation Scoping (production buildEmployeeScopeFilter)", () => {
  const companyId = "60d0fe4f5311236168a109ca";
  const departmentId = "60d0fe4f5311236168a109cb";
  const teamId = "60d0fe4f5311236168a109cc";
  const empId = "60d0fe4f5311236168a109cd";

  it("scopes Admin to the whole (authorized) company only", () => {
    const filter = buildEmployeeScopeFilter("Admin", { departmentId, teamId, _id: empId }, companyId);
    expect(filter).toEqual({ companyId });
  });

  it("scopes HR to the whole (authorized) company only", () => {
    const filter = buildEmployeeScopeFilter("HR", { departmentId, teamId, _id: empId }, companyId);
    expect(filter).toEqual({ companyId });
  });

  it("pins a Manager to their own department within the company", () => {
    const filter = buildEmployeeScopeFilter("Manager", { departmentId, teamId, _id: empId }, companyId);
    expect(filter).toEqual({ companyId, departmentId });
  });

  it("pins a Team Lead to their own team within the company", () => {
    const filter = buildEmployeeScopeFilter("Team Lead", { departmentId, teamId, _id: empId }, companyId);
    expect(filter).toEqual({ companyId, teamId });
  });

  it("pins an Employee to their own record within the company", () => {
    const filter = buildEmployeeScopeFilter("Employee", { departmentId, teamId, _id: empId }, companyId);
    expect(filter).toEqual({ companyId, _id: empId });
  });

  it("always includes companyId so no role can read across organizations", () => {
    for (const role of ["Admin", "HR", "Manager", "Team Lead", "Employee"]) {
      const filter = buildEmployeeScopeFilter(role, { departmentId, teamId, _id: empId }, companyId);
      expect(filter.companyId).toBe(companyId);
    }
  });
});
