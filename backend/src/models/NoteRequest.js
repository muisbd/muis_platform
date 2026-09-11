import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    courseTitle: { type: String, required: true },
    email: { type: String, default: '' },
    name: { type: String, default: '' },
    handled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const NoteRequest = mongoose.model('NoteRequest', noteSchema);
