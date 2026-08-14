import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./server/models/index.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const count = await User.countDocuments();
  console.log(`User count: ${count}`);
  mongoose.disconnect();
}).catch(console.error);
