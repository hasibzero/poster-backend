import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './src/config/db';
import { Poster } from './src/models/Poster';

const fix = async () => {
  await connectDB();
  try {
    const res = await Poster.updateMany(
      { status: 'generating' },
      { $set: { status: 'failed', errorMessage: 'টেমপ্লেট মুছে ফেলা হয়েছে' } }
    );
    console.log(`Fixed ${res.modifiedCount} stuck posters.`);
  } catch (e) {
    console.error(e);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};
fix();
