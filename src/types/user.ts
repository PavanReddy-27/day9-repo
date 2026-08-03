export interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  department?: string;
  status: "Active" | "Inactive";
}