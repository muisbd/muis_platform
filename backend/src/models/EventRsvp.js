import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    departmentYear: { type: String, required: true }
  },
  { timestamps: true }
);

rsvpSchema.index({ event: 1, email: 1 }, { unique: true });

export const EventRsvp = mongoose.model('EventRsvp', rsvpSchema);
