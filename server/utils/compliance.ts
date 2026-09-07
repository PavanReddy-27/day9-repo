import ComplianceViolation from '../models/ComplianceViolation.js';

export type ComplianceRuleType = 'CROSS_COMPANY_ACCESS' | 'UNAUTHORIZED_ACCESS' | 'DATA_LEAK_ATTEMPT' | 'EXCESSIVE_HOURS';
export type ComplianceSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export const logComplianceViolation = async (
  ruleType: ComplianceRuleType | string,
  description: string,
  severity: ComplianceSeverity | string,
  metadata: any,
  req: any
) => {
  try {
    await ComplianceViolation.create({
      companyId: req.companyId || null,
      userId: req.user?.id || null,
      ruleType: ruleType as any,
      description,
      severity: severity as any,
      metadata,
      ipAddress: req.ip,
    });
  } catch (error) {
    console.error('Failed to log compliance violation:', error);
  }
};
