import bcrypt from "bcryptjs";
import connectDB, { closeDB } from "../config/db.js";
import mongoose from "mongoose";
import Company from "../models/Company.js";
import Employee from "../models/Employee.js";
import { User, AdminAuth, HRAuth, ManagerAuth, EmployeeAuth } from "../models/User.js";

const DEFAULT_PASSWORD = "Password123!";

/**
 * Deduplicates and cleans the `users` collection so that it contains
 * EXACTLY 250 accounts matching the 250 seeded employees 1-to-1.
 */
export async function cleanAndDeduplicateUsers(shouldCloseDB = false) {
  console.log("\n[User Cleaner] Starting user cleanup and deduplication...");
  await connectDB();

  const initialUserCount = await User.countDocuments();
  const initialEmpCount = await Employee.countDocuments();
  console.log(`[User Cleaner] Current counts -> Users: ${initialUserCount}, Employees: ${initialEmpCount}`);

  // 1. Fetch all existing employees
  const employees = await Employee.find({}).lean();
  if (employees.length === 0) {
    console.warn("[User Cleaner] No employees found. Nothing to clean.");
    if (shouldCloseDB) await closeDB();
    return;
  }

  console.log(`[User Cleaner] Found ${employees.length} employees to reconcile against.`);

  // 2. Fetch all users
  const allUsers = await User.find({}).lean();
  console.log(`[User Cleaner] Found ${allUsers.length} total user accounts in database.`);

  const validEmployeeIds = new Set(employees.map((e) => e.employeeId));
  const validEmails = new Set(employees.map((e) => e.email?.toLowerCase()));

  // Map of employeeId -> User document we will KEEP
  const keptUsersByEmpId = new Map<string, any>();
  const usersToDelete = new Set<string>();

  // 3. Identify keeper vs duplicates/orphans
  for (const user of allUsers) {
    const empId = user.employeeId;
    const email = user.email?.toLowerCase();

    // Check if orphan (not part of the 250 employees)
    if (!validEmployeeIds.has(empId) && !validEmails.has(email)) {
      usersToDelete.add(user._id.toString());
      continue;
    }

    // Determine normalized empId
    const matchingEmp = employees.find(
      (e) => e.employeeId === empId || e.email?.toLowerCase() === email
    );

    if (!matchingEmp) {
      usersToDelete.add(user._id.toString());
      continue;
    }

    const key = matchingEmp.employeeId;

    if (!keptUsersByEmpId.has(key)) {
      // First one seen for this employee: KEEP
      keptUsersByEmpId.set(key, user);
    } else {
      // Duplicate entry for this employee: DELETE
      usersToDelete.add(user._id.toString());
    }
  }

  // 4. Delete duplicates and orphans
  if (usersToDelete.size > 0) {
    console.log(`[User Cleaner] Deleting ${usersToDelete.size} duplicate or orphan user documents...`);
    const deleteIds = Array.from(usersToDelete).map((id) => new mongoose.Types.ObjectId(id));
    await User.deleteMany({ _id: { $in: deleteIds } });
  }

  // 5. Ensure every employee has exactly one user account
  const company = (await Company.findOne({ code: "STACKLY" })) || (await Company.findOne({}));
  let createdCount = 0;

  for (const emp of employees) {
    let existingUser = keptUsersByEmpId.get(emp.employeeId);

    if (!existingUser) {
      // Create missing user
      const role = emp.role || "Employee";
      const email = emp.email?.toLowerCase() || `${role.toLowerCase()}${emp.employeeId}@thestackly.com`;

      const roleAuthModel: Record<string, any> = {
        Admin: AdminAuth,
        HR: HRAuth,
        Manager: ManagerAuth,
        Employee: EmployeeAuth,
      };
      const AuthModel = roleAuthModel[role] || EmployeeAuth;

      existingUser = await AuthModel.create({
        companyId: emp.companyId || company?._id,
        employeeId: emp.employeeId,
        email: email,
        password: DEFAULT_PASSWORD,
        role: role,
        isActive: emp.employmentStatus !== "Inactive",
      });

      keptUsersByEmpId.set(emp.employeeId, existingUser);
      createdCount++;
    }

    // Ensure employee.userId is correctly wired
    if (!emp.userId || emp.userId.toString() !== existingUser._id.toString()) {
      await Employee.updateOne(
        { _id: emp._id },
        { $set: { userId: existingUser._id } }
      );
    }
  }

  if (createdCount > 0) {
    console.log(`[User Cleaner] Created ${createdCount} missing user accounts.`);
  }

  // 6. Clean legacy separate collections if they exist in MongoDB
  try {
    const rawDb = mongoose.connection.db;
    const collections = await rawDb.listCollections().toArray();
    const legacyNames = ["adminauths", "hrauths", "managerauths", "employeeauths", "teamleadauths"];

    for (const c of collections) {
      if (legacyNames.includes(c.name.toLowerCase()) && c.name !== "users") {
        console.log(`[User Cleaner] Dropping legacy collection: ${c.name}`);
        await rawDb.collection(c.name).drop().catch(() => {});
      }
    }
  } catch (err: any) {
    console.warn(`[User Cleaner] Notice on legacy collections: ${err.message}`);
  }

  // 7. Enforce unique indexes on users collection
  try {
    await User.collection.createIndex(
      { companyId: 1, email: 1 },
      { unique: true, name: "companyId_1_email_1" }
    );
    await User.collection.createIndex(
      { companyId: 1, employeeId: 1 },
      { unique: true, name: "companyId_1_employeeId_1" }
    );
    console.log("[User Cleaner] Verified compound unique indexes on users collection.");
  } catch (idxErr: any) {
    console.warn(`[User Cleaner] Index note: ${idxErr.message}`);
  }

  // 8. Final verification
  const finalUserCount = await User.countDocuments();
  const finalEmpCount = await Employee.countDocuments();
  console.log(`\n=================== CLEANUP SUMMARY ===================`);
  console.log(`Initial Users : ${initialUserCount}`);
  console.log(`Deleted Users : ${usersToDelete.size}`);
  console.log(`Created Users : ${createdCount}`);
  console.log(`Final Users   : ${finalUserCount} (Target: 250)`);
  console.log(`Employees     : ${finalEmpCount} (Target: 250)`);
  console.log(`=======================================================\n`);

  if (finalUserCount === 250) {
    console.log("✅ SUCCESS: Exactly 250 users verified in database!");
  } else {
    console.warn(`⚠️ Warning: Final user count is ${finalUserCount} (expected 250).`);
  }

  if (shouldCloseDB) {
    await closeDB();
  }

  return { initialUserCount, finalUserCount, deleted: usersToDelete.size, created: createdCount };
}

// CLI direct runner
if (process.argv[1]?.includes("cleanUsers.ts")) {
  cleanAndDeduplicateUsers(true)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[User Cleaner] Fatal Error:", err);
      process.exit(1);
    });
}
