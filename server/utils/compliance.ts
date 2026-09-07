import ComplianceViolation from '../models/ComplianceViolation.js';

export const logComplianceViolation = async (
  ruleType: string,
  description: string,
  severity: string,
  metadata: any,
  req: any
) => {
  try {
    await ComplianceViolation.create({
      companyId: req.companyId || null,
      userId: req.user?.id || null,
      ruleType,
      description,
      severity,
      metadata,
      ipAddress: req.ip,
    });
  } catch (error) {
    console.error('Failed to log compliance violation:', error);
  }
};
