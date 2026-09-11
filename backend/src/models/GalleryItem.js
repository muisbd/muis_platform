import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  image: { type: String, required: true },
  tag: { type: String, default: 'Community' },
  caption: { type: String, required: true }
});

export const GalleryItem = mongoose.model('GalleryItem', gallerySchema);
