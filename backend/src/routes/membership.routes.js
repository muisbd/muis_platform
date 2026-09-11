import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { MembershipApplication } from '../models/MembershipApplication.js';
import { User } from '../models/User.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { signToken } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { sendMail, notifyCommittee, wrapEmail } from '../utils/mailer.js';

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
    memberStatus: user.role === 'admin' ? 'approved' : (user.memberStatus || 'none')
  };
}

router.post('/', authLimiter, asyncHandler(async (req, res) => {
  const { name, studentId, status, gender, email, phone, department, year, motivation, password } = req.body || {};
  if (!name) throw new HttpError(400, 'Please enter your Full Name.');
  if (!studentId) throw new HttpError(400, 'Please enter your Student ID.');
  if (!status) throw new HttpError(400, 'Please select your Status.');
  if (!gender) throw new HttpError(400, 'Please select your Gender.');
  if (!email || !String(email).includes('@')) throw new HttpError(400, 'Please enter a valid Email Address.');
  if (!phone) throw new HttpError(400, 'Please enter your Mobile Number (WhatsApp).');
  if (!department) throw new HttpError(400, 'Please enter your Department.');
  if (!password || String(password).length < 6) throw new HttpError(400, 'Password must be at least 6 characters. This becomes your MUIS login.');

  const emailKey = String(email).toLowerCase().trim();
  let user = await User.findOne({ email: emailKey });
  if (user?.frozen) throw new HttpError(403, 'This account is frozen. Contact MUIS.');
  if (user?.memberStatus === 'approved' || user?.role === 'admin') {
    throw new HttpError(409, 'This email is already a MUIS member. Please sign in.');
  }

  const openApp = await MembershipApplication.findOne({
    email: emailKey,
    reviewStatus: { $in: ['new', 'approved', 'added_to_group'] }
  });
  if (openApp && openApp.reviewStatus !== 'new') {
    throw new HttpError(409, 'This email is already a MUIS member. Please sign in.');
  }
  if (openApp && openApp.reviewStatus === 'new') {
    throw new HttpError(409, 'We already have a membership application for this email. Please wait for review, then sign in.');
  }

  if (!user) {
    user = await User.create({
      name,
      email: emailKey,
      password,
      studentId,
      phone,
      department,
      gender: gender === 'Male' || gender === 'Female' ? gender : '',
      memberStatus: 'pending'
    });
  } else {
    user.name = name;
    user.studentId = studentId;
    user.phone = phone;
    user.department = department;
    user.gender = gender === 'Male' || gender === 'Female' ? gender : user.gender;
    user.password = password;
    user.memberStatus = 'pending';
    await user.save();
  }

  const doc = await MembershipApplication.create({
    name,
    studentId,
    status,
    gender,
    email: emailKey,
    phone,
    department,
    year: year || 'N/A',
    motivation: motivation || 'N/A',
    userId: user._id
  });

  const token = signToken(user);
  setAuthCookie(res, token);

  await sendMail({
    to: emailKey,
    subject: 'MUIS membership application received',
    html: wrapEmail(
      'JazakAllah Khair',
      `<p>Assalamu alaikum ${name},</p><p>We received your MUIS membership application. You can sign in now. Courses unlock after a committee officer approves you as a member.</p>`
    )
  });
  await notifyCommittee(
    'New MUIS membership application',
    wrapEmail('New application', `<p>${name} (${studentId}) — ${department} — ${emailKey}</p>`)
  );

  res.status(201).json({ ok: true, application: doc, token, user: publicUser(user) });
}));

export default router;
