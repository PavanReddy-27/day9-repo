import 'dotenv/config';
import connectDB, { closeDB } from '../config/db.js';
import Employee from '../models/Employee.js';
import AttendanceRecord from '../models/AttendanceRecord.js';

async function run() {
  await connectDB();
  const emp = await Employee.findOne({ firstName: 'Pavan' });
  console.log("Pavan Employee ID:", emp?._id);
  if (emp) {
    const records = await AttendanceRecord.find({ employeeId: emp._id } as any);
    const record = records[0];
    console.log("Pavan Latest Record:", record);
  }
  await closeDB();
}
run();
