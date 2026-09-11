import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import { sendMail, notifyCommittee, wrapEmail } from '../utils/mailer.js';

const router = Router();

router.post('/', publicFormLimiter, asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) throw new HttpError(400, 'Name, email and message are required.');
  const doc = await ContactMessage.create({
    name,
    email,
    subject: subject || 'General Inquiry',
    message
  });
  await sendMail({
    to: email,
    subject: 'We received your message — MUIS',
    html: wrapEmail('Message received', `<p>Assalamu alaikum ${name},</p><p>A MUIS committee member will get back to you shortly.</p>`)
  });
  await notifyCommittee(
    `Contact form: ${subject || 'General Inquiry'}`,
    wrapEmail('New contact message', `<p><strong>${name}</strong> (${email})</p><p>${message}</p>`)
  );
  res.status(201).json({ ok: true, id: doc._id });
}));

export default router;
