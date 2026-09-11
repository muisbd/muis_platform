import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloggerId: { type: String, default: '' },
    byline: { type: String, default: '' },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    cover: { type: String, default: '' },
    body: { type: String, required: true },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'published', 'rejected'],
      default: 'draft'
    },
    reviewNote: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

export const BlogPost = mongoose.model('BlogPost', blogSchema);
