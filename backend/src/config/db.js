import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  if (!env.mongoUri) {
    console.warn('MONGODB_URI is missing. Backend running in standalone mode.');
    return;
  }
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, {
      family: 4,
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.warn('MongoDB connection warning:', err.message);
    console.warn('Backend server running on port ' + env.port + ' (Database disconnected)');
  }
}
