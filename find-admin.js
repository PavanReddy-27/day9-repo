import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const client = new MongoClient(process.env.MONGODB_URI);
async function run() {
  await client.connect();
  const db = client.db('workforce');
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const doc = await db.collection(c.name).findOne({ email: 'admin@company.com' });
    if (doc) {
      console.log(`Found in collection: ${c.name}`, doc);
    }
  }
  await client.close();
}
run().catch(console.dir);
