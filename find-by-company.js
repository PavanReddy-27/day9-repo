import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const client = new MongoClient(process.env.MONGODB_URI);
async function run() {
  await client.connect();
  const db = client.db('workforce');
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    if (c.name === 'employees') continue; // we know employees works
    const count = await db.collection(c.name).countDocuments({ companyId: new ObjectId('6a7d6160c340d83eeccbd380') });
    if (count > 0) {
      console.log(`Collection ${c.name} has ${count} docs for today's companyId`);
    }
  }
  await client.close();
}
run().catch(console.dir);
