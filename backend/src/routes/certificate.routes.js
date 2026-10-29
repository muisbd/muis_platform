import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { authRequired } from '../middleware/auth.js';
import { certificateRequestLimiter } from '../middleware/rateLimit.js';
import { SeerahCertificate } from '../models/SeerahCertificate.js';
import { normalizePhone } from '../utils/phone.js';
import { getSeerahSettings } from '../utils/seerahSettings.js';
import { loadPhoneDirectory, checkPhone } from '../utils/seerahPhoneCheck.js';
import { notifyStaff } from '../utils/notify.js';

const router = Router();
const EVENT = 'seerah-2026';
export const SEERAH_TEMPLATE = '/seerah-2026-certificate-template.png';

export function studentIdKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function forUser(doc) {
  if (!doc) return null;
  return {
    id: doc._id,
    status: doc.status,
    certName: doc.certName,
    attendeeType: doc.attendeeType,
    phone: doc.phone,
    registeredVia: doc.registeredVia,
    reviewNote: doc.status === 'rejected' || doc.status === 'revoked' ? doc.reviewNote : '',
    approvedAt: doc.approvedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    nameStyle: doc.status === 'approved' ? doc.nameStyle : null
  };
}

/** Lists what is still missing from the profile before a request can be sent. */
export function missingProfileFields(user) {
  const missing = [];
  if (!String(user.name || '').trim()) missing.push('full name');
  if (!['student', 'guest'].includes(user.attendeeType)) missing.push('student or guest');
  if (user.attendeeType === 'student') {
    if (!user.university) missing.push('university');
    if (!user.studentId) missing.push('student ID');
    if (!user.department) missing.push('department');
    if (!user.batch) missing.push('batch');
  }
  if (user.attendeeType === 'guest' && !user.phone) missing.push('phone number');
  return missing;
}

router.get('/seerah-2026/settings', asyncHandler(async (_req, res) => {
  const settings = await getSeerahSettings();
  res.json({ ok: true, ...settings, template: SEERAH_TEMPLATE });
}));

router.get('/seerah-2026/me', authRequired, asyncHandler(async (req, res) => {
  const [doc, settings] = await Promise.all([
    SeerahCertificate.findOne({ user: req.user._id, event: EVENT }),
    getSeerahSettings()
  ]);
  res.json({
    ok: true,
    request: forUser(doc),
    requestsOpen: settings.requestsOpen,
    nameStyle: settings.nameStyle,
    template: SEERAH_TEMPLATE,
    missing: missingProfileFields(req.user)
  });
}));

router.post('/seerah-2026', authRequired, certificateRequestLimiter, asyncHandler(async (req, res) => {
  const user = req.user;
  if (['admin', 'moderator', 'treasurer', 'lu_verifier'].includes(user.role)) {
    throw new HttpError(403, 'Committee accounts cannot request a participant certificate.');
  }
  const settings = await getSeerahSettings();
  if (!settings.requestsOpen) throw new HttpError(403, 'Certificate requests are closed right now.');

  const missing = missingProfileFields(user);
  if (missing.length) throw new HttpError(400, `Please complete your profile first: ${missing.join(', ')}.`);

  const body = req.body || {};
  const phone = normalizePhone(body.phone);
  if (!phone) throw new HttpError(400, 'Please enter the phone number you used when you registered, like 01712345678.');
  const registeredVia = ['website', 'booth', 'not_sure'].includes(body.registeredVia) ? body.registeredVia : '';
  if (!registeredVia) throw new HttpError(400, 'Please tell us how you registered.');
  if (body.confirmName !== true) throw new HttpError(400, 'Please confirm that your name is spelled correctly.');

  let doc = await SeerahCertificate.findOne({ user: user._id, event: EVENT });
  if (doc?.status === 'pending') throw new HttpError(409, 'Your request is already waiting for review.');
  if (doc?.status === 'approved') throw new HttpError(409, 'Your certificate is already approved.');
  if (doc?.status === 'revoked') throw new HttpError(409, 'Your certificate was withdrawn. Please contact MUIS.');

  const idKey = user.attendeeType === 'student' ? studentIdKey(user.studentId) : '';
  const active = { $in: ['pending', 'approved', 'revoked'] };
  const [idClash, phoneClash] = await Promise.all([
    idKey ? SeerahCertificate.findOne({ event: EVENT, studentIdKey: idKey, status: active, user: { $ne: user._id } }) : null,
    SeerahCertificate.findOne({ event: EVENT, phone, status: active, user: { $ne: user._id } })
  ]);
  if (idClash) throw new HttpError(409, 'This student ID is already used in another certificate request. If it is yours, contact MUIS.');
  if (phoneClash) {
    throw new HttpError(409, 'This phone number is already used in another certificate request. If you share this number with a family member, contact MUIS.');
  }

  const fields = {
    certName: String(user.name).trim().replace(/\s+/g, ' '),
    email: user.email,
    attendeeType: user.attendeeType,
    university: user.attendeeType === 'student' ? user.university : '',
    studentId: user.attendeeType === 'student' ? user.studentId : '',
    studentIdKey: idKey,
    department: user.attendeeType === 'student' ? user.department : '',
    batch: user.attendeeType === 'student' ? user.batch : '',
    guestNote: user.attendeeType === 'guest' ? user.guestNote : '',
    phone,
    registeredVia,
    status: 'pending',
    reviewNote: ''
  };
  if (doc) {
    Object.assign(doc, fields);
    doc.submitCount += 1;
  } else {
    doc = new SeerahCertificate({ ...fields, user: user._id, event: EVENT });
  }
  await doc.save();

  const directory = await loadPhoneDirectory();
  const check = checkPhone(directory, phone, user.email);
  const checkText = {
    verified: 'phone verified',
    unclear: 'phone found, needs a check',
    close: 'close number found',
    not_found: 'phone not found'
  }[check.status];
  await notifyStaff({
    title: 'New Seerah certificate request',
    body: `${doc.certName} (${doc.attendeeType === 'guest' ? 'guest' : 'student'}) — ${checkText}`,
    link: '/admin?tab=certificates'
  });

  res.status(201).json({
    ok: true,
    request: forUser(doc),
    message: 'Request sent. MUIS will review it and you will be notified.'
  });
}));

export default router;
