import type { AttendanceRecord } from "../types/attendance";

const STORAGE_KEY = "workforce_attendance";

const getStoredRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveRecords = (records: AttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const attendanceApi = {
  getTodayRecord: async (employeeId: string): Promise<AttendanceRecord | null> => {
    const records = getStoredRecords();
    const today = new Date().toISOString().split("T")[0];
    const record = records.find(r => r.employeeId === employeeId && r.date === today);
    return record || null;
  },

  checkIn: async (employeeId: string, employeeName: string): Promise<AttendanceRecord> => {
    const records = getStoredRecords();
    const today = new Date().toISOString().split("T")[0];
    
    if (records.some(r => r.employeeId === employeeId && r.date === today)) {
      throw new Error("Already checked in for today");
    }

    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      employeeName,
      date: today,
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      workingHours: 0,
      status: "Present",
    };

    records.push(newRecord);
    saveRecords(records);
    return newRecord;
  },

  checkOut: async (employeeId: string): Promise<AttendanceRecord> => {
    const records = getStoredRecords();
    const today = new Date().toISOString().split("T")[0];
    
    const index = records.findIndex(r => r.employeeId === employeeId && r.date === today);
    if (index === -1) {
      throw new Error("No active check-in found for today");
    }

    const record = records[index];
    if (record.checkOutTime) {
      throw new Error("Already checked out for today");
    }

    record.checkOutTime = new Date().toISOString();
    
    if (record.checkInTime) {
      const start = new Date(record.checkInTime).getTime();
      const end = new Date(record.checkOutTime).getTime();
      const hours = (end - start) / (1000 * 60 * 60);
      record.workingHours = Number(hours.toFixed(2));
    }

    saveRecords(records);
    return record;
  },

  getAllRecords: async (): Promise<AttendanceRecord[]> => {
    return getStoredRecords();
  },

  getTeamRecords: async (managerId: string): Promise<AttendanceRecord[]> => {
    // In a real app we'd filter by manager ID. Here we mock it by returning all for demo.
    return getStoredRecords();
  },

  getEmployeeRecords: async (employeeId: string): Promise<AttendanceRecord[]> => {
    const records = getStoredRecords();
    return records.filter(r => r.employeeId === employeeId);
  }
};
