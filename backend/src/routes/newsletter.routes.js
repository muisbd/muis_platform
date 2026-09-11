import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import { sendMail, wrapEmail } from '../utils/mailer.js';
import { env } from '../config/env.js';

const router = Router();

router.post('/', publicFormLimiter, asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  if (!email.includes('@')) throw new HttpError(400, 'Please enter a valid email address.');
  const existing = await NewsletterSubscriber.findOne({ email });
  if (existing && !existing.unsubscribedAt) {
    return res.json({ ok: true, message: 'You are already subscribed.' });
  }
  if (existing) {
    existing.unsubscribedAt = null;
    await existing.save();
  } else {
    await NewsletterSubscriber.create({ email });
  }
  const unsub = `${env.frontendUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`;
  await sendMail({
    to: email,
    subject: 'Subscribed to MUIS Newsletter',
    html: wrapEmail('Welcome', `<p>You are subscribed to MUIS campus updates.</p><p><a href="${unsub}" style="color:#38BDF8;">Unsubscribe</a></p>`)
  });
  res.json({ ok: true });
}));

router.get('/unsubscribe', asyncHandler(async (req, res) => {
  const email = String(req.query.email || '').toLowerCase().trim();
  if (email) {
    await NewsletterSubscriber.findOneAndUpdate({ email }, { unsubscribedAt: new Date() });
  }
  res.json({ ok: true, message: 'Unsubscribed.' });
}));

export default router;
