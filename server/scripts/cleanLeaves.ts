import 'dotenv/config';
import mongoose from 'mongoose';
import LeaveRequest from '../models/LeaveRequest.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || '');
    console.log('Connected to DB');
    
    const res = await LeaveRequest.deleteMany({});
    console.log(`Successfully deleted ${res.deletedCount} orphaned leave requests`);
  } catch (err) {
    console.log('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
