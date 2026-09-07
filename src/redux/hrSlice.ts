import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

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
  openPositions: [],
  leaveRequests: [],
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

export const selectRestrictedHROpenPositions = (state: RootState) => {
  const { openPositions } = state.hr;
  const { user } = state.auth;

  if (!user) return [];
  if (user.role === 'Admin' || user.role === 'HR') return openPositions;
  if (user.role === 'Manager') {
    return openPositions.filter((pos) => pos.department === user.department);
  }
  return [];
};

export default hrSlice.reducer;