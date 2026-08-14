import 'dotenv/config';
import mongoose from 'mongoose';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || '');
    console.log('Connected to DB');
    
    // Drop userId_1 if it exists
    await mongoose.connection.collection('employees').dropIndex('userId_1');
    console.log('Successfully dropped userId_1 index from employees');
  } catch (err) {
    console.log('Index might not exist or another error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
