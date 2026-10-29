import mongoose from 'mongoose';

const emailCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// Keep rows for a day so the daily sending limit can be counted, then let MongoDB delete them.
emailCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

export const EmailCode = mongoose.model('EmailCode', emailCodeSchema);
