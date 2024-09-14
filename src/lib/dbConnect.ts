import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI;

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

interface CachedConnection {
  conn: MongoConnection | null;
  promise: Promise<MongoClient> | null;
}

let cached: CachedConnection = (global as any).mongo

if (!cached) {
  cached = (global as any).mongo = { conn: null, promise: null }
}

export async function dbConnect(dbName: string): Promise<MongoConnection> {
  if (cached.conn && cached.conn.db.databaseName === dbName) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = MongoClient.connect(uri);
  }

  try {
    const client = await cached.promise;
    const db = client.db(dbName);
    cached.conn = { client, db };
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// // Optional: Log connection info
// dbConnect('princesofindia').then(({ client }) => {
//   const safeURI = `${uri.slice(0, 14)}****${uri.slice(30, 31)}****${uri.slice(47)}`;
//   console.log(`Connected to MongoDB 🌍 \nFull connection string: ${safeURI}`);
// }).catch(console.error);

export default dbConnect;