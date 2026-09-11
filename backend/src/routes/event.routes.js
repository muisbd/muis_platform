import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { Event } from '../models/Event.js';
import { EventRsvp } from '../models/EventRsvp.js';
import { WeeklyProgram } from '../models/WeeklyProgram.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { sendMail, wrapEmail } from '../utils/mailer.js';
import { buildIcs } from '../utils/ics.js';
import { authRequired, requireRoles } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const [upcoming, past, weekly, gallery] = await Promise.all([
    Event.find({ isUpcoming: true }).sort({ createdAt: -1 }),
    Event.find({ isUpcoming: false }).sort({ createdAt: -1 }),
    WeeklyProgram.find(),
    GalleryItem.find()
  ]);
  res.json({ ok: true, upcoming, past, weekly, gallery });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug });
  if (!event) throw new HttpError(404, 'Event not found.');
  res.json({ ok: true, event });
}));

router.post('/:slug/rsvp', publicFormLimiter, asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug });
  if (!event) throw new HttpError(404, 'Event not found.');
  const { fullName, email, departmentYear } = req.body || {};
  if (!fullName || !email || !departmentYear) throw new HttpError(400, 'All RSVP fields are required.');
  try {
    await EventRsvp.create({ event: event._id, fullName, email, departmentYear });
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, 'You already reserved a seat for this event.');
    throw err;
  }
  const ics = buildIcs({
    title: event.title,
    description: event.description,
    location: event.location,
    dateLabel: `${event.date} ${event.time || ''}`
  });
  await sendMail({
    to: email,
    subject: `RSVP confirmed: ${event.title}`,
    html: wrapEmail('RSVP confirmed', `<p>Assalamu alaikum ${fullName},</p><p>Your seat for <strong>${event.title}</strong> is reserved.</p><p>${event.date} — ${event.location}</p>`),
    attachments: [{ filename: 'muis-event.ics', content: Buffer.from(ics).toString('base64') }]
  });
  res.status(201).json({ ok: true });
}));

router.post('/', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const event = await Event.create(req.body);
  res.status(201).json({ ok: true, event });
}));

router.patch('/:id', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const query = { $or: [{ slug: req.params.id }] };
  if (/^[a-f0-9]{24}$/i.test(req.params.id)) query.$or.push({ _id: req.params.id });
  const event = await Event.findOneAndUpdate(query, req.body, { new: true });
  if (!event) throw new HttpError(404, 'Event not found.');
  res.json({ ok: true, event });
}));

router.delete('/:id', authRequired, requireRoles('admin'), asyncHandler(async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

export default router;
