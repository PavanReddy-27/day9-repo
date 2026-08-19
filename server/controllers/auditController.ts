import AuditLog from "../models/AuditLog.js";

/**
 * GET /api/v1/audit-logs
 * Returns company-scoped audit entries, newest first. Admin/HR only (enforced
 * at the route). Supports pagination and simple search on action/details/actor.
 */
export const getAuditLogs = async (req: any, res: any) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query: Record<string, any> = { companyId: req.companyId };

    if (search) {
      const rx = new RegExp(String(search).trim(), "i");
      query.$or = [{ action: rx }, { details: rx }, { performedBy: rx }, { userRole: rx }];
    }

    const skip = (Math.max(1, parseInt(String(page))) - 1) * parseInt(String(limit));

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(parseInt(String(limit))).lean(),
      AuditLog.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        totalPages: Math.ceil(total / parseInt(String(limit))),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
