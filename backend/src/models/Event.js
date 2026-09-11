import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    category: { type: String, default: 'community' },
    badge: { type: String, default: 'Event' },
    image: { type: String, default: '/images/event.jpg' },
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    location: { type: String, required: true },
    description: { type: String, required: true },
    isUpcoming: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);
