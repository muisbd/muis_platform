import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    unsubscribedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSchema);
