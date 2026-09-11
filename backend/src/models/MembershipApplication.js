import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Current Student', 'Alumni'], required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    year: { type: String, default: 'N/A' },
    motivation: { type: String, default: 'N/A' },
    reviewStatus: {
      type: String,
      enum: ['new', 'approved', 'added_to_group', 'rejected'],
      default: 'new'
    },
    adminNote: { type: String, default: '' }
  },
  { timestamps: true }
);

export const MembershipApplication = mongoose.model('MembershipApplication', membershipSchema);
