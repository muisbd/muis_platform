import mongoose from 'mongoose';

const committeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  dept: { type: String, default: '' },
  avatar: { type: String, default: '/MUIIS_DP-01.png' },
  quote: { type: String, default: '' },
  order: { type: Number, default: 0 }
});

export const CommitteeMember = mongoose.model('CommitteeMember', committeeSchema);
