/**
 * Idempotent index-repair for collections that carry stale UNIQUE indexes left
 * behind by earlier schema versions. A unique index that includes documents
 * where the field is null/absent lets only ONE such document exist in the whole
 * collection; every later insert fails with E11000 (often swallowed), silently
 * breaking attendance events and idempotency persistence.
 *
 * Fixes applied (all safe to run repeatedly):
 *   1. attendanceevents.idempotencyKey  -> partial unique (string keys only)
 *   2. idempotencyrecords.key_1         -> drop (renamed field; superseded by
 *                                          companyId_1_idempotencyKey_1)
 *
 * Usage: npm run fix:indexes
 */
import "dotenv/config";
import connectDB, { closeDB } from "../config/db.js";
import AttendanceEvent from "../models/AttendanceEvent.js";
import IdempotencyRecord from "../models/IdempotencyRecord.js";

async function repairAttendanceEvents() {
  const coll = AttendanceEvent.collection;
  const indexes = await coll.indexes();
  const bad = indexes.find((i) => i.name === "idempotencyKey_1" && i.unique && !i.partialFilterExpression);
  if (bad) {
    console.log("[repair] attendanceevents: dropping stale full-unique idempotencyKey_1 ...");
    await coll.dropIndex("idempotencyKey_1");
  }
  await coll.createIndex(
    { idempotencyKey: 1 },
    { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } }, name: "idempotencyKey_1" }
  );
  console.log("[repair] attendanceevents: idempotencyKey is now partial-unique.");
}

async function repairIdempotencyRecords() {
  const coll = IdempotencyRecord.collection;
  const indexes = await coll.indexes();
  const stale = indexes.find((i) => i.name === "key_1");
  if (stale) {
    console.log("[repair] idempotencyrecords: dropping stale unique index key_1 (field no longer exists) ...");
    await coll.dropIndex("key_1");
  } else {
    console.log("[repair] idempotencyrecords: no stale key_1 index.");
  }
  // Ensure the correct compound unique index exists.
  await coll.createIndex({ companyId: 1, idempotencyKey: 1 }, { unique: true });
  console.log("[repair] idempotencyrecords: companyId+idempotencyKey unique index ensured.");
}

async function main() {
  await connectDB();
  await repairAttendanceEvents();
  await repairIdempotencyRecords();
  console.log("[repair] Done.");
  await closeDB();
}

main().catch(async (err) => {
  console.error("[repair] Failed:", err);
  try {
    await closeDB();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
