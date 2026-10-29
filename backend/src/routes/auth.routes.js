import crypto from 'crypto';
import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';
import { EmailCode } from '../models/EmailCode.js';
import { authRequired, signToken } from '../middleware/auth.js';
import { authLimiter, signInLimiter } from '../middleware/rateLimit.js';
import { env } from '../config/env.js';
import { sendMail, wrapEmail } from '../utils/mailer.js';
import { hashSecret, sixDigitCode } from '../utils/secrets.js';
import { normalizePhone } from '../utils/phone.js';

const router = Router();
const googleClient = new OAuth2Client();

// Committee accounts keep using their password, so a lost Gmail cannot open the admin desk.
const PASSWORD_ONLY_ROLES = ['admin', 'moderator', 'treasurer', 'lu_verifier'];
const EMAIL_CODE_MINUTES = 10;

function setAuthCookie(res, token, maxAge = 7 * 24 * 60 * 60 * 1000) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge
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
    attendeeType: user.attendeeType || '',
    university: user.university || '',
    batch: user.batch || '',
    guestNote: user.guestNote || '',
    authProvider: user.authProvider || 'password',
    role: user.role,
    bloggerId: user.bloggerId,
    byline: user.byline,
    memberStatus: user.role === 'admin' ? 'approved' : (user.memberStatus || 'none')
  };
}

function codeHash(email, code) {
  return hashSecret(`${email}:${code}:${env.jwtSecret}`);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Finds the account for a confirmed email, or creates a new one. */
async function accountForEmail(email, { name = '', googleId = '', provider }) {
  let user = await User.findOne({ email });
  if (user) {
    if (PASSWORD_ONLY_ROLES.includes(user.role)) {
      throw new HttpError(403, 'Committee accounts must sign in with their password.');
    }
    if (user.frozen) throw new HttpError(403, 'This account is frozen. Contact MUIS.');
    if (googleId && !user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
    return user;
  }
  user = await User.create({
    name: name || email.split('@')[0],
    email,
    password: crypto.randomBytes(24).toString('hex'),
    googleId,
    authProvider: provider,
    role: 'student',
    memberStatus: 'none'
  });
  return user;
}

function signIn(res, user) {
  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ ok: true, token, user: publicUser(user) });
}

router.get('/providers', (_req, res) => {
  res.json({
    ok: true,
    googleClientId: env.googleClientId,
    emailCode: Boolean(env.resendApiKey)
  });
});

router.post('/google', signInLimiter, asyncHandler(async (req, res) => {
  if (!env.googleClientId) throw new HttpError(503, 'Google sign-in is not set up yet. Please use the email code.');
  const credential = String(req.body?.credential || '');
  if (!credential) throw new HttpError(400, 'Google sign-in failed. Please try again.');
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.googleClientId });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, 'Google sign-in failed. Please try again.');
  }
  if (!payload?.email || !payload.email_verified) {
    throw new HttpError(401, 'Your Google email is not verified.');
  }
  const user = await accountForEmail(String(payload.email).toLowerCase(), {
    name: payload.name || '',
    googleId: payload.sub,
    provider: 'google'
  });
  signIn(res, user);
}));

router.post('/email-code/request', authLimiter, asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  if (!validEmail(email)) throw new HttpError(400, 'Please enter a valid email address.');
  if (!env.resendApiKey) throw new HttpError(503, 'Email codes are not available right now. Please use Continue with Google.');

  const existing = await User.findOne({ email }).select('role frozen');
  if (existing && PASSWORD_ONLY_ROLES.includes(existing.role)) {
    throw new HttpError(403, 'Committee accounts must sign in with their password.');
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [sentToday, sentToEmail, lastToEmail] = await Promise.all([
    EmailCode.countDocuments({ createdAt: { $gte: dayAgo } }),
    EmailCode.countDocuments({ email, createdAt: { $gte: dayAgo } }),
    EmailCode.findOne({ email }).sort({ createdAt: -1 })
  ]);
  if (sentToday >= env.emailCodeDailyLimit) {
    throw new HttpError(429, 'Too many email codes were sent today. Please use Continue with Google, or try again tomorrow.');
  }
  if (sentToEmail >= 5) throw new HttpError(429, 'Too many codes for this email today. Please use Continue with Google.');
  if (lastToEmail && Date.now() - lastToEmail.createdAt.getTime() < 60 * 1000) {
    throw new HttpError(429, 'Please wait one minute before asking for a new code.');
  }

  const code = sixDigitCode();
  await EmailCode.create({
    email,
    codeHash: codeHash(email, code),
    expiresAt: new Date(Date.now() + EMAIL_CODE_MINUTES * 60 * 1000)
  });
  const mail = await sendMail({
    to: email,
    subject: `Your MUIS sign-in code: ${code}`,
    html: wrapEmail(
      'Your sign-in code',
      `<p>Use this code to sign in to MUIS:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px;">${code}</p><p>It works for ${EMAIL_CODE_MINUTES} minutes. If you did not ask for it, ignore this email.</p>`
    ),
    text: `Your MUIS sign-in code is ${code}. It works for ${EMAIL_CODE_MINUTES} minutes.`
  });
  if (mail.skipped) throw new HttpError(502, 'Could not send the email. Please use Continue with Google.');
  res.json({ ok: true, message: `We sent a 6-digit code to ${email}. Check your inbox and spam folder.` });
}));

router.post('/email-code/verify', signInLimiter, asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  const code = String(req.body?.code || '').replace(/\D/g, '');
  if (!validEmail(email) || code.length !== 6) throw new HttpError(400, 'Please enter the 6-digit code.');
  const entry = await EmailCode.findOne({ email, used: false }).sort({ createdAt: -1 });
  if (!entry || entry.expiresAt < new Date()) throw new HttpError(400, 'This code has expired. Please ask for a new one.');
  if (entry.attempts >= 5) throw new HttpError(429, 'Too many wrong tries. Please ask for a new code.');
  if (entry.codeHash !== codeHash(email, code)) {
    entry.attempts += 1;
    await entry.save();
    throw new HttpError(400, 'That code is not correct.');
  }
  entry.used = true;
  await entry.save();
  const user = await accountForEmail(email, { provider: 'email_code' });
  signIn(res, user);
}));

router.post('/register', authLimiter, asyncHandler(async (_req, res) => {
  throw new HttpError(400, 'Please join MUIS to create your account. Membership is reviewed by a committee officer.');
}));

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, 'Email and password are required.');
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  const passwordOk = Boolean(user && (await user.comparePassword(password)));
  if (!user || !passwordOk || user.role === 'lu_verifier') {
    throw new HttpError(401, 'Incorrect email or password.');
  }
  if (user.frozen) throw new HttpError(403, 'This account is frozen. Contact MUIS.');
  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({ ok: true, token, user: publicUser(user) });
}));

router.post('/lu-login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, 'Email and password are required.');
  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  const passwordOk = Boolean(user && (await user.comparePassword(password)));
  if (!user || !passwordOk || user.role !== 'lu_verifier' || user.frozen) {
    throw new HttpError(401, 'Incorrect email or password.');
  }
  const maxAge = 12 * 60 * 60 * 1000;
  const token = signToken(user, '12h');
  setAuthCookie(res, token, maxAge);
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
  if (req.user.role === 'lu_verifier') throw new HttpError(403, 'This account cannot be changed here.');
  const body = req.body || {};
  const fields = ['name', 'department', 'studentId', 'gender', 'byline', 'university', 'batch', 'guestNote'];
  for (const key of fields) {
    if (body[key] !== undefined) req.user[key] = String(body[key]).trim().slice(0, 200);
  }
  if (body.name !== undefined && !req.user.name) throw new HttpError(400, 'Please enter your full name.');
  if (!['Male', 'Female', ''].includes(req.user.gender)) throw new HttpError(400, 'Please choose Male or Female.');
  if (body.attendeeType !== undefined) {
    if (!['student', 'guest', ''].includes(body.attendeeType)) throw new HttpError(400, 'Please choose student or guest.');
    req.user.attendeeType = body.attendeeType;
  }
  if (body.phone !== undefined) {
    const raw = String(body.phone).trim();
    const phone = normalizePhone(raw);
    if (raw && !phone) throw new HttpError(400, 'Please enter a valid Bangladesh mobile number, like 01712345678.');
    req.user.phone = phone;
  }
  await req.user.save();
  res.json({ ok: true, user: publicUser(req.user) });
}));

export default router;
