import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB, { closeDB } from "../config/db.js";
import Employee from "../models/Employee.js";
import Company from "../models/Company.js";
import Location from "../models/Location.js";
import Department from "../models/Department.js";
import Team from "../models/Team.js";

dotenv.config();

async function runVerification() {
  console.log("Starting DB Verification...");
  await connectDB();

  // 1. Total Employee Count
  const totalEmployees = await Employee.countDocuments();
  console.log(`\nTotal Employee Count: ${totalEmployees} (Expected: 250)`);
  if (totalEmployees !== 250) {
    console.error(`ERROR: Expected 250 employees but found ${totalEmployees}`);
  }

  // 2. Location-wise counts
  console.log("\nLocation-wise counts:");
  const locCounts = await Employee.aggregate([
    { $group: { _id: "$locationCode", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  const expectedLocs: Record<string, number> = { "HYD": 70, "VSP": 40, "CHN": 50, "BLR": 60, "KOC": 30 };
  for (const loc of locCounts) {
    const expected = expectedLocs[loc._id];
    console.log(`${loc._id}: ${loc.count} (Expected: ${expected})`);
    if (loc.count !== expected) {
      console.error(`ERROR: Location ${loc._id} count mismatch!`);
    }
  }

  // 3. Duplicate checks
  console.log("\nChecking for duplicates...");
  const dupIds = await Employee.aggregate([
    { $group: { _id: "$employeeId", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  const dupEmails = await Employee.aggregate([
    { $group: { _id: "$email", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  if (dupIds.length > 0) {
    console.error("ERROR: Duplicate Employee IDs found:", dupIds);
  } else {
    console.log("Zero duplicate Employee IDs.");
  }

  if (dupEmails.length > 0) {
    console.error("ERROR: Duplicate Emails found:", dupEmails);
  } else {
    console.log("Zero duplicate Emails.");
  }

  // 4. Orphan checks
  console.log("\nChecking for orphans...");
  let orphans = 0;
  const employees = await Employee.find({});
  for (const emp of employees) {
    const company = await Company.findById(emp.companyId);
    const location = await Location.findById(emp.locationId);
    const department = await Department.findById(emp.departmentId);
    const team = await Team.findById(emp.teamId);

    if (!company || !location || !department || !team) {
      orphans++;
    }
  }
  if (orphans > 0) {
    console.error(`ERROR: ${orphans} orphan records found!`);
  } else {
    console.log("Zero orphaned records found.");
  }

  // 5. Indexes
  console.log("\nListing database indexes for collections:");
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    const indexes = await collection.indexes();
    console.log(`\nCollection: ${collection.collectionName}`);
    indexes.forEach((idx: any) => {
      console.log(`  - ${idx.name} (Unique: ${idx.unique ? "Yes" : "No"})`);
      console.log(`    Keys: ${JSON.stringify(idx.key)}`);
    });
  }

  await closeDB();
  console.log("\nVerification complete.");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
