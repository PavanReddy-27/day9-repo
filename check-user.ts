import dotenv from "dotenv";
import { connectDB, closeDB } from "./server/config/db.js";
import { User } from "./server/models/index.js";
dotenv.config();

async function check() {
  await connectDB();
  const user = await User.findOne({ email: "admin@company.com" }).select("+password");
  console.log("User:", user?.email, "Hash:", user?.password);
  if (user) {
    const isMatch = await user.matchPassword("Password123!");
    console.log("Password123! Match?", isMatch);
  }
  await closeDB();
  process.exit(0);
}
check();
