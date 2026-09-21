import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { SirahRegistration } from '../models/SirahRegistration.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import { sendMail, notifyCommittee, wrapEmail } from '../utils/mailer.js';

const router = Router();

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyFields(doc, fields) {
  doc.name = fields.name;
  doc.studentId = fields.studentId;
  doc.phone = fields.phone;
  doc.department = fields.department;
  doc.batch = fields.batch;
  doc.section = fields.section;
  doc.gender = fields.gender;
  doc.paymentMethod = fields.paymentMethod;
  doc.trxId = fields.trxId;
  doc.paidTo = fields.paidTo;
  doc.status = 'pending_review';
  doc.emailVerified = true;
  doc.verifyCodeHash = '';
  doc.adminNote = '';
  doc.ticketCode = '';
}

router.get('/info', asyncHandler(async (_req, res) => {
  res.json({
    ok: true,
    event: {
      slug: 'seerah-2026',
      title: 'Seerah Conference 2026',
      path: '/seerah-2026',
      fee: 150,
      currency: 'BDT'
    }
  });
}));

router.post('/register', publicFormLimiter, asyncHandler(async (req, res) => {
  const { name, studentId, phone, email, department, batch, section, gender, paymentMethod, trxId } = req.body || {};
  if (!name?.trim()) throw new HttpError(400, 'Please enter the participant name.');
  if (!studentId?.trim()) throw new HttpError(400, 'Please enter your student ID.');
  if (!phone?.trim()) throw new HttpError(400, 'Please enter your phone number.');
  if (!email || !String(email).includes('@')) throw new HttpError(400, 'Please enter a valid email address.');
  if (!department?.trim()) throw new HttpError(400, 'Please enter your department.');
  const genderValue = String(gender || '').trim();
  if (genderValue !== 'Male' && genderValue !== 'Female') throw new HttpError(400, 'Please choose Male or Female.');
  if (String(paymentMethod || '').trim() !== 'bKash') throw new HttpError(400, 'Please pay with bKash Send Money and enter the TrxID.');
  if (!trxId?.trim()) throw new HttpError(400, 'Please enter your bKash transaction ID.');

  const emailKey = String(email).toLowerCase().trim();
  const trxKey = String(trxId).trim();
  const fields = {
    name: name.trim(),
    studentId: studentId.trim(),
    phone: phone.trim(),
    department: department.trim(),
    batch: String(batch || '').trim(),
    section: String(section || '').trim(),
    gender: genderValue,
    paymentMethod: 'bKash',
    trxId: trxKey,
    paidTo: ''
  };

  const trxClash = await SirahRegistration.findOne({
    trxId: { $regex: `^${escapeRegex(trxKey)}$`, $options: 'i' },
    email: { $ne: emailKey },
    status: { $ne: 'rejected' }
  });
  if (trxClash) throw new HttpError(409, 'This transaction ID is already used on another registration.');

  let doc = await SirahRegistration.findOne({ email: emailKey });
  if (doc && ['accepted', 'pending_review', 'pending_verify'].includes(doc.status)) {
    throw new HttpError(409, 'This email is already registered for Seerah 2026.');
  }
  if (doc && doc.status === 'rejected') {
    applyFields(doc, fields);
  } else if (!doc) {
    doc = new SirahRegistration({
      ...fields,
      email: emailKey
    });
  } else {
    applyFields(doc, fields);
  }

  await doc.save();
  await notifyCommittee(
    'Seerah 2026 registration',
    wrapEmail(
      'New Seerah application',
      `<p>${doc.name} (${doc.studentId}) — ${doc.email}</p><p>Phone: ${doc.phone}<br/>Department: ${doc.department}${doc.batch ? ` · Batch ${doc.batch}` : ''}${doc.gender ? ` · ${doc.gender}` : ''}</p><p>${doc.paymentMethod} · ${doc.paidTo ? `Paid to ${doc.paidTo}` : `TrxID ${doc.trxId}`}</p>`
    )
  );
  await sendMail({
    to: emailKey,
    subject: 'Seerah 2026 — registration received',
    html: wrapEmail(
      'Registration received',
      `<p>Assalamu alaikum ${doc.name},</p><p>We received your Seerah Conference 2026 registration. MUIS will check your bKash payment and then approve or reject your seat.</p><p>This covers the Seerah Quiz, Writing Contest, and Seerah Seminar. Writing contest deadline: 14 October 2026.</p><p>Student ID: ${doc.studentId}<br/>TrxID: ${doc.trxId}</p>`
    )
  });
  res.status(201).json({
    ok: true,
    message: 'Registration submitted. MUIS will confirm after checking your payment.'
  });
}));

export default router;
