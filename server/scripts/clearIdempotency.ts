import 'dotenv/config';
import connectDB, { closeDB } from '../config/db.js';
import IdempotencyRecord from '../models/IdempotencyRecord.js';

async function run() {
  try {
    await connectDB();
    console.log("Connected to MongoDB...");

    console.log("Deleting all Idempotency Records...");
    const res = await IdempotencyRecord.deleteMany({});
    console.log(`Deleted ${res.deletedCount} idempotency records.`);

    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await closeDB();
  }
}
run();
