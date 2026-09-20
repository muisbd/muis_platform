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
import { nextBloggerId, slugify } from '../utils/slug.js';
import { sendMail, wrapEmail } from '../utils/mailer.js';
import { buildIcs } from '../utils/ics.js';
import { env } from '../config/env.js';
import { SirahRegistration } from '../models/SirahRegistration.js';
import { SirahUpdate } from '../models/SirahUpdate.js';

const router = Router();
router.use(authRequired);

router.get('/overview', requireRoles('admin', 'moderator', 'treasurer'), asyncHandler(async (_req, res) => {
  const [
    memberships,
    messages,
    donations,
    pendingBlogs,
    magSubs,
    users,
    sirah
  ] = await Promise.all([
    MembershipApplication.countDocuments({ reviewStatus: 'new' }),
    ContactMessage.countDocuments({ handled: false }),
    DonationConfirmation.countDocuments({ verified: 'pending' }),
    BlogPost.countDocuments({ status: 'pending_review' }),
    MagazineSubmission.countDocuments({ status: 'pending' }),
    User.countDocuments(),
    SirahRegistration.countDocuments({ status: { $in: ['pending_review', 'pending_verify'] } })
  ]);
  res.json({ ok: true, memberships, messages, donations, pendingBlogs, magSubs, users, sirah });
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

  const memberStatus = ['approved', 'added_to_group'].includes(doc.reviewStatus)
    ? 'approved'
    : doc.reviewStatus === 'rejected'
      ? 'rejected'
      : 'pending';
  const user = doc.userId
    ? await User.findById(doc.userId)
    : await User.findOne({ email: doc.email });
  if (user && user.role !== 'admin') {
    user.memberStatus = memberStatus;
    await user.save();
  }
  if (doc.reviewStatus === 'approved' && doc.email) {
    await sendMail({
      to: doc.email,
      subject: 'You are a MUIS member',
      html: wrapEmail(
        'Membership approved',
        `<p>Assalamu alaikum ${doc.name},</p><p>Your MUIS membership is approved. Sign in to enroll in courses and request notes.</p>`
      )
    });
  }
  if (doc.reviewStatus === 'rejected' && doc.email) {
    await sendMail({
      to: doc.email,
      subject: 'MUIS membership update',
      html: wrapEmail('Membership update', `<p>Assalamu alaikum ${doc.name},</p><p>${doc.adminNote || 'Your application was not approved in this round.'}</p>`)
    });
  }
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
  const list = await EventRsvp.find().populate('event', 'title slug date time location description').sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

router.patch('/rsvps/:id', requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const doc = await EventRsvp.findById(req.params.id).populate('event');
  if (!doc) throw new HttpError(404, 'Not found.');
  const nextStatus = req.body.ticketStatus;
  if (!['pending', 'approved', 'rejected'].includes(nextStatus)) {
    throw new HttpError(400, 'Invalid ticket status.');
  }
  doc.ticketStatus = nextStatus;
  if (nextStatus === 'approved') {
    doc.ticketCode = doc.ticketCode || `MUIS-${String(doc.event?.slug || 'event').slice(0, 12).toUpperCase()}-${doc._id.toString().slice(-6).toUpperCase()}`;
    const event = doc.event;
    const ics = event
      ? buildIcs({
        title: event.title,
        description: event.description,
        location: event.location,
        dateLabel: `${event.date} ${event.time || ''}`
      })
      : null;
    await sendMail({
      to: doc.email,
      subject: `Ticket approved: ${event?.title || 'MUIS event'}`,
      html: wrapEmail(
        'Your ticket is approved',
        `<p>Assalamu alaikum ${doc.fullName},</p><p>Your ticket for <strong>${event?.title || 'the event'}</strong> is approved.</p><p>Ticket code: <strong>${doc.ticketCode}</strong></p><p>${event?.date || ''} — ${event?.location || ''}</p>`
      ),
      attachments: ics ? [{ filename: 'muis-event.ics', content: Buffer.from(ics).toString('base64') }] : undefined
    });
  }
  if (nextStatus === 'rejected') {
    await sendMail({
      to: doc.email,
      subject: `Ticket update: ${doc.event?.title || 'MUIS event'}`,
      html: wrapEmail('Ticket update', `<p>Assalamu alaikum ${doc.fullName},</p><p>Your registration was not approved for this event.</p>`)
    });
  }
  await doc.save();
  res.json({ ok: true, doc });
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
  if (req.body.publishAsBlog) {
    let slug = slugify(doc.title);
    const clash = await BlogPost.findOne({ slug });
    if (clash) slug = `${slug}-${Date.now().toString(36)}`;
    await BlogPost.create({
      authorName: doc.authorName,
      authorEmail: doc.email,
      byline: doc.authorName,
      title: doc.title,
      slug,
      body: doc.abstract,
      status: 'published',
      publishedAt: new Date()
    });
    doc.status = 'published';
    doc.kind = 'blog';
    doc.publishedSlug = slug;
    await doc.save();
    await sendMail({
      to: doc.email,
      subject: 'Your MUIS writing is live',
      html: wrapEmail('Published', `<p>Assalamu alaikum ${doc.authorName},</p><p>“${doc.title}” is now live at ${env.frontendUrl}/blogs/${slug}</p>`)
    });
    return res.json({ ok: true, doc });
  }
  if (req.body.status) doc.status = req.body.status;
  if (req.body.reviewNote !== undefined) doc.reviewNote = req.body.reviewNote;
  await doc.save();
  if (doc.status === 'accepted' || doc.status === 'rejected') {
    await sendMail({
      to: doc.email,
      subject: doc.status === 'accepted' ? 'An-Noor: article accepted' : 'An-Noor: article update',
      html: wrapEmail('Editorial update', `<p>${doc.reviewNote || (doc.status === 'accepted' ? 'Accepted for the next magazine issue.' : 'Not selected this round.')}</p>`)
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
  if (req.body.memberStatus && ['none', 'pending', 'approved', 'rejected'].includes(req.body.memberStatus)) {
    user.memberStatus = req.body.memberStatus;
  }
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

router.get('/sirah', requireRoles('admin', 'moderator', 'treasurer'), asyncHandler(async (_req, res) => {
  const list = await SirahRegistration.find().sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

router.patch('/sirah/:id', requireRoles('admin', 'moderator', 'treasurer'), asyncHandler(async (req, res) => {
  const doc = await SirahRegistration.findById(req.params.id);
  if (!doc) throw new HttpError(404, 'Not found.');
  const nextStatus = req.body.status;
  if (!['accepted', 'rejected', 'pending_review'].includes(nextStatus)) {
    throw new HttpError(400, 'Invalid status.');
  }
  doc.status = nextStatus;
  doc.adminNote = req.body.adminNote || doc.adminNote;
  if (nextStatus === 'accepted') {
    doc.ticketCode = doc.ticketCode || `SIRAH26-${doc._id.toString().slice(-6).toUpperCase()}`;
    await sendMail({
      to: doc.email,
      subject: 'Sirah 2026 — registration accepted',
      html: wrapEmail(
        'You are registered',
        `<p>Assalamu alaikum ${doc.name},</p><p>Your Sirah Conference 2026 registration is accepted.</p><p>Reference: <strong>${doc.ticketCode}</strong></p>`
      )
    });
  }
  if (nextStatus === 'rejected') {
    await sendMail({
      to: doc.email,
      subject: 'Sirah 2026 — registration update',
      html: wrapEmail('Registration update', `<p>Assalamu alaikum ${doc.name},</p><p>${doc.adminNote || 'Your Sirah 2026 registration was not accepted.'}</p>`)
    });
  }
  await doc.save();
  res.json({ ok: true, doc });
}));

router.get('/sirah-updates', requireRoles('admin', 'moderator', 'treasurer'), asyncHandler(async (_req, res) => {
  const list = await SirahUpdate.find().sort({ createdAt: -1 });
  res.json({ ok: true, list });
}));

router.post('/sirah-updates', requireRoles('admin', 'moderator'), asyncHandler(async (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !body) throw new HttpError(400, 'Title and message are required.');
  const doc = await SirahUpdate.create({ title: title.trim(), body: body.trim() });
  res.status(201).json({ ok: true, doc });
}));

export default router;
