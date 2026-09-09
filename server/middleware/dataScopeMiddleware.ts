import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Team from "../models/Team.js";
import Department from "../models/Department.js";
import { logComplianceViolation } from "../utils/compliance.js";

/**
 * Validates whether a team belongs to a manager's assigned department within the authorized company.
 */
export const isTeamInManagerDepartment = async (
  teamId: string | mongoose.Types.ObjectId,
  managerDeptId: string | mongoose.Types.ObjectId,
  companyId: string | mongoose.Types.ObjectId
): Promise<boolean> => {
  if (!teamId || !managerDeptId || !companyId) return false;
  try {
    const team = await Team.findOne({
      _id: teamId,
      departmentId: managerDeptId,
      companyId: new mongoose.Types.ObjectId(String(companyId)),
    }).lean();
    return !!team;
  } catch (error) {
    return false;
  }
};

/**
 * Checks if target employee is within the caller's authorized role scope.
 * Rejects modified IDs, cross-organization access, managers querying unrelated teams/departments,
 * and employees querying another employee.
 */
export const checkEmployeeScope = async (
  targetEmployeeId: string | mongoose.Types.ObjectId,
  callerRole: string,
  callerEmployee: any,
  companyId: string | mongoose.Types.ObjectId,
  req?: any
): Promise<{ allowed: boolean; status: number; message: string; targetDoc?: any }> => {
  if (!targetEmployeeId || targetEmployeeId === "undefined" || targetEmployeeId === "null") {
    return { allowed: false, status: 400, message: "Invalid or missing employee ID" };
  }

  const strTarget = String(targetEmployeeId).trim();
  const currentCompanyId = companyId ? String(companyId) : "";

  // 1. Employee Role: strictly self-only (reject modified/unrelated employee IDs immediately)
  if (callerRole === "Employee") {
    const callerId = callerEmployee?._id ? String(callerEmployee._id) : "";
    const callerEmpCode = callerEmployee?.employeeId ? String(callerEmployee.employeeId) : "";
    const isSelf = strTarget === callerId || (callerEmpCode && strTarget === callerEmpCode);

    if (!isSelf) {
      return { allowed: false, status: 403, message: "Forbidden: Cannot access another employee's records" };
    }
  }

  let targetDoc: any = null;

  // Attempt lookup within caller's company
  if (mongoose.Types.ObjectId.isValid(strTarget)) {
    targetDoc = await Employee.findOne({
      _id: new mongoose.Types.ObjectId(strTarget),
      companyId: new mongoose.Types.ObjectId(currentCompanyId),
    }).lean();

    if (!targetDoc) {
      targetDoc = await Employee.findOne({
        employeeId: strTarget,
        companyId: new mongoose.Types.ObjectId(currentCompanyId),
      }).lean();
    }
  } else {
    targetDoc = await Employee.findOne({
      employeeId: strTarget,
      companyId: new mongoose.Types.ObjectId(currentCompanyId),
    }).lean();
  }

  // If not found in caller company, check if it exists in another company (Cross-Org Violation)
  if (!targetDoc) {
    let crossCompanyDoc: any = null;
    if (mongoose.Types.ObjectId.isValid(strTarget)) {
      crossCompanyDoc = await Employee.findById(strTarget).lean();
    }
    if (!crossCompanyDoc) {
      crossCompanyDoc = await Employee.findOne({ employeeId: strTarget }).lean();
    }

    if (crossCompanyDoc && crossCompanyDoc.companyId && String(crossCompanyDoc.companyId) !== currentCompanyId) {
      if (req) {
        await logComplianceViolation(
          "CROSS_COMPANY_ACCESS",
          `Cross-organization employee access attempt on ID: ${strTarget}`,
          "Critical",
          { targetEmployeeId: strTarget, targetCompanyId: crossCompanyDoc.companyId, callerCompanyId: currentCompanyId },
          req
        );
      }
      return { allowed: false, status: 403, message: "Forbidden: Cross-organization access denied" };
    }

    // Truly non-existent employee ID
    return { allowed: false, status: 404, message: "Employee record not found" };
  }

  // Double check company match
  if (targetDoc.companyId && String(targetDoc.companyId) !== currentCompanyId) {
    if (req) {
      await logComplianceViolation(
        "CROSS_COMPANY_ACCESS",
        `Cross-organization employee access attempt on ID: ${strTarget}`,
        "Critical",
        { targetEmployeeId: strTarget, targetCompanyId: targetDoc.companyId, callerCompanyId: currentCompanyId },
        req
      );
    }
    return { allowed: false, status: 403, message: "Forbidden: Cross-organization access denied" };
  }

  // 1. Employee Role: verified self-only
  if (callerRole === "Employee") {
    return { allowed: true, status: 200, message: "Authorized", targetDoc };
  }

  // 2. Team Lead Role: strictly assigned team members or self
  if (callerRole === "Team Lead") {
    const callerTeamId = (callerEmployee?.teamId?._id || callerEmployee?.teamId)?.toString();
    const targetTeamId = (targetDoc.teamId?._id || targetDoc.teamId)?.toString();
    const callerId = callerEmployee?._id ? String(callerEmployee._id) : "";
    const isSelf = String(targetDoc._id) === callerId;

    if (!isSelf && (!callerTeamId || targetTeamId !== callerTeamId)) {
      return { allowed: false, status: 403, message: "Forbidden: Cannot access employee outside your assigned team" };
    }
    return { allowed: true, status: 200, message: "Authorized", targetDoc };
  }

  // 3. Manager Role: strictly assigned department or direct reports
  if (callerRole === "Manager") {
    const callerDeptId = (callerEmployee?.departmentId?._id || callerEmployee?.departmentId)?.toString();
    const targetDeptId = (targetDoc.departmentId?._id || targetDoc.departmentId)?.toString();
    const callerId = callerEmployee?._id ? String(callerEmployee._id) : "";
    const isDirectReport = targetDoc.managerId && String(targetDoc.managerId) === callerId;
    const isSelf = String(targetDoc._id) === callerId;

    if (!isSelf && !isDirectReport && (!callerDeptId || targetDeptId !== callerDeptId)) {
      return { allowed: false, status: 403, message: "Forbidden: Cannot access employee outside your assigned department" };
    }
    return { allowed: true, status: 200, message: "Authorized", targetDoc };
  }

  // 4. Admin & HR: Organization-wide access (company isolation verified above)
  return { allowed: true, status: 200, message: "Authorized", targetDoc };
};

/**
 * Express middleware to validate request parameters, query, and body for:
 * - Cross-organization attempts (companyId mismatch -> 403 + compliance log)
 * - Department tampering (Manager/Team Lead/Employee accessing unrelated department -> 403)
 * - Team tampering (Manager accessing unrelated team, Team Lead/Employee outside team -> 403)
 * - Employee tampering (Employee accessing another employee, Manager/Lead outside scope -> 403)
 */
export const validateDataScope = async (req: any, res: any, next: any) => {
  try {
    const userRole = req.role || req.user?.role;
    const callerCompanyId = req.companyId ? String(req.companyId) : "";
    const callerEmployee = req.employee;

    // Check companyId in params, query, body
    const requestedCompanyId = req.params?.companyId || req.query?.companyId || req.body?.companyId;
    if (requestedCompanyId && String(requestedCompanyId) !== callerCompanyId) {
      await logComplianceViolation(
        "CROSS_COMPANY_ACCESS",
        `Cross-organization access attempt with companyId: ${requestedCompanyId}`,
        "Critical",
        { requestedCompanyId, callerCompanyId },
        req
      );
      return res.status(403).json({
        success: false,
        error: "Forbidden: Cross-organization access denied",
        message: "Forbidden: Cross-organization access denied",
      });
    }

    // Check departmentId tampering
    const requestedDeptId = req.params?.departmentId || req.query?.departmentId || req.body?.departmentId;
    if (requestedDeptId && ["Manager", "Team Lead", "Employee"].includes(userRole)) {
      const myDeptId = (callerEmployee?.departmentId?._id || callerEmployee?.departmentId)?.toString();
      if (myDeptId && String(requestedDeptId) !== myDeptId) {
        return res.status(403).json({
          success: false,
          error: "Forbidden: Cannot access department outside your assigned department",
          message: "Forbidden: Cannot access department outside your assigned department",
        });
      }
    }

    // Check teamId tampering
    const requestedTeamId = req.params?.teamId || req.query?.teamId || req.body?.teamId;
    if (requestedTeamId) {
      if (userRole === "Manager") {
        const myDeptId = callerEmployee?.departmentId?._id || callerEmployee?.departmentId;
        const validTeam = await isTeamInManagerDepartment(requestedTeamId, myDeptId, callerCompanyId);
        if (!validTeam) {
          return res.status(403).json({
            success: false,
            error: "Forbidden: Cannot access unrelated team",
            message: "Forbidden: Cannot access unrelated team",
          });
        }
      } else if (["Team Lead", "Employee"].includes(userRole)) {
        const myTeamId = (callerEmployee?.teamId?._id || callerEmployee?.teamId)?.toString();
        if (myTeamId && String(requestedTeamId) !== myTeamId) {
          return res.status(403).json({
            success: false,
            error: "Forbidden: Cannot access team outside your assigned team",
            message: "Forbidden: Cannot access team outside your assigned team",
          });
        }
      }
    }

    // Check employeeId tampering
    const requestedEmpId = req.params?.employeeId || req.query?.employeeId || req.body?.employeeId;
    if (requestedEmpId && requestedEmpId !== "undefined" && requestedEmpId !== "null") {
      const scopeCheck = await checkEmployeeScope(requestedEmpId, userRole, callerEmployee, callerCompanyId, req);
      if (!scopeCheck.allowed) {
        return res.status(scopeCheck.status).json({
          success: false,
          error: scopeCheck.message,
          message: scopeCheck.message,
        });
      }
    }

    next();
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
