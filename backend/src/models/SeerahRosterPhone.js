import mongoose from 'mongoose';

const rosterPhoneSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    source: { type: String, enum: ['booth', 'whatsapp'], default: 'booth' },
    unclear: { type: Boolean, default: false },
    note: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

export const SeerahRosterPhone = mongoose.model('SeerahRosterPhone', rosterPhoneSchema);
