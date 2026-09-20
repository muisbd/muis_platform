import mongoose from 'mongoose';

const sirahSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    department: { type: String, default: '', trim: true },
    batch: { type: String, default: '', trim: true },
    section: { type: String, default: '', trim: true },
    paymentMethod: { type: String, required: true, trim: true },
    trxId: { type: String, default: '', trim: true },
    paidTo: { type: String, default: '', trim: true },
    emailVerified: { type: Boolean, default: true },
    verifyCodeHash: { type: String, default: '' },
    verifyExpires: { type: Date },
    verifyAttempts: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending_verify', 'pending_review', 'accepted', 'rejected'],
      default: 'pending_review'
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ticketCode: { type: String, default: '' },
    adminNote: { type: String, default: '' }
  },
  { timestamps: true }
);

export const SirahRegistration = mongoose.model('SirahRegistration', sirahSchema);
