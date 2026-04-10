// mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from Environment Variables");
  }

  try {
    // useNewUrlParser සහ useUnifiedTopology විකල්ප අනිවාර්ය නොවුණත් එක් කිරීම සුදුසුයි
    await mongoose.connect(MONGODB_URI);
    console.log("Digi Solutions MongoDB Connected Successfully");
  } catch (error) {
    console.error("DB Connection Error Details:", error);
    throw error; // Error එක throw කිරීමෙන් Frontend එකට නිසි පණිවිඩයක් ලැබේ
  }
};
