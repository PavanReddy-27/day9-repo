import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const client = new MongoClient(process.env.MONGODB_URI);
async function run() {
  await client.connect();
  const db = client.db('workforce');
  const doc = await db.collection('employeeauths').findOne();
  console.log('Document:', doc);
  await client.close();
}
run().catch(console.dir);
