export type Role =
  | "admin"
  | "hr"
  | "manager"
  | "analyst";

export type Permission =
  | "dashboard:view"
  | "workforce:view"
  | "employees:view"
  | "reports:view"
  | "settings:view";

export interface User {
  id: string;
  name: string;
  role: Role;
}