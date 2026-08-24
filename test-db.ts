import connectDB from './server/config/db.js';
import mongoose from 'mongoose';
import Company from './server/models/Company.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  process.env.USE_IN_MEMORY_DB = 'true';
  await connectDB();
  console.log('Connected.');
  console.log('Finding company...');
  const c = await Company.findOne({ code: 'STACKLY' });
  console.log('Company:', c);
  process.exit(0);
}
test();
