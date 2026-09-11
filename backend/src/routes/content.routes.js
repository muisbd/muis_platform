import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { CommitteeMember } from '../models/CommitteeMember.js';
import { FaqItem } from '../models/FaqItem.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { WeeklyProgram } from '../models/WeeklyProgram.js';
import { authRequired, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/committee', asyncHandler(async (_req, res) => {
  const members = await CommitteeMember.find().sort({ order: 1 });
  res.json({ ok: true, members });
}));

router.get('/faq', asyncHandler(async (_req, res) => {
  const faqs = await FaqItem.find().sort({ order: 1 });
  res.json({ ok: true, faqs });
}));

router.post('/committee', authRequired, requireRoles('admin'), asyncHandler(async (req, res) => {
  const member = await CommitteeMember.create(req.body);
  res.status(201).json({ ok: true, member });
}));

router.patch('/committee/:id', authRequired, requireRoles('admin'), asyncHandler(async (req, res) => {
  const member = await CommitteeMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ ok: true, member });
}));

router.post('/faq', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const faq = await FaqItem.create(req.body);
  res.status(201).json({ ok: true, faq });
}));

router.patch('/faq/:id', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const faq = await FaqItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ ok: true, faq });
}));

router.post('/gallery', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const item = await GalleryItem.create(req.body);
  res.status(201).json({ ok: true, item });
}));

router.post('/weekly', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const item = await WeeklyProgram.create(req.body);
  res.status(201).json({ ok: true, item });
}));

router.patch('/gallery/:id', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ ok: true, item });
}));

router.delete('/gallery/:id', authRequired, requireRoles('admin'), asyncHandler(async (req, res) => {
  await GalleryItem.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

router.patch('/weekly/:id', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const item = await WeeklyProgram.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ ok: true, item });
}));

router.delete('/weekly/:id', authRequired, requireRoles('admin'), asyncHandler(async (req, res) => {
  await WeeklyProgram.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

router.delete('/committee/:id', authRequired, requireRoles('admin'), asyncHandler(async (req, res) => {
  await CommitteeMember.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

router.delete('/faq/:id', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  await FaqItem.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

export default router;
