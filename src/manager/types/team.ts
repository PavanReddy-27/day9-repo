export interface TeamMember {
  id: string | number;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  attendance: "Present" | "Absent" | "Leave";
  performance: "Excellent" | "Good" | "Average";
  risk: "Low" | "Medium" | "High" | "Critical";
  experience: number;
  productivity: number;
  avatar: string;
}
