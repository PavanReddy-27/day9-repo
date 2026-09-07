// ====================================
// File: src/services/auditService.ts
// ====================================

import { apiClient } from "./apiClient";

export interface AuditLog {
  _id: string;
  performedBy: string;
  userRole: string;
  action: string;
  details: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  timestamp: string;
}

class AuditService {
  /**
   * Fetch authoritative audit logs from the MongoDB backend API.
   * Access is strictly restricted to Admin and HR roles.
   */
  public async getLogs(search?: string, limit: number = 200): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("limit", String(limit));

    const query = params.toString() ? `?${params.toString()}` : "";
    const data = await apiClient<AuditLog[]>(`/audit-logs${query}`);
    return Array.isArray(data) ? data : [];
  }

  /**
   * Client-side logging is no-op:
   * The backend server authoritatively writes audit logs directly to MongoDB
   * for all sensitive operations (auth, attendance, leaves, etc.).
   */
  public log(_user: string, _role: string, _action: string): void {
    // Authoritative audit logging is performed exclusively server-side.
  }

  public async getAllLogs(): Promise<AuditLog[]> {
    return this.getLogs();
  }
}

const auditService = new AuditService();
export default auditService;
