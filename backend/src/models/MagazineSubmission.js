import mongoose from 'mongoose';

const magSubSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    title: { type: String, required: true },
    abstract: { type: String, required: true },
    kind: { type: String, enum: ['blog', 'magazine'], default: 'magazine' },
    fileUrl: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'published'], default: 'pending' },
    publishedSlug: { type: String, default: '' },
    reviewNote: { type: String, default: '' }
  },
  { timestamps: true }
);

export const MagazineSubmission = mongoose.model('MagazineSubmission', magSubSchema);
