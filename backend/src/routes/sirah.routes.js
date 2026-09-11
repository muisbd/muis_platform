import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { SirahRegistration } from '../models/SirahRegistration.js';
import { SirahUpdate } from '../models/SirahUpdate.js';
import { User } from '../models/User.js';
import { publicFormLimiter, authLimiter } from '../middleware/rateLimit.js';
import { authRequired, signToken } from '../middleware/auth.js';
import { sendMail, notifyCommittee, wrapEmail } from '../utils/mailer.js';
import { env } from '../config/env.js';
import { sixDigitCode, hashSecret, randomPassword } from '../utils/secrets.js';

const router = Router();

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

async function issueVerifyCode(doc) {
  const code = sixDigitCode();
  doc.verifyCodeHash = hashSecret(code);
  doc.verifyExpires = new Date(Date.now() + 30 * 60 * 1000);
  doc.verifyAttempts = 0;
  await doc.save();
  const mailed = await sendMail({
    to: doc.email,
    subject: 'Sirah 2026 — your verification code',
    html: wrapEmail(
      'Email verification',
      `<p>Assalamu alaikum ${doc.name},</p><p>Your MUIS Sirah Conference 2026 verification code is:</p><p style="font-size:28px;letter-spacing:6px;font-weight:700;color:#FBBF24;">${code}</p><p>It expires in 30 minutes. If you did not apply, ignore this email.</p>`
    )
  });
  if (mailed.skipped) {
    console.warn('[sirah] verification email skipped for', doc.email, '— code (dev only):', code);
  }
  return code;
}

router.get('/info', asyncHandler(async (_req, res) => {
  res.json({
    ok: true,
    event: {
      slug: 'sirah-2026',
      title: 'Sirah Conference 2026',
      path: '/sirah-2026'
    }
  });
}));

router.post('/register', publicFormLimiter, asyncHandler(async (req, res) => {
  const { name, studentId, email, paymentMethod, trxId } = req.body || {};
  if (!name?.trim()) throw new HttpError(400, 'Please enter your full name.');
  if (!studentId?.trim()) throw new HttpError(400, 'Please enter your student ID.');
  if (!email || !String(email).includes('@')) throw new HttpError(400, 'Please enter a valid email address.');
  if (!paymentMethod?.trim()) throw new HttpError(400, 'Please choose a payment method.');
  if (!trxId?.trim()) throw new HttpError(400, 'Please enter your payment TrxID.');

  const emailKey = String(email).toLowerCase().trim();
  let doc = await SirahRegistration.findOne({ email: emailKey });
  if (doc && ['accepted', 'pending_review'].includes(doc.status)) {
    throw new HttpError(409, 'This email is already registered for Sirah 2026. Please verify or sign in.');
  }
  if (doc && doc.status === 'rejected') {
    doc.name = name.trim();
    doc.studentId = studentId.trim();
    doc.paymentMethod = paymentMethod.trim();
    doc.trxId = trxId.trim();
    doc.status = 'pending_verify';
    doc.emailVerified = false;
    doc.adminNote = '';
    doc.ticketCode = '';
  } else if (!doc) {
    doc = new SirahRegistration({
      name: name.trim(),
      studentId: studentId.trim(),
      email: emailKey,
      paymentMethod: paymentMethod.trim(),
      trxId: trxId.trim(),
      status: 'pending_verify'
    });
  } else {
    doc.name = name.trim();
    doc.studentId = studentId.trim();
    doc.paymentMethod = paymentMethod.trim();
    doc.trxId = trxId.trim();
  }

  await issueVerifyCode(doc);
  await notifyCommittee(
    'Sirah 2026 registration',
    wrapEmail('New Sirah application', `<p>${doc.name} (${doc.studentId}) — ${doc.email}</p><p>${doc.paymentMethod} · TrxID ${doc.trxId}</p>`)
  );
  res.status(201).json({ ok: true, email: emailKey, message: 'Check your email for a 6-digit verification code.' });
}));

router.post('/resend-code', authLimiter, asyncHandler(async (req, res) => {
  const emailKey = String(req.body?.email || '').toLowerCase().trim();
  const doc = await SirahRegistration.findOne({ email: emailKey, status: 'pending_verify' });
  if (!doc) throw new HttpError(404, 'No pending Sirah registration for this email.');
  await issueVerifyCode(doc);
  res.json({ ok: true, message: 'A new code was sent to your email.' });
}));

router.post('/verify', authLimiter, asyncHandler(async (req, res) => {
  const emailKey = String(req.body?.email || '').toLowerCase().trim();
  const code = String(req.body?.code || '').trim();
  if (!emailKey || !code) throw new HttpError(400, 'Email and verification code are required.');

  const doc = await SirahRegistration.findOne({ email: emailKey });
  if (!doc) throw new HttpError(404, 'No registration found for this email.');
  if (doc.emailVerified && doc.status !== 'pending_verify') {
    return res.json({ ok: true, alreadyVerified: true, message: 'Email already verified. Sign in with the password we emailed you.' });
  }
  if (!doc.verifyCodeHash || !doc.verifyExpires || doc.verifyExpires < new Date()) {
    throw new HttpError(400, 'This code has expired. Request a new one.');
  }
  if (doc.verifyAttempts >= 8) throw new HttpError(429, 'Too many attempts. Request a new code.');
  if (hashSecret(code) !== doc.verifyCodeHash) {
    doc.verifyAttempts += 1;
    await doc.save();
    throw new HttpError(400, 'That code is not correct.');
  }

  doc.emailVerified = true;
  doc.verifyCodeHash = '';
  doc.status = 'pending_review';
  let existingAccount = false;
  let user = await User.findOne({ email: emailKey });
  let password = '';
  if (user) {
    existingAccount = true;
    doc.userId = user._id;
  } else {
    password = randomPassword();
    user = await User.create({
      name: doc.name,
      email: emailKey,
      password,
      studentId: doc.studentId,
      memberStatus: 'none'
    });
    doc.userId = user._id;
  }
  await doc.save();

  if (existingAccount) {
    await sendMail({
      to: emailKey,
      subject: 'Sirah 2026 — email verified',
      html: wrapEmail(
        'Email verified',
        `<p>Assalamu alaikum ${doc.name},</p><p>Your Sirah Conference 2026 email is verified. Sign in at ${env.frontendUrl}/sirah-2026 with your existing MUIS password. Admin will accept or reject your registration after checking payment.</p>`
      )
    });
  } else {
    await sendMail({
      to: emailKey,
      subject: 'Sirah 2026 — your login password',
      html: wrapEmail(
        'Your Sirah login',
        `<p>Assalamu alaikum ${doc.name},</p><p>Your email is verified. Sign in at ${env.frontendUrl}/sirah-2026</p><p>Email: ${emailKey}<br/>Password: <strong>${password}</strong></p><p>Keep this password. Admin will confirm your seat after checking the TrxID.</p>`
      )
    });
  }

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({
    ok: true,
    existingAccount,
    token,
    message: existingAccount
      ? 'Email verified. Use your existing MUIS password to sign in.'
      : 'Email verified. We sent a login password to your email.'
  });
}));

router.get('/me', authRequired, asyncHandler(async (req, res) => {
  const registration = await SirahRegistration.findOne({
    $or: [{ userId: req.user._id }, { email: req.user.email }]
  });
  const updates = await SirahUpdate.find().sort({ createdAt: -1 }).limit(20);
  res.json({ ok: true, registration, updates });
}));

export default router;
