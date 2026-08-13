import authApi from "./authApi";

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
    let url = "/api/v1/leaves";
    if (status) {
      url += `?status=${encodeURIComponent(status)}`;
    }
    const token = authApi.getAccessToken();
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch leave requests");
    }
    return response.json();
  },

  applyLeave: async (payload: ApplyLeavePayload): Promise<LeaveRequestData> => {
    const token = authApi.getAccessToken();
    const response = await fetch("/api/v1/leaves", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to apply for leave");
    }
    return response.json();
  },

  updateLeaveStatus: async (
    id: string,
    status: "Approved" | "Rejected"
  ): Promise<LeaveRequestData> => {
    const token = authApi.getAccessToken();
    const response = await fetch(`/api/v1/leaves/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update leave status");
    }
    return response.json();
  },
};

export default leaveApi;
