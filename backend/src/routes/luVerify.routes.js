import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { authRequired } from '../middleware/auth.js';
import { SirahRegistration } from '../models/SirahRegistration.js';
import { sendMail, notifyCommittee, wrapEmail } from '../utils/mailer.js';

const router = Router();
router.use(authRequired);

router.use((req, _res, next) => {
  if (req.user?.role !== 'lu_verifier') {
    return next(new HttpError(403, 'This page is only for Leading University verification.'));
  }
  next();
});

function publicRow(doc) {
  return {
    id: doc._id,
    name: doc.name,
    studentId: doc.studentId,
    phone: doc.phone,
    email: doc.email,
    department: doc.department,
    batch: doc.batch,
    gender: doc.gender,
    luStatus: doc.luStatus,
    status: doc.status,
    createdAt: doc.createdAt
  };
}

router.get('/', asyncHandler(async (_req, res) => {
  const list = await SirahRegistration.find({ registrantType: 'lu' })
    .sort({ createdAt: -1 })
    .select('name studentId phone email department batch gender luStatus status createdAt');
  res.json({ ok: true, list: list.map(publicRow) });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const decision = String(req.body?.decision || '').trim();
  if (!['verified', 'rejected'].includes(decision)) {
    throw new HttpError(400, 'Choose verified or rejected.');
  }

  const doc = await SirahRegistration.findOne({ _id: req.params.id, registrantType: 'lu' });
  if (!doc) throw new HttpError(404, 'Registration not found.');
  if (doc.status === 'accepted') {
    throw new HttpError(400, 'MUIS already accepted this seat. It cannot be changed here.');
  }
  if (doc.status !== 'pending_review' && doc.status !== 'pending_verify') {
    throw new HttpError(400, 'This registration is already closed.');
  }

  doc.luStatus = decision;
  if (decision === 'rejected') doc.status = 'rejected';
  await doc.save();

  const verified = decision === 'verified';
  const mail = await sendMail({
    to: doc.email,
    subject: verified
      ? 'Seerah Conference 2026 — student check passed'
      : 'Seerah Conference 2026 — registration update',
    html: wrapEmail(
      verified ? 'Student check passed' : 'Registration update',
      verified
        ? `<p>Assalamu alaikum ${doc.name},</p><p>Leading University confirmed that you are their student. MUIS will now check your bKash payment and then confirm your seat.</p><p>Wassalam,<br/>Metropolitan University Islamic Society (MUIS)</p>`
        : `<p>Assalamu alaikum ${doc.name},</p><p>Leading University could not confirm that this student ID belongs to their university, so this registration was not accepted.</p><p>Wassalam,<br/>Metropolitan University Islamic Society (MUIS)</p>`
    )
  });
  await notifyCommittee(
    verified ? 'Seerah 2026 — Leading University verified a student' : 'Seerah 2026 — Leading University rejected a student',
    wrapEmail(
      verified ? 'Student verified' : 'Student not verified',
      `<p>${doc.name} (${doc.studentId}) — ${doc.email}</p><p>${verified ? 'Please check the bKash payment in the MUIS admin, then approve or reject the seat.' : 'This registration was rejected. No payment check is needed.'}</p>`
    )
  );

  res.json({
    ok: true,
    row: publicRow(doc),
    emailSent: !mail.skipped,
    message: verified
      ? `Marked as their student. MUIS still needs to check the payment.${mail.skipped ? '' : ` Email sent to ${doc.email}.`}`
      : `Marked as not their student. Registration rejected.${mail.skipped ? '' : ` Email sent to ${doc.email}.`}`
  });
}));

export default router;
