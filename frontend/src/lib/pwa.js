import { api } from './api.js';

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  window.addEventListener('appinstalled', markInstalled);
  if (isStandalone()) markInstalled();
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function isIos() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Facebook, Messenger, Instagram and similar apps open links in a built-in browser that cannot install apps. */
export function isInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|MicroMessenger|Line\/|WhatsApp|; wv\)/i.test(navigator.userAgent);
}

/** 'android' | 'ios' | 'desktop' — used to open the right help steps first. */
export function devicePlatform() {
  if (typeof navigator === 'undefined') return 'desktop';
  if (isIos()) return 'ios';
  if (/android/i.test(navigator.userAgent)) return 'android';
  return 'desktop';
}

export function isBrave() {
  return typeof navigator !== 'undefined' && Boolean(navigator.brave);
}

const INSTALLED_KEY = 'muis_app_installed';

/** True when opened from the home screen, or when this browser already installed MUIS. */
export function isInstalled() {
  if (typeof window === 'undefined') return false;
  return isStandalone() || localStorage.getItem(INSTALLED_KEY) === '1';
}

export function markInstalled() {
  if (typeof window !== 'undefined') localStorage.setItem(INSTALLED_KEY, '1');
}

export function canPromptInstall() {
  return typeof window !== 'undefined' && Boolean(window.__muisInstallPrompt);
}

/** Calls `fn` whenever the browser becomes ready to install, or the app gets installed. */
export function onInstallChange(fn) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('muis-install-ready', fn);
  window.addEventListener('appinstalled', fn);
  return () => {
    window.removeEventListener('muis-install-ready', fn);
    window.removeEventListener('appinstalled', fn);
  };
}

export async function promptInstall() {
  const event = window.__muisInstallPrompt;
  if (!event) return false;
  event.prompt();
  const choice = await event.userChoice.catch(() => ({ outcome: 'dismissed' }));
  window.__muisInstallPrompt = null;
  if (choice.outcome === 'accepted') markInstalled();
  return choice.outcome === 'accepted';
}

export function pushSupported() {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;
}

export function notificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function base64UrlToUint8Array(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function currentSubscription() {
  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  return { reg, sub: await reg.pushManager.getSubscription() };
}

/** Asks for permission and links this device to the signed-in account. */
export async function enablePush() {
  if (!pushSupported()) {
    throw new Error(isIos() && !isStandalone()
      ? 'On iPhone, first add MUIS to your Home Screen, open it from there, then turn on notifications.'
      : 'This browser cannot show notifications. Please open the site in Chrome.');
  }
  const { publicKey } = await api('/notifications/push-key');
  if (!publicKey) throw new Error('Notifications are not ready on the MUIS server yet.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications are blocked. Please allow them in your browser settings.');
  let { reg, sub } = await currentSubscription();
  if (!sub) {
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(publicKey)
      });
    } catch {
      throw new Error(isBrave()
        ? 'Brave needs one setting: open brave://settings/privacy, turn on "Use Google services for push messaging", restart Brave, then try again.'
        : 'Your browser could not turn on notifications. Please try Chrome, or follow the steps below.');
    }
  }
  await api('/notifications/subscribe', { method: 'POST', body: { subscription: sub.toJSON() } });
  return true;
}

/** If this device already allowed notifications, make sure they go to the account that is signed in now. */
export async function syncPush() {
  if (!pushSupported() || Notification.permission !== 'granted') return false;
  try {
    const { sub } = await currentSubscription();
    if (!sub) return false;
    await api('/notifications/subscribe', { method: 'POST', body: { subscription: sub.toJSON() } });
    return true;
  } catch {
    return false;
  }
}
