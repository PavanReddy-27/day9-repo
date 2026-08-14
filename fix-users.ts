import mongoose from "mongoose";
import dotenv from "dotenv";
import { User, Employee } from "./server/models/index.js";
import argon2 from "argon2";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Clear existing users
  await User.deleteMany({});
  
  const employees = await Employee.find({});
  console.log(`Found ${employees.length} employees.`);
  
  // Hash the password that the frontend expects
  const passwordHash = await argon2.hash("Password123!");
  
  const usersToInsert = employees.map(emp => ({
    _id: emp.userId,
    companyId: emp.companyId,
    employeeId: emp.employeeId,
    email: emp.email,
    password: passwordHash,
    role: emp.role
  }));
  
  if (usersToInsert.length > 0) {
    await User.insertMany(usersToInsert);
    console.log(`Inserted ${usersToInsert.length} users into 'users' collection with password 'Password123!'.`);
  }
  
  const userCount = await User.countDocuments();
  console.log(`Current users count: ${userCount}`);
  
  await mongoose.disconnect();
}

run().catch(console.error);
