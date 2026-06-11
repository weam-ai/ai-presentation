import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/presentai';

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

// Cache the connection across hot-reloads (dev) and warm serverless invocations
// so we never open more than one connection per process.
const globalForMongoose = globalThis as typeof globalThis & {
    _mongoose?: MongooseCache;
};

const cache: MongooseCache = globalForMongoose._mongoose ?? { conn: null, promise: null };
globalForMongoose._mongoose = cache;

export async function connectDB(): Promise<typeof mongoose> {
    if (cache.conn) {
        return cache.conn;
    }

    if (!cache.promise) {
        cache.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
        });
    }

    try {
        cache.conn = await cache.promise;
    } catch (err) {
        cache.promise = null;
        throw err;
    }

    return cache.conn;
}
