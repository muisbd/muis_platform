import webpush from 'web-push';
import { env } from '../config/env.js';
import { Notification } from '../models/Notification.js';
import { PushSubscription } from '../models/PushSubscription.js';
import { User } from '../models/User.js';

let pushConfigured = null;

function pushReady() {
  if (pushConfigured !== null) return pushConfigured;
  pushConfigured = Boolean(env.vapidPublicKey && env.vapidPrivateKey);
  if (pushConfigured) {
    try {
      webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
    } catch (err) {
      console.error('[push] VAPID keys are not valid:', err.message);
      pushConfigured = false;
    }
  } else {
    console.warn('[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — phone notifications are off.');
  }
  return pushConfigured;
}

export function pushPublicKey() {
  return pushReady() ? env.vapidPublicKey : '';
}

async function pushToUsers(userIds, payload) {
  if (!pushReady() || !userIds.length) return;
  const subs = await PushSubscription.find({ user: { $in: userIds } });
  await Promise.all(subs.map(async (sub) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
        JSON.stringify(payload),
        { TTL: 7 * 24 * 60 * 60 }
      );
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) await sub.deleteOne();
      else console.error('[push]', err.statusCode || '', err.message);
    }
  }));
}

/** Saves an in-app notification for each user and sends a free phone notification where possible. */
export async function notifyUsers(userIds, { title, body = '', link = '' }) {
  const ids = [...new Set(userIds.map(String))];
  if (!ids.length) return;
  try {
    await Notification.insertMany(ids.map((user) => ({ user, title, body, link })));
    await pushToUsers(ids, { title, body, url: link || '/' });
  } catch (err) {
    console.error('[notify]', err.message);
  }
}

export async function notifyStaff(message, roles = ['admin', 'moderator']) {
  const staff = await User.find({ role: { $in: roles }, frozen: { $ne: true } }).select('_id');
  await notifyUsers(staff.map((s) => s._id), message);
}
