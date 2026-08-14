import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const client = new MongoClient(process.env.MONGODB_URI);
async function run() {
  await client.connect();
  const db = client.db('workforce');
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  await client.close();
}
run().catch(console.dir);
