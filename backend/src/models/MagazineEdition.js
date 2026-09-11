import mongoose from 'mongoose';

const editionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    issue: { type: String, default: '' },
    date: { type: String, default: '' },
    cover: { type: String, default: '' },
    description: { type: String, default: '' },
    downloadUrl: { type: String, default: '' },
    pagesCount: { type: String, default: '' },
    featuredArticles: [{ type: String }]
  },
  { timestamps: true }
);

export const MagazineEdition = mongoose.model('MagazineEdition', editionSchema);
