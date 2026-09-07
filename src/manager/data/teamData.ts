export interface TeamMember {
    id: number | string;
    employeeId: string;
    name: string;
    designation: string;
    department: string;
    location?: string;
    email: string;
    phone: string;
    attendance: "Present" | "Absent" | "Leave" | "On Leave" | "Late";
    performance: "Excellent" | "Good" | "Average" | "Needs Improvement";
    risk: "Low" | "Medium" | "High";
    experience?: number;
    productivity: number;
    avatar: string;
  }
  
  export const teamData: TeamMember[] = [
    {
      id: 1,
      employeeId: "EMP001",
      name: "Rahul Sharma",
      designation: "Senior React Developer",
      department: "Engineering",
      email: "rahul.sharma@company.com",
      phone: "+91 9876543210",
      attendance: "Present",
      performance: "Excellent",
      risk: "Low",
      experience: 6,
      productivity: 96,
      avatar: "RS",
    },
    {
      id: 2,
      employeeId: "EMP002",
      name: "Priya Patel",
      designation: "UI/UX Designer",
      department: "Engineering",
      email: "priya.patel@company.com",
      phone: "+91 9876543211",
      attendance: "Present",
      performance: "Excellent",
      risk: "Low",
      experience: 5,
      productivity: 94,
      avatar: "PP",
    },
    {
      id: 3,
      employeeId: "EMP003",
      name: "Anil Kumar",
      designation: "Backend Developer",
      department: "Engineering",
      email: "anil.kumar@company.com",
      phone: "+91 9876543212",
      attendance: "Leave",
      performance: "Good",
      risk: "Medium",
      experience: 4,
      productivity: 88,
      avatar: "AK",
    },
    {
      id: 4,
      employeeId: "EMP004",
      name: "Sneha Reddy",
      designation: "QA Engineer",
      department: "Engineering",
      email: "sneha.reddy@company.com",
      phone: "+91 9876543213",
      attendance: "Present",
      performance: "Excellent",
      risk: "Low",
      experience: 3,
      productivity: 91,
      avatar: "SR",
    },
    {
      id: 5,
      employeeId: "EMP005",
      name: "Vikram Singh",
      designation: "DevOps Engineer",
      department: "Engineering",
      email: "vikram.singh@company.com",
      phone: "+91 9876543214",
      attendance: "Absent",
      performance: "Average",
      risk: "High",
      experience: 7,
      productivity: 72,
      avatar: "VS",
    },
    {
      id: 6,
      employeeId: "EMP006",
      name: "Neha Verma",
      designation: "Business Analyst",
      department: "Engineering",
      email: "neha.verma@company.com",
      phone: "+91 9876543215",
      attendance: "Present",
      performance: "Good",
      risk: "Low",
      experience: 4,
      productivity: 89,
      avatar: "NV",
    },
    {
      id: 7,
      employeeId: "EMP007",
      name: "Karthik Rao",
      designation: "Software Engineer",
      department: "Engineering",
      email: "karthik.rao@company.com",
      phone: "+91 9876543216",
      attendance: "Present",
      performance: "Excellent",
      risk: "Low",
      experience: 2,
      productivity: 93,
      avatar: "KR",
    },
    {
      id: 8,
      employeeId: "EMP008",
      name: "Ayesha Khan",
      designation: "Frontend Developer",
      department: "Engineering",
      email: "ayesha.khan@company.com",
      phone: "+91 9876543217",
      attendance: "Leave",
      performance: "Good",
      risk: "Medium",
      experience: 3,
      productivity: 85,
      avatar: "AK",
    },
  ];