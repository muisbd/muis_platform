import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    method: { type: String, required: true },
    trxId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    amount: { type: String, default: '' },
    verified: { type: String, enum: ['pending', 'matched', 'rejected'], default: 'pending' },
    adminNote: { type: String, default: '' }
  },
  { timestamps: true }
);

export const DonationConfirmation = mongoose.model('DonationConfirmation', donationSchema);
