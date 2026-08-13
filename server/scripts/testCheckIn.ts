import 'dotenv/config';
import connectDB, { closeDB } from '../config/db.js';
import { checkIn } from '../controllers/attendanceController.js';

async function run() {
  await connectDB();
  
  // Create a mock req and res for Pavan
  const req = {
    companyId: '6a7dd1a84010c27b84157e02',
    employee: {
      _id: '6a7dd1a94010c27b84157e80', // Pavan's ID
      locationId: '6a7dd1a84010c27b84157e17',
      workMode: 'Office'
    },
    body: {
      location: { latitude: 14.48, longitude: 78.83 },
      source: 'Web',
      shiftType: 'Regular',
      idempotencyKey: 'test-key-' + Date.now()
    }
  };

  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log('Response Code:', this.statusCode);
      console.log('Response Data:', data);
    }
  };

  await checkIn(req, res);
  await closeDB();
}

run();
