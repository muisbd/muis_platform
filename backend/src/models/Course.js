import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String, default: 'Course' },
    duration: { type: String, default: '' },
    instructor: { type: String, default: '' },
    schedule: { type: String, default: '' },
    venue: { type: String, default: '' },
    description: { type: String, default: '' },
    summary: { type: String, default: '' },
    syllabus: [{ type: String }],
    archived: { type: Boolean, default: false },
    materialsAvailable: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Course = mongoose.model('Course', courseSchema);
