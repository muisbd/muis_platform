import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { MagazineEdition } from '../models/MagazineEdition.js';
import { MagazineSubmission } from '../models/MagazineSubmission.js';
import { sendMail, notifyCommittee, wrapEmail } from '../utils/mailer.js';
import { authRequired, requireRoles } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/editions', asyncHandler(async (_req, res) => {
  const editions = await MagazineEdition.find().sort({ createdAt: -1 });
  res.json({ ok: true, editions });
}));

router.post('/submissions', publicFormLimiter, asyncHandler(async (req, res) => {
  const { authorName, email, title, abstract, fileUrl } = req.body || {};
  if (!authorName || !email || !title || !abstract) {
    throw new HttpError(400, 'Author name, email, title and abstract are required.');
  }
  const doc = await MagazineSubmission.create({
    authorName,
    email,
    title,
    abstract,
    fileUrl: fileUrl || ''
  });
  await sendMail({
    to: email,
    subject: 'Article received — MUIS An-Noor',
    html: wrapEmail('Submission received', `<p>Assalamu alaikum ${authorName},</p><p>Your article “${title}” was sent to the Editorial Board.</p>`)
  });
  await notifyCommittee(
    'New magazine submission',
    wrapEmail('An-Noor submission', `<p>${authorName}: ${title}</p><p>${abstract}</p>`)
  );
  res.status(201).json({ ok: true, id: doc._id });
}));

router.post('/editions', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const edition = await MagazineEdition.create(req.body);
  res.status(201).json({ ok: true, edition });
}));

router.patch('/editions/:id', authRequired, requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const edition = await MagazineEdition.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!edition) throw new HttpError(404, 'Edition not found.');
  res.json({ ok: true, edition });
}));

export default router;
