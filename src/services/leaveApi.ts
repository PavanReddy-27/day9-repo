import { apiClient } from "./apiClient";

export interface LeaveRequestData {
  _id: string;
  type: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  employeeId: {
    _id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    departmentId: string;
  };
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApplyLeavePayload {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}

const leaveApi = {
  getLeaves: async (status?: string): Promise<LeaveRequestData[]> => {
    let url = "/leaves";
    if (status) {
      url += `?status=${encodeURIComponent(status)}`;
    }
    return apiClient<LeaveRequestData[]>(url);
  },

  applyLeave: async (payload: ApplyLeavePayload): Promise<LeaveRequestData> => {
    return apiClient<LeaveRequestData>("/leaves", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateLeaveStatus: async (
    id: string,
    status: "Approved" | "Rejected"
  ): Promise<LeaveRequestData> => {
    return apiClient<LeaveRequestData>(`/leaves/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

export default leaveApi;
