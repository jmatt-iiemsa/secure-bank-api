// db/conn.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI || process.env.ATLAS_URI;
if (!uri) {
  console.error("❌ MongoDB URI not defined in .env (add MONGO_URI or ATLAS_URI)");
  process.exit(1);
}

export async function connectDB() {
  try {
    await mongoose.connect(uri, {
      // these options are defaults in modern mongoose; no need to pass the old flags
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message || err);
    process.exit(1);
  }
}
