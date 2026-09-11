import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is missing. Copy backend/.env.example to backend/.env and add your Atlas URI.');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    family: 4,
    serverSelectionTimeoutMS: 20000
  });
  console.log('MongoDB connected');
}
