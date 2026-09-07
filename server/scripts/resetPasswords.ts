/**
 * Resets every auth account's password to a single known dev password so the
 * app is usable after a re-seed left credentials in an unknown state.
 *
 * - Hashes with Argon2id (matches the login matchPassword() argon2 branch and
 *   the Phase-3 hashing requirement).
 * - Uses updateMany (bypasses the bcrypt pre-save hook) so the stored value is
 *   exactly the argon2id hash.
 * - Only touches the `password` field; emails, roles, employeeIds are untouched.
 *
 * Usage:
 *   npm run reset:passwords                 # sets Password123!
 *   npm run reset:passwords -- --password=Custom@123
 */
import "dotenv/config";
import * as argon2 from "argon2";
import connectDB, { closeDB } from "../config/db.js";
import { AdminAuth, HRAuth, ManagerAuth, EmployeeAuth, User } from "../models/User.js";

const getArg = (name: string, fallback: string): string => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : fallback;
};

async function main() {
  const password = getArg("password", "Password123!");
  await connectDB();

  const hash = await argon2.hash(password, { type: argon2.argon2id });

  const collections = [
    ["Admin", AdminAuth],
    ["HR", HRAuth],
    ["Manager", ManagerAuth],
    ["Employee", EmployeeAuth],
    ["User", User],
  ] as const;

  let total = 0;
  for (const [label, Model] of collections) {
    const res = await Model.updateMany({}, { $set: { password: hash, isActive: true } });
    console.log(`[reset-pw] ${label.padEnd(10)} updated: ${res.modifiedCount}`);
    total += res.modifiedCount;
  }
  console.log(`[reset-pw] Done. ${total} accounts now use password: ${password}`);
  await closeDB();
}

main().catch(async (err) => {
  console.error("[reset-pw] Failed:", err);
  try {
    await closeDB();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
