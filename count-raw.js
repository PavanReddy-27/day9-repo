import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const client = new MongoClient(process.env.MONGODB_URI);
async function run() {
  await client.connect();
  const db = client.db('workforce');
  const count = await db.collection('users').countDocuments();
  console.log('Raw user count:', count);
  await client.close();
}
run().catch(console.dir);
