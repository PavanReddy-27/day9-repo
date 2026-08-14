import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function drop() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/workforce_db");
  await mongoose.connection.db?.dropDatabase();
  console.log("Database dropped!");
  process.exit(0);
}
drop();
