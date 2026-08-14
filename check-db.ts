import mongoose from "mongoose";
import dotenv from "dotenv";
import { User, Employee, Company } from "./server/models/index.js";
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/workforce_db");
  const users = await User.find().limit(5).select("+password");
  console.log("Users:", users.map(u => ({ email: u.email, role: u.role, hash: u.password })));
  
  const emp = await Employee.findOne();
  console.log("Employee:", emp?.email);
  process.exit(0);
}
check();
