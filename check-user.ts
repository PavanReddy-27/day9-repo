import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./server/models/index.js";
import { verifyPassword } from "./server/middleware/auth.js";
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/workforce_db");
  const user = await User.findOne({ email: "admin@company.com" }).select("+password");
  console.log("User:", user?.email, "Hash:", user?.password);
  if (user) {
    const isMatch = await verifyPassword("Password123!", user.password);
    console.log("Password123! Match?", isMatch);
  }
  process.exit(0);
}
check();
