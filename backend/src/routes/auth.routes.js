import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { authRequired, signToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { env } from '../config/env.js';

const router = Router();

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    phone: user.phone,
    department: user.department,
    gender: user.gender,
    role: user.role,
    bloggerId: user.bloggerId,
    byline: user.byline,
    memberStatus: user.role === 'admin' ? 'approved' : (user.memberStatus || 'none')
  };
}

router.post('/register', authLimiter, asyncHandler(async (_req, res) => {
  throw new HttpError(400, 'Please join MUIS to create your account. Membership is reviewed by a committee officer.');
}));

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, 'Email and password are required.');
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, 'Incorrect email or password.');
  }
  if (user.frozen) throw new HttpError(403, 'This account is frozen. Contact MUIS.');
  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ ok: true, token, user: publicUser(user) });
}));

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', authRequired, asyncHandler(async (req, res) => {
  res.json({ ok: true, user: publicUser(req.user) });
}));

router.patch('/me', authRequired, asyncHandler(async (req, res) => {
  const fields = ['name', 'phone', 'department', 'studentId', 'gender', 'byline'];
  for (const key of fields) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  await req.user.save();
  res.json({ ok: true, user: publicUser(req.user) });
}));

export default router;
