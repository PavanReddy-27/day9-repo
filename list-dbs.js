import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const client = new MongoClient(process.env.MONGODB_URI);
async function run() {
  await client.connect();
  const dbs = await client.db().admin().listDatabases();
  console.log('Databases:', dbs.databases.map(db => db.name));
  await client.close();
}
run().catch(console.dir);
