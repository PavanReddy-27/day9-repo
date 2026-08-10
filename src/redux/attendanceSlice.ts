import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { attendanceApi } from '../services/attendanceApi';
import { AttendanceRecord, Location, ShiftType } from '../types/attendance';

export interface AttendanceState {
  todayRecord: AttendanceRecord | null;
  loading: boolean;
  error: string | null;
  offlineQueue: Record<string, unknown>[]; // For offline sync
}

const initialState: AttendanceState = {
  todayRecord: null,
  loading: false,
  error: null,
  offlineQueue: [],
};

export const fetchTodayRecord = createAsyncThunk(
  'attendance/fetchTodayRecord',
  async (employeeId: string) => {
    return await attendanceApi.getTodayRecord(employeeId);
  }
);

export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (payload: { employeeId: string, employeeName: string, location?: Location, shiftType?: ShiftType, department?: string, idempotencyKey?: string }) => {
    return await attendanceApi.checkIn(
      payload.employeeId, 
      payload.employeeName, 
      payload.location, 
      'Web', 
      payload.shiftType, 
      payload.idempotencyKey, 
      payload.department
    );
  }
);

export const startBreak = createAsyncThunk(
  'attendance/startBreak',
  async (employeeId: string) => {
    return await attendanceApi.startBreak(employeeId);
  }
);

export const endBreak = createAsyncThunk(
  'attendance/endBreak',
  async (employeeId: string) => {
    return await attendanceApi.endBreak(employeeId);
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (payload: { employeeId: string, location?: Location }) => {
    return await attendanceApi.checkOut(payload.employeeId, payload.location);
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    queueOfflineAction(state, action: PayloadAction<Record<string, unknown>>) {
      state.offlineQueue.push(action.payload);
    },
    clearOfflineQueue(state) {
      state.offlineQueue = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayRecord.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTodayRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.todayRecord = action.payload;
      })
      .addCase(fetchTodayRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch record';
      })
      .addCase(checkIn.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.todayRecord = action.payload;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Check in failed';
      })
      .addCase(startBreak.fulfilled, (state, action) => {
        state.todayRecord = action.payload;
      })
      .addCase(endBreak.fulfilled, (state, action) => {
        state.todayRecord = action.payload;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.todayRecord = action.payload;
      });
  },
});

export const { queueOfflineAction, clearOfflineQueue } = attendanceSlice.actions;
export default attendanceSlice.reducer;
