export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: number;
  status: "Present" | "Half-Day" | "Late" | "Absent" | "Leave";
}
