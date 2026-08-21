import connectDB from './server/config/db.js';
import { ManagerAuth } from './server/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  process.env.USE_IN_MEMORY_DB = 'true';
  await connectDB();
  const user = await ManagerAuth.findOne({ email: 'manager@thestackly.com' });
  console.log('User:', user);
  process.exit(0);
}
test();
