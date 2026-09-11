import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { DonationConfirmation } from '../models/DonationConfirmation.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import { notifyCommittee, wrapEmail } from '../utils/mailer.js';

const router = Router();

router.post('/confirm', publicFormLimiter, asyncHandler(async (req, res) => {
  const { donorName, contact, method, trxId, amount } = req.body || {};
  if (!donorName || !contact || !method || !trxId) {
    throw new HttpError(400, 'Name, contact, payment method and TrxID are required.');
  }
  const normalized = String(trxId).trim().toUpperCase();
  const exists = await DonationConfirmation.findOne({ trxId: normalized });
  if (exists) throw new HttpError(409, 'This TrxID was already submitted.');
  const doc = await DonationConfirmation.create({
    donorName,
    contact,
    method,
    trxId: normalized,
    amount: amount || ''
  });
  await notifyCommittee(
    'New donation confirmation',
    wrapEmail('Donation TrxID', `<p>${donorName} — ${normalized} — ${method}</p>`)
  );
  res.status(201).json({ ok: true, id: doc._id });
}));

export default router;
