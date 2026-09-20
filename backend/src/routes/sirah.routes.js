import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { SirahRegistration } from '../models/SirahRegistration.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import { sendMail, notifyCommittee, wrapEmail } from '../utils/mailer.js';

const router = Router();

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isCashPayment(method) {
  return String(method || '').trim().toLowerCase() === 'cash';
}

function applyFields(doc, fields) {
  doc.name = fields.name;
  doc.studentId = fields.studentId;
  doc.phone = fields.phone;
  doc.department = fields.department;
  doc.batch = fields.batch;
  doc.section = fields.section;
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
      slug: 'sirah-2026',
      title: 'Sirah Conference 2026',
      path: '/sirah-2026'
    }
  });
}));

router.post('/register', publicFormLimiter, asyncHandler(async (req, res) => {
  const { name, studentId, phone, email, department, batch, section, paymentMethod, trxId, paidTo } = req.body || {};
  if (!name?.trim()) throw new HttpError(400, 'Please enter the participant name.');
  if (!studentId?.trim()) throw new HttpError(400, 'Please enter your student ID.');
  if (!phone?.trim()) throw new HttpError(400, 'Please enter your phone number.');
  if (!email || !String(email).includes('@')) throw new HttpError(400, 'Please enter a valid email address.');
  if (!department?.trim()) throw new HttpError(400, 'Please enter your department.');
  if (!paymentMethod?.trim()) throw new HttpError(400, 'Please choose a payment method.');
  const cash = isCashPayment(paymentMethod);
  if (cash && !paidTo?.trim()) throw new HttpError(400, 'Please enter the name of the person you paid cash to.');
  if (!cash && !trxId?.trim()) throw new HttpError(400, 'Please enter your payment transaction ID.');

  const emailKey = String(email).toLowerCase().trim();
  const trxKey = cash ? '' : String(trxId).trim();
  const fields = {
    name: name.trim(),
    studentId: studentId.trim(),
    phone: phone.trim(),
    department: department.trim(),
    batch: String(batch || '').trim(),
    section: String(section || '').trim(),
    paymentMethod: paymentMethod.trim(),
    trxId: trxKey,
    paidTo: cash ? paidTo.trim() : ''
  };

  if (!cash) {
    const trxClash = await SirahRegistration.findOne({
      trxId: { $regex: `^${escapeRegex(trxKey)}$`, $options: 'i' },
      email: { $ne: emailKey },
      status: { $ne: 'rejected' }
    });
    if (trxClash) throw new HttpError(409, 'This transaction ID is already used on another registration.');
  }

  let doc = await SirahRegistration.findOne({ email: emailKey });
  if (doc && ['accepted', 'pending_review', 'pending_verify'].includes(doc.status)) {
    throw new HttpError(409, 'This email is already registered for Sirah 2026.');
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
    'Sirah 2026 registration',
    wrapEmail(
      'New Sirah application',
      `<p>${doc.name} (${doc.studentId}) — ${doc.email}</p><p>Phone: ${doc.phone}<br/>Department: ${doc.department}${doc.batch ? ` · Batch ${doc.batch}` : ''}${doc.section ? ` · Section ${doc.section}` : ''}</p><p>${doc.paymentMethod} · ${doc.paidTo ? `Paid to ${doc.paidTo}` : `TrxID ${doc.trxId}`}</p>`
    )
  );
  await sendMail({
    to: emailKey,
    subject: 'Sirah 2026 — registration received',
    html: wrapEmail(
      'Registration received',
      `<p>Assalamu alaikum ${doc.name},</p><p>We received your Sirah Conference 2026 registration. MUIS will check your payment and then approve or reject your seat.</p><p>Student ID: ${doc.studentId}<br/>${doc.paidTo ? `Paid cash to: ${doc.paidTo}` : `TrxID: ${doc.trxId}`}</p>`
    )
  });
  res.status(201).json({
    ok: true,
    message: 'Registration submitted. MUIS will confirm after checking your payment.'
  });
}));

export default router;
