import mongoose from 'mongoose';
import { config } from './index';

export const connectDB = async (): Promise<void> => {
  const MAX_RETRIES = 5;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(config.mongodb.uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}):`, (error as Error).message);
      if (attempt === MAX_RETRIES) {
        console.error('All connection attempts failed. Exiting.');
        process.exit(1);
      }
      const delay = attempt * 3000;
      console.log(`Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('MongoDB Disconnected');
};