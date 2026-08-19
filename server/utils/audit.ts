import AuditLog from "../models/AuditLog.js";

/**
 * Writes a sensitive-action audit entry to MongoDB. Fire-and-forget: audit
 * failures must never break the primary request, so errors are swallowed.
 */
export const writeAuditLog = async (
  req: any,
  action: string,
  details: string,
  entityType = "",
  entityId = ""
): Promise<void> => {
  try {
    await AuditLog.create({
      companyId: req.companyId,
      performedBy: req.user?.email || req.employee?.email || req.userEmail || "System",
      userRole: req.role || req.user?.role || "Unknown",
      action,
      entityType,
      entityId: String(entityId || ""),
      details,
      ipAddress: req.ip || req.headers?.["x-forwarded-for"] || "127.0.0.1",
      userAgent: req.headers?.["user-agent"] || "",
      timestamp: new Date(),
    });
  } catch {
    // never let audit logging break the request
  }
};
