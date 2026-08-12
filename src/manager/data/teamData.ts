export interface TeamMember {
  id: number;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  attendance: "Present" | "Absent" | "Leave";
  performance: "Excellent" | "Good" | "Average";
  risk: "Low" | "Medium" | "High";
  experience: number;
  productivity: number;
  avatar: string;
}