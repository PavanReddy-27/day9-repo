// ====================================
// File: src/services/auditService.ts
// ====================================

export interface AuditLog {
  id: number;
  user: string;
  role: string;
  action: string;
  date: string;
  timestamp: number;
}

const AUDIT_STORAGE_KEY = "workforce_audit_logs";

class AuditService {
  private getLogs(): AuditLog[] {
    const data = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private saveLogs(logs: AuditLog[]): void {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
  }

  public log(user: string, role: string, action: string): void {
    const logs = this.getLogs();
    
    // Formatting date to matching format DD-MM-YYYY HH:mm:ss for better UI reading
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newLog: AuditLog = {
      id: Date.now(), // simple unique id
      user,
      role,
      action,
      date: dateStr,
      timestamp: Date.now(),
    };

    // Keep the latest 100 logs
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    this.saveLogs(updatedLogs);
  }

  public getAllLogs(): AuditLog[] {
    return this.getLogs();
  }

  public clearLogs(): void {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  }
}

const auditService = new AuditService();
export default auditService;
