import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { authRequired, requireRoles } from '../middleware/auth.js';
import { SeerahCertificate } from '../models/SeerahCertificate.js';
import { SeerahRosterPhone } from '../models/SeerahRosterPhone.js';
import { extractPhones } from '../utils/phone.js';
import { getSeerahSettings, saveSeerahSettings, cleanPersonStyle } from '../utils/seerahSettings.js';
import { loadPhoneDirectory, checkPhone } from '../utils/seerahPhoneCheck.js';
import { notifyUsers } from '../utils/notify.js';
import { SEERAH_TEMPLATE } from './certificate.routes.js';

const router = Router();
router.use(authRequired, requireRoles('admin', 'moderator'));

const USER_LINK = '/seerah-2026/certificate';

router.get('/settings', asyncHandler(async (_req, res) => {
  res.json({ ok: true, ...(await getSeerahSettings()), template: SEERAH_TEMPLATE });
}));

router.put('/settings', asyncHandler(async (req, res) => {
  const body = req.body || {};
  const settings = await saveSeerahSettings({
    registrationOpen: body.registrationOpen,
    requestsOpen: body.requestsOpen,
    nameStyle: body.nameStyle
  });
  res.json({ ok: true, ...settings, template: SEERAH_TEMPLATE, message: 'Saved.' });
}));

router.get('/requests', asyncHandler(async (_req, res) => {
  const [docs, directory] = await Promise.all([
    SeerahCertificate.find({ event: 'seerah-2026' }).sort({ createdAt: -1 }).lean(),
    loadPhoneDirectory()
  ]);
  const active = docs.filter((d) => d.status !== 'rejected');
  const countBy = (key) => active.reduce((map, d) => {
    if (d[key]) map.set(d[key], (map.get(d[key]) || 0) + 1);
    return map;
  }, new Map());
  const phoneCount = countBy('phone');
  const idCount = countBy('studentIdKey');
  const list = docs.map((d) => ({
    ...d,
    check: checkPhone(directory, d.phone, d.email),
    sharedPhone: d.status !== 'rejected' && phoneCount.get(d.phone) > 1,
    sharedStudentId: Boolean(d.studentIdKey) && d.status !== 'rejected' && idCount.get(d.studentIdKey) > 1
  }));
  res.json({ ok: true, list });
}));

async function applyAction(doc, action, note, reviewer) {
  const from = doc.status;
  if (action === 'approve') {
    if (from === 'approved') return false;
    doc.status = 'approved';
    doc.approvedAt = new Date();
    doc.reviewNote = '';
  } else if (action === 'reject') {
    if (from !== 'pending') throw new HttpError(400, 'Only pending requests can be rejected. Use Revoke for approved certificates.');
    doc.status = 'rejected';
    doc.reviewNote = note || 'We could not match your details with our attendance list. Please check your details and send again.';
  } else if (action === 'revoke') {
    if (from !== 'approved') throw new HttpError(400, 'Only approved certificates can be revoked.');
    doc.status = 'revoked';
    doc.reviewNote = note || 'Your certificate was withdrawn. Please contact MUIS if you think this is a mistake.';
  } else if (action === 'reopen') {
    if (!['rejected', 'revoked'].includes(from)) throw new HttpError(400, 'Only rejected or revoked requests can be moved back to pending.');
    doc.status = 'pending';
    doc.reviewNote = '';
  } else {
    throw new HttpError(400, 'Unknown action.');
  }
  doc.reviewedBy = reviewer._id;
  doc.reviewedAt = new Date();
  await doc.save();

  if (action === 'approve') {
    await notifyUsers([doc.user], {
      title: 'Your Seerah Conference 2026 certificate is ready',
      body: 'Open MUIS to see and download your certificate.',
      link: USER_LINK
    });
  } else if (action === 'reject') {
    await notifyUsers([doc.user], {
      title: 'Seerah certificate request not approved',
      body: doc.reviewNote,
      link: USER_LINK
    });
  } else if (action === 'revoke') {
    await notifyUsers([doc.user], {
      title: 'Your Seerah certificate was withdrawn',
      body: doc.reviewNote,
      link: USER_LINK
    });
  }
  return true;
}

router.patch('/requests/:id', asyncHandler(async (req, res) => {
  const doc = await SeerahCertificate.findById(req.params.id);
  if (!doc) throw new HttpError(404, 'Request not found.');
  const action = String(req.body?.action || '');
  const note = String(req.body?.note || '').trim().slice(0, 500);
  await applyAction(doc, action, note, req.user);
  const message = {
    approve: `Approved. ${doc.certName} has been notified.`,
    reject: `Rejected. ${doc.certName} has been notified.`,
    revoke: `Revoked. ${doc.certName} has been notified.`,
    reopen: 'Moved back to pending.'
  }[action];
  res.json({ ok: true, doc, message });
}));

router.post('/requests/bulk-approve', asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.slice(0, 500) : [];
  if (!ids.length) throw new HttpError(400, 'Select at least one request.');
  const docs = await SeerahCertificate.find({ _id: { $in: ids }, status: 'pending' });
  for (const doc of docs) await applyAction(doc, 'approve', '', req.user);
  res.json({ ok: true, approved: docs.length, message: `${docs.length} certificate${docs.length === 1 ? '' : 's'} approved.` });
}));

router.patch('/requests/:id/name', asyncHandler(async (req, res) => {
  const doc = await SeerahCertificate.findById(req.params.id);
  if (!doc) throw new HttpError(404, 'Request not found.');
  const body = req.body || {};
  if (body.certName !== undefined) {
    const name = String(body.certName).trim().replace(/\s+/g, ' ');
    if (!name) throw new HttpError(400, 'The name cannot be empty.');
    doc.certName = name.slice(0, 120);
  }
  if (body.nameStyle !== undefined) doc.nameStyle = cleanPersonStyle(body.nameStyle);
  await doc.save();
  res.json({ ok: true, doc, message: 'Name saved for this certificate.' });
}));

router.get('/roster', asyncHandler(async (_req, res) => {
  const list = await SeerahRosterPhone.find().sort({ createdAt: 1 }).lean();
  res.json({ ok: true, list });
}));

router.post('/roster', asyncHandler(async (req, res) => {
  const source = req.body?.source === 'whatsapp' ? 'whatsapp' : 'booth';
  const { found, skipped } = extractPhones(String(req.body?.text || ''));
  if (!found.length) throw new HttpError(400, 'No valid phone numbers found. Use 11-digit numbers like 01712345678.');
  let added = 0;
  for (const item of found) {
    const result = await SeerahRosterPhone.updateOne(
      { phone: item.phone },
      { $setOnInsert: { phone: item.phone, source, unclear: item.unclear } },
      { upsert: true }
    );
    added += result.upsertedCount || 0;
  }
  const already = found.length - added;
  res.json({
    ok: true,
    added,
    already,
    skipped,
    message: `${added} added${already ? `, ${already} already in the list` : ''}${skipped.length ? `, ${skipped.length} skipped (not 11 digits)` : ''}.`
  });
}));

router.patch('/roster/:id', asyncHandler(async (req, res) => {
  const doc = await SeerahRosterPhone.findById(req.params.id);
  if (!doc) throw new HttpError(404, 'Number not found.');
  if (req.body?.unclear !== undefined) doc.unclear = Boolean(req.body.unclear);
  await doc.save();
  res.json({ ok: true, doc, message: 'Saved.' });
}));

router.delete('/roster/:id', asyncHandler(async (req, res) => {
  await SeerahRosterPhone.findByIdAndDelete(req.params.id);
  res.json({ ok: true, message: 'Number removed.' });
}));

export default router;
