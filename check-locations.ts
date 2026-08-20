import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('workforce');
    
    // Group by location
    const locationsCount = await db.collection('employees').aggregate([
      {
        $lookup: {
          from: 'locations',
          localField: 'locationId',
          foreignField: '_id',
          as: 'location'
        }
      },
      {
        $unwind: '$location'
      },
      {
        $group: {
          _id: '$location.name',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log('Employee count by location:');
    locationsCount.forEach(loc => console.log(`${loc._id}: ${loc.count}`));

    // Check for duplicate emails
    const duplicates = await db.collection('employees').aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    console.log(`\nDuplicate emails found: ${duplicates.length}`);
    if (duplicates.length > 0) console.log(duplicates);

    // Check for orphan records (e.g. invalid departmentId)
    const orphans = await db.collection('employees').aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'dept'
        }
      },
      { $match: { dept: { $size: 0 } } }
    ]).toArray();

    console.log(`\nOrphan employees (no valid department): ${orphans.length}`);

  } catch (error) {
    console.error('Error verifying database:', error);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
