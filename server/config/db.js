const mongoose = require("mongoose");

let cached = global._mongoConn;
if (!cached) cached = global._mongoConn = { conn: null, promise: null };

module.exports = async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
  }
  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
};
