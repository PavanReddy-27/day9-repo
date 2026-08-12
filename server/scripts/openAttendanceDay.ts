/**
 * Daily attendance rollover / "open the day" maintenance script.
 *
 * In production, every calendar day naturally starts with no attendance record,
 * so each of the 250 employees can check in and out through the app. When a
 * dataset is seeded, however, the current day can end up pre-populated (e.g. as
 * "Checked Out"), which blocks real check-ins. This script safely clears ONLY
 * the target day's live attendance state so the day is open again.
 *
 * It is intentionally NON-destructive to history: it removes just the target
 * date's AttendanceRecords (plus that day's AttendanceEvents / BreakSessions),
 * leaving all prior days, employees, analytics, etc. untouched.
 *
 * Usage:
 *   npm run attendance:open-today                # opens today (UTC)
 *   npm run attendance:open-today -- --date=2026-08-12
 *   npm run attendance:open-today -- --dry-run   # report only, delete nothing
 *
 * Suitable to run as a daily cron just after midnight UTC.
 */
import "dotenv/config";
import mongoose from "mongoose";
import connectDB, { closeDB } from "../config/db.js";
import AttendanceRecord from "../models/AttendanceRecord.js";
import AttendanceEvent from "../models/AttendanceEvent.js";
import BreakSession from "../models/BreakSession.js";

const getArg = (name: string): string | undefined => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : undefined;
};
const hasFlag = (name: string): boolean => process.argv.includes(`--${name}`);

async function main() {
  const dryRun = hasFlag("dry-run");
  const date = getArg("date") ?? new Date().toISOString().split("T")[0];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`[open-day] Invalid --date "${date}". Expected YYYY-MM-DD.`);
    process.exit(1);
  }

  await connectDB();

  const recordCount = await AttendanceRecord.countDocuments({ date });
  console.log(`[open-day] Target date: ${date}`);
  console.log(`[open-day] AttendanceRecords on that date: ${recordCount}`);

  if (dryRun) {
    console.log("[open-day] --dry-run set; no changes made.");
    await closeDB();
    return;
  }

  // Collect the record ids for that day so we can also drop their child docs.
  const recs = await AttendanceRecord.find({ date }).select("_id").lean();
  const ids = recs.map((r: { _id: mongoose.Types.ObjectId }) => r._id);

  const [delRecords, delEvents, delBreaks] = await Promise.all([
    AttendanceRecord.deleteMany({ date }),
    ids.length ? AttendanceEvent.deleteMany({ attendanceRecordId: { $in: ids } }) : Promise.resolve({ deletedCount: 0 }),
    ids.length ? BreakSession.deleteMany({ attendanceRecordId: { $in: ids } }) : Promise.resolve({ deletedCount: 0 }),
  ]);

  console.log(`[open-day] Deleted AttendanceRecords : ${delRecords.deletedCount}`);
  console.log(`[open-day] Deleted AttendanceEvents  : ${(delEvents as { deletedCount: number }).deletedCount}`);
  console.log(`[open-day] Deleted BreakSessions     : ${(delBreaks as { deletedCount: number }).deletedCount}`);
  console.log(`[open-day] ${date} is now OPEN — all employees can check in / out.`);

  await closeDB();
}

main().catch(async (err) => {
  console.error("[open-day] Failed:", err);
  try {
    await closeDB();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
