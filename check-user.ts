import dotenv from "dotenv";
import { connectDB, closeDB } from "./server/config/db.js";
import { User } from "./server/models/index.js";
dotenv.config();

async function check() {
  await connectDB();
  const checkEmail = process.env.ADMIN_EMAIL || "admin@thestackly.com";
  const user = await User.findOne({ 
    $or: [{ email: checkEmail }, { email: "admin@company.com" }] 
  }).select("+password");
  const testPassword = process.env.SEED_PASSWORD || process.env.DEFAULT_PASSWORD || "Password123!";
  console.log("User:", user?.email, "Hash:", user?.password);
  if (user) {
    const isMatch = await user.matchPassword(testPassword);
    console.log(`Password match with configured password:`, isMatch);
  }
  await closeDB();
  process.exit(0);
}
check();
