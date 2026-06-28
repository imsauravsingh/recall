import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI =
  process.env.MONGODB_URI ?? process.env.mongodb_connection ?? "";

if (!MONGODB_URI) {
  throw new Error(
    "Missing MongoDB connection string. Set MONGODB_URI or mongodb_connection.",
  );
}

const cache = globalThis.mongooseCache ?? { conn: null, promise: null };
globalThis.mongooseCache = cache;

export async function connectMongoDB() {
  if (cache.conn) {
    return cache.conn;
  }

  cache.promise ??= mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  cache.conn = await cache.promise;
  return cache.conn;
}
