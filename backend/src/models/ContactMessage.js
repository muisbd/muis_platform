import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, default: 'General Inquiry' },
    message: { type: String, required: true },
    handled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ContactMessage = mongoose.model('ContactMessage', contactSchema);
