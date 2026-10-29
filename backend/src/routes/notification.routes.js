import { Router } from 'express';
import { asyncHandler, HttpError } from '../utils/asyncHandler.js';
import { authRequired } from '../middleware/auth.js';
import { Notification } from '../models/Notification.js';
import { PushSubscription } from '../models/PushSubscription.js';
import { pushPublicKey } from '../utils/notify.js';

const router = Router();

router.get('/push-key', (_req, res) => {
  res.json({ ok: true, publicKey: pushPublicKey() });
});

router.use(authRequired);

router.get('/', asyncHandler(async (req, res) => {
  const [list, unread] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30).lean(),
    Notification.countDocuments({ user: req.user._id, read: false })
  ]);
  res.json({ ok: true, list, unread });
}));

router.post('/read', asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : null;
  const filter = { user: req.user._id, read: false };
  if (ids) filter._id = { $in: ids };
  await Notification.updateMany(filter, { $set: { read: true } });
  res.json({ ok: true });
}));

router.post('/subscribe', asyncHandler(async (req, res) => {
  const sub = req.body?.subscription || {};
  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) throw new HttpError(400, 'Notification setup failed. Please try again.');
  await PushSubscription.findOneAndUpdate(
    { endpoint: sub.endpoint },
    {
      $set: {
        user: req.user._id,
        keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        userAgent: String(req.headers['user-agent'] || '').slice(0, 300)
      }
    },
    { upsert: true }
  );
  res.json({ ok: true, message: 'Notifications are on for this device.' });
}));

router.post('/unsubscribe', asyncHandler(async (req, res) => {
  const endpoint = String(req.body?.endpoint || '');
  if (endpoint) await PushSubscription.deleteOne({ endpoint, user: req.user._id });
  res.json({ ok: true });
}));

export default router;
