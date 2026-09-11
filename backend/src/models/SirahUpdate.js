import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const SirahUpdate = mongoose.model('SirahUpdate', updateSchema);
