import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './src/config/db';
import { getLayoutSuggestions } from './src/services/gemini';

const test = async () => {
  await connectDB();
  try {
    console.log("Testing Gemini API...");
    const res = await getLayoutSuggestions({}, { name: 'test' }, 'victory');
    console.log("Gemini result:", res);
  } catch (e) {
    console.error("Gemini Error:", e);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};
test();
