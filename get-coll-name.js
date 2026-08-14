import mongoose from "mongoose";
import dotenv from "dotenv";
import { User, Employee } from "./server/models/index.js";

dotenv.config();
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("User collection:", User.collection.name);
  console.log("Employee collection:", Employee.collection.name);
  mongoose.disconnect();
}).catch(console.error);
