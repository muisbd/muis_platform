import mongoose from 'mongoose';

const nameStyleSchema = new mongoose.Schema(
  {
    scale: { type: Number, default: 1 },
    dx: { type: Number, default: 0 },
    dy: { type: Number, default: 0 }
  },
  { _id: false }
);

const seerahCertificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: String, default: 'seerah-2026', index: true },
    certName: { type: String, required: true, trim: true },
    email: { type: String, default: '', lowercase: true, trim: true },
    attendeeType: { type: String, enum: ['student', 'guest'], required: true },
    university: { type: String, default: '', trim: true },
    studentId: { type: String, default: '', trim: true },
    studentIdKey: { type: String, default: '', index: true },
    department: { type: String, default: '', trim: true },
    batch: { type: String, default: '', trim: true },
    guestNote: { type: String, default: '', trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    registeredVia: { type: String, enum: ['website', 'booth', 'not_sure'], default: 'not_sure' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revoked'],
      default: 'pending',
      index: true
    },
    reviewNote: { type: String, default: '', trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date },
    approvedAt: { type: Date },
    submitCount: { type: Number, default: 1 },
    nameStyle: { type: nameStyleSchema, default: null }
  },
  { timestamps: true }
);

seerahCertificateSchema.index({ user: 1, event: 1 }, { unique: true });

export const SeerahCertificate = mongoose.model('SeerahCertificate', seerahCertificateSchema);
