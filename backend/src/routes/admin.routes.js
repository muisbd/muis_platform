import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { authRequired, requireRoles } from '../middleware/auth.js';
import { MembershipApplication } from '../models/MembershipApplication.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { DonationConfirmation } from '../models/DonationConfirmation.js';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber.js';
import { EventRsvp } from '../models/EventRsvp.js';
import { CourseEnrollment } from '../models/CourseEnrollment.js';
import { NoteRequest } from '../models/NoteRequest.js';
import { MagazineSubmission } from '../models/MagazineSubmission.js';
import { BlogPost } from '../models/BlogPost.js';
import { User } from '../models/User.js';
import { nextBloggerId } from '../utils/slug.js';
import { sendMail, wrapEmail } from '../utils/mailer.js';
import { env } from '../config/env.js';

const router = Router();
router.use(authRequired);

router.get('/overview', requireRoles('admin', 'moderator', 'treasurer'), asyncHandler(async (_req, res) => {
  const [
    memberships,
    messages,
    donations,
    pendingBlogs,
    magSubs,
    users
  ] = await Promise.all([
    MembershipApplication.countDocuments({ reviewStatus: 'new' }),
    ContactMessage.countDocuments({ handled: false }),
    DonationConfirmation.countDocuments({ verified: 'pending' }),
    BlogPost.countDocuments({ status: 'pending_review' }),
    MagazineSubmission.countDocuments({ status: 'pending' }),
    User.countDocuments()
  ]);
  res.json({ ok: true, memberships, messages, donations, pendingBlogs, magSubs, users });
}));

router.get('/memberships', requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const list = await MembershipApplication.find().sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

router.patch('/memberships/:id', requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const doc = await MembershipApplication.findByIdAndUpdate(
    req.params.id,
    { reviewStatus: req.body.reviewStatus, adminNote: req.body.adminNote || '' },
    { new: true }
  );
  if (!doc) throw new HttpError(404, 'Not found.');
  res.json({ ok: true, doc });
}));

router.get('/messages', requireRoles('admin', 'moderator'), asyncHandler(async (_req, res) => {
  const list = await ContactMessage.find().sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

router.patch('/messages/:id', requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const doc = await ContactMessage.findByIdAndUpdate(req.params.id, { handled: Boolean(req.body.handled) }, { new: true });
  res.json({ ok: true, doc });
}));

router.get('/donations', requireRoles('admin', 'treasurer'), asyncHandler(async (_req, res) => {
  const list = await DonationConfirmation.find().sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

router.patch('/donations/:id', requireRoles('admin', 'treasurer'), asyncHandler(async (req, res) => {
  const doc = await DonationConfirmation.findByIdAndUpdate(
    req.params.id,
    { verified: req.body.verified, adminNote: req.body.adminNote || '' },
    { new: true }
  );
  res.json({ ok: true, doc });
}));

router.get('/rsvps', requireRoles('admin', 'moderator'), asyncHandler(async (_req, res) => {
  const list = await EventRsvp.find().populate('event', 'title slug').sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

router.get('/enrollments', requireRoles('admin', 'moderator'), asyncHandler(async (_req, res) => {
  const list = await CourseEnrollment.find().populate('course', 'title slug').sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

router.get('/notes', requireRoles('admin', 'moderator'), asyncHandler(async (_req, res) => {
  const list = await NoteRequest.find().sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

router.patch('/notes/:id', requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const doc = await NoteRequest.findByIdAndUpdate(req.params.id, { handled: true }, { new: true });
  res.json({ ok: true, doc });
}));

router.get('/magazine-submissions', requireRoles('admin', 'moderator'), asyncHandler(async (_req, res) => {
  const list = await MagazineSubmission.find().sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

router.patch('/magazine-submissions/:id', requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const doc = await MagazineSubmission.findById(req.params.id);
  if (!doc) throw new HttpError(404, 'Not found.');
  doc.status = req.body.status;
  doc.reviewNote = req.body.reviewNote || '';
  await doc.save();
  if (doc.status === 'accepted' || doc.status === 'rejected') {
    await sendMail({
      to: doc.email,
      subject: doc.status === 'accepted' ? 'An-Noor: article accepted' : 'An-Noor: article update',
      html: wrapEmail('Editorial update', `<p>${doc.reviewNote || (doc.status === 'accepted' ? 'Accepted for review in the next issue.' : 'Not selected this round.')}</p>`)
    });
  }
  res.json({ ok: true, doc });
}));

router.get('/blogs', requireRoles('admin', 'moderator'), asyncHandler(async (_req, res) => {
  const list = await BlogPost.find().populate('author', 'name email bloggerId').sort({ updatedAt: -1 });
  res.json({ ok: true, list });
}));

router.patch('/blogs/:id', requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id).populate('author', 'email name');
  if (!post) throw new HttpError(404, 'Not found.');
  const prev = post.status;
  post.status = req.body.status || post.status;
  post.reviewNote = req.body.reviewNote || post.reviewNote;
  post.reviewedBy = req.user._id;
  if (post.status === 'published') post.publishedAt = new Date();
  await post.save();
  if (post.author?.email && prev !== post.status) {
    if (post.status === 'published') {
      await sendMail({
        to: post.author.email,
        subject: 'Your MUIS blog is live',
        html: wrapEmail('Published', `<p>Assalamu alaikum ${post.author.name},</p><p>“${post.title}” is now live at ${env.frontendUrl}/blogs/${post.slug}</p>`)
      });
    }
    if (post.status === 'rejected') {
      await sendMail({
        to: post.author.email,
        subject: 'MUIS blog review',
        html: wrapEmail('Review update', `<p>${post.reviewNote || 'This draft was not published in this round.'}</p>`)
      });
    }
  }
  res.json({ ok: true, post });
}));

router.get('/users', requireRoles('admin'), asyncHandler(async (_req, res) => {
  const list = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

router.patch('/users/:id', requireRoles('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found.');
  if (req.body.role) user.role = req.body.role;
  if (req.body.frozen !== undefined) user.frozen = Boolean(req.body.frozen);
  if (req.body.byline !== undefined) user.byline = req.body.byline;
  if (req.body.issueBlogger) {
    const count = await User.countDocuments({ bloggerId: { $ne: '' } });
    user.role = 'blogger';
    user.bloggerId = user.bloggerId || nextBloggerId(count);
  }
  await user.save();
  res.json({ ok: true, user });
}));

router.get('/newsletter', requireRoles('admin', 'moderator'), asyncHandler(async (_req, res) => {
  const list = await NewsletterSubscriber.find().sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

export default router;
