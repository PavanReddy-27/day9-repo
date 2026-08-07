
// ====================================
// File: src/services/backendSimulation.ts
// ====================================


import authApi from "./authApi";

/**
 * Simulates the backend layer described in the architecture diagram:
 * 1. Backend Authentication Middleware
 * 2. Backend RBAC Check
 * 3. Department Scope Check
 */

export class BackendSimulationError extends Error {
  public status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "BackendSimulationError";
  }
}

export const simulateBackendChecks = (
  resource: string, 
  action: string, 
  targetDepartmentId?: string
): void => {
  console.log(`[Backend Simulation] Intercepting request for ${action} on ${resource}`);

  // 1. Backend Authentication Middleware
  const token = authApi.getAccessToken();
  const user = authApi.getCurrentUser();
  
  if (!token || !user) {
    console.error("[Backend Simulation] Authentication Middleware Failed: Invalid session");
    throw new BackendSimulationError("Invalid session", 401);
  }

  // 2. Backend RBAC Check
  // Example rule: Only Admin and HR can access global reports.
  if (resource === "reports" && user.role === "Manager") {
    console.error("[Backend Simulation] RBAC Check Failed: Manager cannot access global reports");
    throw new BackendSimulationError("RBAC Check Failed: Action not permitted", 403);
  }

  // Attendance RBAC Check: Employees can only view/correct their own records.
  if (resource === "attendance_corrections" && action === "review" && user.role === "Employee") {
    throw new BackendSimulationError("RBAC Check Failed: Employees cannot review corrections.", 403);
  }
  
  if (resource === "attendance_export" && user.role === "Employee") {
    throw new BackendSimulationError("RBAC Check Failed: Employees cannot export global attendance.", 403);
  }

  // 3. Department Scope Check
  // Example rule: Managers can only access data within their own department.
  if (user.role === "Manager" && targetDepartmentId && targetDepartmentId !== user.department) {
    console.error(`[Backend Simulation] Department Scope Check Failed: Manager (Dept: ${user.department}) tried to access Dept: ${targetDepartmentId}`);
    throw new BackendSimulationError("Department Scope Check Failed: Not permitted to access outside of your department", 403);
  }

  console.log(`[Backend Simulation] All checks passed. Proceeding to Business Services.`);
};
