import mongoose from 'mongoose';

const enrollSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    departmentSemester: { type: String, required: true }
  },
  { timestamps: true }
);

enrollSchema.index({ course: 1, email: 1 }, { unique: true });

export const CourseEnrollment = mongoose.model('CourseEnrollment', enrollSchema);
