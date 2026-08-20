import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Role from '../models/Role.js';

const seedRoles = async () => {
  await connectDB();

  const roles = [
    {
      name: "Admin",
      description: "System Administrator with full access to all modules and configurations.",
      permissions: ["read:all", "write:all", "delete:all", "manage:users", "manage:settings"]
    },
    {
      name: "HR",
      description: "Human Resources with access to employees, attendance, and reports.",
      permissions: ["read:employees", "write:employees", "read:attendance", "write:attendance", "read:reports"]
    },
    {
      name: "Manager",
      description: "Department Manager with access to their department's data.",
      permissions: ["read:department", "write:department", "read:team", "approve:leave", "approve:attendance"]
    },
    {
      name: "Employee",
      description: "Standard employee access.",
      permissions: ["read:self", "write:self", "request:leave", "log:attendance"]
    }
  ];

  for (const role of roles) {
    await Role.findOneAndUpdate({ name: role.name }, role, { upsert: true, new: true });
  }

  console.log("Roles seeded successfully.");
  process.exit(0);
};

seedRoles().catch((err) => {
  console.error("Error seeding roles:", err);
  process.exit(1);
});
