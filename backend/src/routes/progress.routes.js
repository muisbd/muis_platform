import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { DailyProgress } from '../models/DailyProgress.js';
import { authRequired } from '../middleware/auth.js';
import { computeDailyPoints } from '../utils/progressScore.js';

const router = Router();

router.use(authRequired);

function toDateKey(value) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date().toISOString().slice(0, 10);
}

router.get('/', asyncHandler(async (req, res) => {
  const logs = await DailyProgress.find({ userId: req.user._id }).sort({ date: -1 }).limit(90);
  const totalPoints = logs.reduce((sum, row) => sum + (row.points || 0), 0);
  const prayedDays = logs.filter((row) => Object.values(row.salah || {}).some((v) => v === 'prayed')).length;
  res.json({ ok: true, logs, totalPoints, prayedDays, daysLogged: logs.length });
}));

router.get('/day/:date', asyncHandler(async (req, res) => {
  const date = toDateKey(req.params.date);
  const log = await DailyProgress.findOne({ userId: req.user._id, date });
  res.json({ ok: true, log });
}));

router.put('/day/:date', asyncHandler(async (req, res) => {
  const date = toDateKey(req.params.date);
  const payload = {
    salah: req.body.salah || {},
    avoidedSin: Boolean(req.body.avoidedSin),
    avoidedSinNote: req.body.avoidedSinNote || '',
    helpedSomeone: Boolean(req.body.helpedSomeone),
    helpedSomeoneNote: req.body.helpedSomeoneNote || '',
    productive: Boolean(req.body.productive),
    productivityScore: req.body.productivityScore || null,
    tahajjud: Boolean(req.body.tahajjud),
    quranPages: Number(req.body.quranPages || 0)
  };
  payload.points = computeDailyPoints(payload);
  const log = await DailyProgress.findOneAndUpdate(
    { userId: req.user._id, date },
    { userId: req.user._id, date, ...payload },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ ok: true, log });
}));

router.get('/summary', asyncHandler(async (req, res) => {
  const logs = await DailyProgress.find({ userId: req.user._id }).sort({ date: -1 }).limit(30);
  res.json({
    ok: true,
    last30: logs.map((l) => ({ date: l.date, points: l.points, productive: l.productive })),
    totalPoints: logs.reduce((s, l) => s + l.points, 0)
  });
}));

export default router;
