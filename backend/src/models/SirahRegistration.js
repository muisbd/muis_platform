import mongoose from 'mongoose';

const sirahSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    paymentMethod: { type: String, required: true, trim: true },
    trxId: { type: String, required: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    verifyCodeHash: { type: String, default: '' },
    verifyExpires: { type: Date },
    verifyAttempts: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending_verify', 'pending_review', 'accepted', 'rejected'],
      default: 'pending_verify'
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ticketCode: { type: String, default: '' },
    adminNote: { type: String, default: '' }
  },
  { timestamps: true }
);

export const SirahRegistration = mongoose.model('SirahRegistration', sirahSchema);
