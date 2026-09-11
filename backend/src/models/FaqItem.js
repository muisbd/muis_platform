import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  isOpen: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
});

export const FaqItem = mongoose.model('FaqItem', faqSchema);
