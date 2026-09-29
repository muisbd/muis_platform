import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { SirahRegistration } from '../models/SirahRegistration.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import { sendMail, notifyCommittee, wrapEmail } from '../utils/mailer.js';

const router = Router();

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const REGISTRANT_TYPES = ['mu', 'lu', 'guardian'];
const RELATIONSHIPS = ['Parent', 'Brother', 'Sister', 'Spouse', 'Other'];

function applyFields(doc, fields) {
  doc.name = fields.name;
  doc.studentId = fields.studentId;
  doc.phone = fields.phone;
  doc.department = fields.department;
  doc.batch = fields.batch;
  doc.section = fields.section;
  doc.gender = fields.gender;
  doc.registrantType = fields.registrantType;
  doc.relationship = fields.relationship;
  doc.relationshipNote = fields.relationshipNote;
  doc.luStatus = fields.registrantType === 'lu' ? 'pending' : 'not_required';
  doc.paymentMethod = fields.paymentMethod;
  doc.trxId = fields.trxId;
  doc.paidTo = fields.paidTo;
  doc.status = 'pending_review';
  doc.emailVerified = true;
  doc.verifyCodeHash = '';
  doc.adminNote = '';
  doc.ticketCode = '';
}

function pathLabel(type) {
  if (type === 'lu') return 'Leading University';
  if (type === 'guardian') return 'Guardian';
  return 'Metropolitan University student';
}

function relationLabel(doc) {
  if (doc.relationship === 'Other' && doc.relationshipNote) return `Other (${doc.relationshipNote})`;
  return doc.relationship || 'Guardian';
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
  const body = req.body || {};
  const registrantType = String(body.registrantType || 'mu').trim();
  const name = String(body.name || '').trim();
  const studentId = String(body.studentId || '').trim();
  const phone = String(body.phone || '').trim();
  const department = String(body.department || '').trim();
  const batch = String(body.batch || '').trim();
  const genderValue = String(body.gender || '').trim();
  const relationship = String(body.relationship || '').trim();
  const relationshipNote = String(body.relationshipNote || '').trim();

  if (!REGISTRANT_TYPES.includes(registrantType)) throw new HttpError(400, 'Please choose how you are registering.');
  if (!name) throw new HttpError(400, registrantType === 'guardian' ? 'Please enter the guardian name.' : 'Please enter the participant name.');
  if (!studentId) {
    throw new HttpError(400, registrantType === 'guardian' ? 'Please enter the Metropolitan University student ID.' : 'Please enter the student ID.');
  }
  if (!phone) throw new HttpError(400, 'Please enter your phone number.');
  if (!body.email || !String(body.email).includes('@')) throw new HttpError(400, 'Please enter a valid email address.');
  if (!department) {
    throw new HttpError(400, registrantType === 'guardian' ? 'Please enter the student\'s department.' : 'Please enter your department.');
  }
  if ((registrantType === 'lu' || registrantType === 'guardian') && !batch) {
    throw new HttpError(400, registrantType === 'guardian' ? 'Please enter the student\'s batch.' : 'Please enter your batch.');
  }
  if (registrantType === 'guardian') {
    if (!RELATIONSHIPS.includes(relationship)) throw new HttpError(400, 'Please choose how you are related to the student.');
    if (relationship === 'Other' && !relationshipNote) throw new HttpError(400, 'Please write how you are related to the student.');
  }
  if (genderValue !== 'Male' && genderValue !== 'Female') throw new HttpError(400, 'Please choose Male or Female.');
  if (String(body.paymentMethod || '').trim() !== 'bKash') throw new HttpError(400, 'Please pay with bKash Send Money and enter the TrxID.');
  if (!String(body.trxId || '').trim()) throw new HttpError(400, 'Please enter your bKash transaction ID. The registration fee is required.');

  const emailKey = String(body.email).toLowerCase().trim();
  const trxKey = String(body.trxId).trim();
  const fields = {
    name,
    studentId,
    phone,
    department,
    batch,
    section: String(body.section || '').trim(),
    gender: genderValue,
    registrantType,
    relationship: registrantType === 'guardian' ? relationship : '',
    relationshipNote: registrantType === 'guardian' && relationship === 'Other' ? relationshipNote : '',
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
      email: emailKey,
      luStatus: registrantType === 'lu' ? 'pending' : 'not_required'
    });
  } else {
    applyFields(doc, fields);
  }

  await doc.save();
  const who = doc.registrantType === 'guardian'
    ? `${doc.name}, guardian (${relationLabel(doc)}) of MU student ${doc.studentId}`
    : `${doc.name} (${doc.studentId})`;
  const nextStep = doc.registrantType === 'lu'
    ? 'Leading University will confirm this student. MUIS will check the bKash payment after that.'
    : 'MUIS will check the bKash payment and then approve or reject the seat.';
  await notifyCommittee(
    'Seerah 2026 registration',
    wrapEmail(
      'New Seerah application',
      `<p>${who} — ${doc.email}</p><p>Path: ${pathLabel(doc.registrantType)}<br/>Phone: ${doc.phone}<br/>Department: ${doc.department}${doc.batch ? ` · Batch ${doc.batch}` : ''}${doc.gender ? ` · ${doc.gender}` : ''}</p><p>bKash TrxID ${doc.trxId}</p><p>${nextStep}</p>`
    )
  );
  const applicantNote = doc.registrantType === 'lu'
    ? 'Leading University will confirm that you are their student. MUIS will check your bKash payment. Your seat is confirmed only after both checks.'
    : 'MUIS will check your bKash payment and then approve or reject your seat.';
  const idLine = doc.registrantType === 'guardian'
    ? `Guardian: ${relationLabel(doc)}<br/>MU student ID: ${doc.studentId}`
    : `Student ID: ${doc.studentId}`;
  await sendMail({
    to: emailKey,
    subject: 'Seerah 2026 — registration received',
    html: wrapEmail(
      'Registration received',
      `<p>Assalamu alaikum ${doc.name},</p><p>We received your Seerah Conference 2026 registration. ${applicantNote}</p><p>This covers the Seerah Quiz, Writing Contest, and Seerah Seminar. Writing contest deadline: 14 October 2026.</p><p>${idLine}<br/>TrxID: ${doc.trxId}</p>`
    )
  });
  res.status(201).json({
    ok: true,
    message: doc.registrantType === 'lu'
      ? 'Registration submitted. Leading University will confirm the student, then MUIS will check the payment.'
      : 'Registration submitted. MUIS will confirm after checking your payment.'
  });
}));

export default router;
