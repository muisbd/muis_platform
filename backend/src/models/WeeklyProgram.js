import mongoose from 'mongoose';

const weeklySchema = new mongoose.Schema({
  day: String,
  title: String,
  time: String,
  location: String,
  note: String
});

export const WeeklyProgram = mongoose.model('WeeklyProgram', weeklySchema);
