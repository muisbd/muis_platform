import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { MembershipApplication } from '../models/MembershipApplication.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import { sendMail, notifyCommittee, wrapEmail } from '../utils/mailer.js';

const router = Router();

router.post('/', publicFormLimiter, asyncHandler(async (req, res) => {
  const { name, studentId, status, gender, email, phone, department, year, motivation } = req.body || {};
  if (!name) throw new HttpError(400, 'Please enter your Full Name.');
  if (!studentId) throw new HttpError(400, 'Please enter your Student ID.');
  if (!status) throw new HttpError(400, 'Please select your Status.');
  if (!gender) throw new HttpError(400, 'Please select your Gender.');
  if (!email || !String(email).includes('@')) throw new HttpError(400, 'Please enter a valid Email Address.');
  if (!phone) throw new HttpError(400, 'Please enter your Mobile Number (WhatsApp).');
  if (!department) throw new HttpError(400, 'Please enter your Department.');

  const doc = await MembershipApplication.create({
    name,
    studentId,
    status,
    gender,
    email,
    phone,
    department,
    year: year || 'N/A',
    motivation: motivation || 'N/A'
  });

  await sendMail({
    to: email,
    subject: 'MUIS membership application received',
    html: wrapEmail('JazakAllah Khair', `<p>Assalamu alaikum ${name},</p><p>We received your MUIS membership application. A committee officer will review it shortly.</p>`)
  });
  await notifyCommittee(
    'New MUIS membership application',
    wrapEmail('New application', `<p>${name} (${studentId}) — ${department} — ${email}</p>`)
  );

  res.status(201).json({ ok: true, application: doc });
}));

export default router;
