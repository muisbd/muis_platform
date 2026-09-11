import mongoose from 'mongoose';

const salahSchema = new mongoose.Schema(
  {
    fajr: { type: String, enum: ['prayed', 'missed', 'qada', 'unset'], default: 'unset' },
    dhuhr: { type: String, enum: ['prayed', 'missed', 'qada', 'unset'], default: 'unset' },
    asr: { type: String, enum: ['prayed', 'missed', 'qada', 'unset'], default: 'unset' },
    maghrib: { type: String, enum: ['prayed', 'missed', 'qada', 'unset'], default: 'unset' },
    isha: { type: String, enum: ['prayed', 'missed', 'qada', 'unset'], default: 'unset' }
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true },
    salah: { type: salahSchema, default: () => ({}) },
    avoidedSin: { type: Boolean, default: false },
    avoidedSinNote: { type: String, default: '' },
    helpedSomeone: { type: Boolean, default: false },
    helpedSomeoneNote: { type: String, default: '' },
    productive: { type: Boolean, default: false },
    productivityScore: { type: Number, min: 1, max: 5, default: null },
    tahajjud: { type: Boolean, default: false },
    quranPages: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyProgress = mongoose.model('DailyProgress', progressSchema);
