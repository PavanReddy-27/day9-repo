import { apiClient } from "./apiClient";

export interface PayrollPeriod {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface PayrollRecord {
  _id: string;
  periodId: PayrollPeriod;
  employeeId: string | any;
  payableDays: number;
  regularHours: number;
  overtimeHours: number;
  unpaidLeaveDays: number;
  baseSalary: number;
  shiftAllowance: number;
  deductions: number;
  netSalary: number;
  status: string;
}

const payrollApi = {
  getMyPay: async () => {
    const data = await apiClient<PayrollRecord[]>("/payroll/my-pay");
    return data;
  },

  getPayrollPeriods: async () => {
    const data = await apiClient<PayrollPeriod[]>("/payroll/periods");
    return data;
  },

  getRecordsForPeriod: async (periodId: string) => {
    const data = await apiClient<PayrollRecord[]>(`/payroll/period/${periodId}/records`);
    return data;
  },

  calculatePayroll: async (data: { companyId: string; name: string; startDate: string; endDate: string }) => {
    const res = await apiClient("/payroll/calculate", {
      method: "POST",
      body: JSON.stringify(data)
    });
    return res;
  },

  adjustRecord: async (recordId: string, data: Partial<PayrollRecord>) => {
    const res = await apiClient(`/payroll/record/${recordId}/adjust`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    return res;
  },

  lockPeriod: async (periodId: string, userId: string) => {
    const res = await apiClient(`/payroll/period/${periodId}/lock`, {
      method: "POST",
      body: JSON.stringify({ userId })
    });
    return res;
  },

  unlockPeriod: async (periodId: string, userId: string) => {
    const res = await apiClient(`/payroll/period/${periodId}/unlock`, {
      method: "POST",
      body: JSON.stringify({ userId })
    });
    return res;
  },

  exportCsv: async (periodId: string, scope: 'all' | 'me' = 'all') => {
    await downloadExport(periodId, 'csv', scope);
  },

  exportJson: async (periodId: string, scope: 'all' | 'me' = 'all') => {
    await downloadExport(periodId, 'json', scope);
  },

  getExportData: async (periodId: string, scope: 'all' | 'me' = 'all'): Promise<any[]> => {
    const url = `/payroll/period/${periodId}/export?format=json&scope=${scope}`;
    const data = await apiClient<any>(url);
    // Handle new wrapped { employees: [] } format, or fallback to raw array
    if (data && Array.isArray(data.employees)) return data.employees;
    if (Array.isArray(data)) return data;
    return [];
  }
};

async function downloadExport(periodId: string, format: string, scope: string) {
  try {
    const url = `/payroll/period/${periodId}/export?format=${format}&scope=${scope}`;
    const data = await apiClient<any>(url);

    let content: string;
    let type: string;

    if (format === 'csv') {
      content = typeof data === 'string' ? data : JSON.stringify(data);
      type = 'text/csv';
    } else {
      content = JSON.stringify(data, null, 2);
      type = 'application/json';
    }

    const blob = new Blob([content], { type });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `payroll_export_${periodId}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err: any) {
    console.error("Export error", err);
    alert("Export failed: " + (err?.message || 'Unknown error'));
  }
}

export default payrollApi;
