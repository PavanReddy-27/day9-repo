// src/redux/hrSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface RecruitmentPosition {
  id: string;
  title: string;
  department: string;
  applicantsCount: number;
  status: 'Open' | 'Closed' | 'Interviewing';
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  type: 'Sick' | 'Casual' | 'Paid';
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface HRState {
  openPositions: RecruitmentPosition[];
  leaveRequests: LeaveRequest[];
  attritionRate: number;
  totalOnboarded: number;
}

const initialState: HRState = {
  openPositions: [
    { id: 'JOB-101', title: 'Frontend Developer', department: 'Engineering', applicantsCount: 24, status: 'Open' },
    { id: 'JOB-102', title: 'Data Analyst', department: 'Analytics', applicantsCount: 18, status: 'Interviewing' },
    { id: 'JOB-103', title: 'UI/UX Designer', department: 'Design', applicantsCount: 12, status: 'Open' },
  ],
  leaveRequests: [
    { id: 'LV-01', employeeName: 'Pavan Reddy', type: 'Casual', startDate: '2026-08-01', endDate: '2026-08-03', status: 'Pending' },
    { id: 'LV-02', employeeName: 'Ananya Verma', type: 'Sick', startDate: '2026-08-05', endDate: '2026-08-06', status: 'Pending' },
  ],
  attritionRate: 4.2,
  totalOnboarded: 38,
};

export const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    addPosition: (state, action: PayloadAction<RecruitmentPosition>) => {
      state.openPositions.push(action.payload);
    },
    updateLeaveStatus: (state, action: PayloadAction<{ id: string; status: 'Approved' | 'Rejected' }>) => {
      const request = state.leaveRequests.find((r) => r.id === action.payload.id);
      if (request) {
        request.status = action.payload.status;
      }
    },
  },
});

export const { addPosition, updateLeaveStatus } = hrSlice.actions;
export default hrSlice.reducer;