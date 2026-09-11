import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001,https://muis-platform.vercel.app',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFrom: process.env.RESEND_FROM || 'MUIS <noreply@metrouni.edu.bd>',
  committeeEmail: process.env.COMMITTEE_NOTIFY_EMAIL || 'muis@metrouni.edu.bd',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  adminName: process.env.ADMIN_NAME || 'MUIS Admin',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminStudentId: process.env.ADMIN_STUDENT_ID || 'ADMIN-001'
};
