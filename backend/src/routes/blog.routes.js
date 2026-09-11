import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { BlogPost } from '../models/BlogPost.js';
import { authRequired } from '../middleware/auth.js';
import { slugify } from '../utils/slug.js';
import { sendMail, notifyCommittee, wrapEmail } from '../utils/mailer.js';

const router = Router();

router.get('/', asyncHandler(async (_req, res) => {
  const posts = await BlogPost.find({ status: 'published' })
    .populate('author', 'name byline bloggerId')
    .sort({ publishedAt: -1 });
  res.json({ ok: true, posts });
}));

router.get('/slug/:slug', asyncHandler(async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' })
    .populate('author', 'name byline bloggerId');
  if (!post) throw new HttpError(404, 'Post not found.');
  res.json({ ok: true, post });
}));

router.get('/mine', authRequired, asyncHandler(async (req, res) => {
  if (!['blogger', 'admin', 'moderator'].includes(req.user.role)) {
    throw new HttpError(403, 'A Blogger ID is required to write.');
  }
  const posts = await BlogPost.find({ author: req.user._id }).sort({ updatedAt: -1 });
  res.json({ ok: true, posts });
}));

router.post('/request-id', authRequired, asyncHandler(async (req, res) => {
  if (req.user.bloggerId) {
    return res.json({ ok: true, message: 'You already have a Blogger ID.', bloggerId: req.user.bloggerId });
  }
  await sendMail({
    to: req.user.email,
    subject: 'Blogger ID request received — MUIS',
    html: wrapEmail('Request received', `<p>Assalamu alaikum ${req.user.name},</p><p>We received your request for a MUIS Blogger ID. A moderator will review it.</p>`)
  });
  await notifyCommittee(
    'Blogger ID request',
    wrapEmail('Blogger request', `<p>${req.user.name} (${req.user.email}) asked for a Blogger ID.</p>`)
  );
  res.json({ ok: true });
}));

router.post('/', authRequired, asyncHandler(async (req, res) => {
  if (!['blogger', 'admin'].includes(req.user.role)) {
    throw new HttpError(403, 'Only issued bloggers can create posts.');
  }
  const { title, body, cover, tags } = req.body || {};
  if (!title || !body) throw new HttpError(400, 'Title and body are required.');
  let slug = slugify(title);
  const clash = await BlogPost.findOne({ slug });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;
  const post = await BlogPost.create({
    author: req.user._id,
    bloggerId: req.user.bloggerId,
    byline: req.user.byline || req.user.name,
    title,
    slug,
    body,
    cover: cover || '',
    tags: Array.isArray(tags) ? tags : String(tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    status: 'draft'
  });
  res.status(201).json({ ok: true, post });
}));

router.patch('/:id', authRequired, asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new HttpError(404, 'Post not found.');
  const isOwner = post.author.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw new HttpError(403, 'You can only edit your own posts.');
  if (post.status === 'published' && req.user.role !== 'admin') {
    throw new HttpError(403, 'Published posts can only be changed by MUIS.');
  }
  const allowed = ['title', 'body', 'cover', 'tags'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) post[key] = req.body[key];
  }
  if (req.body.title) post.slug = slugify(req.body.title);
  await post.save();
  res.json({ ok: true, post });
}));

router.post('/:id/submit', authRequired, asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) throw new HttpError(404, 'Post not found.');
  if (post.author.toString() !== req.user._id.toString()) throw new HttpError(403, 'Not your post.');
  post.status = 'pending_review';
  await post.save();
  await notifyCommittee(
    'Blog pending review',
    wrapEmail('Review queue', `<p>${req.user.name} submitted “${post.title}” for publishing.</p>`)
  );
  res.json({ ok: true, post });
}));

export default router;
