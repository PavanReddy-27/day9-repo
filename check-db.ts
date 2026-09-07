import dotenv from "dotenv";
import { connectDB } from "./server/config/db.js";
import { User, Employee, Company } from "./server/models/index.js";
dotenv.config();

async function check() {
  await connectDB();
  const users = await User.find().limit(5).select("+password");
  console.log("Users:", users.map(u => ({ email: u.email, role: u.role, hash: u.password })));
  
  const emp = await Employee.findOne();
  console.log("Employee:", emp?.email);
  process.exit(0);
}
check();
