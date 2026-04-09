import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("Digi Solutions MongoDB Connected Successfully");
  } catch (error) {
    console.error("DB Connection Error:", error);
  }
};
