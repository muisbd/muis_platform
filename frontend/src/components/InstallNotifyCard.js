'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Smartphone, BellRing, CheckCircle2, Share, MoreVertical, Copy, Lock, Monitor, Apple, PlusSquare
} from 'lucide-react';
import {
  isIos, isInAppBrowser, isStandalone, isInstalled, isBrave, devicePlatform, canPromptInstall,
  onInstallChange, promptInstall, pushSupported, notificationPermission, enablePush, syncPush
} from '../lib/pwa.js';
import { showToast } from '../utils/toast.js';

export const NOTIFY_SKIP_KEY = 'muis_notify_skip';

export function notifySkipped() {
  return typeof window !== 'undefined' && localStorage.getItem(NOTIFY_SKIP_KEY) === '1';
}

const TABS = [
  { id: 'android', label: 'Android', Icon: Smartphone },
  { id: 'ios', label: 'iPhone', Icon: Apple },
  { id: 'desktop', label: 'Computer', Icon: Monitor }
];

function AndroidHelp() {
  return (
    <>
      <h5>Add MUIS to your home screen</h5>
      <ol>
        <li>Open this page in <strong>Chrome</strong>.</li>
        <li>Tap the green <strong>Add to Home Screen</strong> button above. If nothing opens, tap the menu <MoreVertical className="inline-icon" /> at the top right.</li>
        <li>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>, then tap <strong>Install</strong>.</li>
      </ol>
      <h5>Turn on notifications</h5>
      <ol>
        <li>Tap the <strong>Turn on notifications</strong> button above.</li>
        <li>Tap <strong>Allow</strong> in the pop-up.</li>
      </ol>
      <h5>If notifications are blocked</h5>
      <ol>
        <li>Tap the <Lock className="inline-icon" /> or <strong>ⓘ</strong> icon at the left of the address bar.</li>
        <li>Tap <strong>Permissions</strong> → <strong>Notifications</strong> → <strong>Allow</strong>.</li>
        <li>Reload this page and tap <strong>Turn on notifications</strong> again.</li>
      </ol>
    </>
  );
}

function IosHelp() {
  return (
    <>
      <p className="install-help-note">iPhone shows notifications only when MUIS is on your home screen (iOS 16.4 or newer).</p>
      <h5>Add MUIS to your home screen</h5>
      <ol>
        <li>Open this page in <strong>Safari</strong>.</li>
        <li>Tap the <Share className="inline-icon" /> <strong>Share</strong> button at the bottom of the screen.</li>
        <li>Scroll down and tap <PlusSquare className="inline-icon" /> <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</li>
        <li>Close Safari. Open <strong>MUIS</strong> from your home screen and sign in again.</li>
      </ol>
      <h5>Turn on notifications</h5>
      <ol>
        <li>Inside the MUIS app from your home screen, open this page again.</li>
        <li>Tap <strong>Turn on notifications</strong> and then <strong>Allow</strong>.</li>
      </ol>
      <h5>If notifications are blocked</h5>
      <ol>
        <li>Open the iPhone <strong>Settings</strong> app → <strong>Notifications</strong> → <strong>MUIS</strong>.</li>
        <li>Turn on <strong>Allow Notifications</strong>.</li>
      </ol>
    </>
  );
}

function DesktopHelp({ brave }) {
  return (
    <>
      <p className="install-help-note">On a computer, adding the app is optional. Notifications are what matter.</p>
      <h5>Add MUIS as an app (optional)</h5>
      <ol>
        <li>Click the green <strong>Add to Home Screen</strong> button above.</li>
        <li>If nothing opens: in Chrome or Brave click the install icon at the right end of the address bar, or menu <MoreVertical className="inline-icon" /> → <strong>Cast, save and share</strong> → <strong>Install page as app</strong>.</li>
        <li>In Edge: menu <strong>…</strong> → <strong>Apps</strong> → <strong>Install this site as an app</strong>.</li>
      </ol>
      <h5>Turn on notifications</h5>
      <ol>
        <li>Click <strong>Turn on notifications</strong> above, then click <strong>Allow</strong>.</li>
      </ol>
      <h5>If notifications are blocked</h5>
      <ol>
        <li>Click the <Lock className="inline-icon" /> icon at the left of the address bar.</li>
        <li>Find <strong>Notifications</strong> and change it to <strong>Allow</strong> (or open <strong>Site settings</strong>).</li>
        <li>Reload this page and click <strong>Turn on notifications</strong> again.</li>
        {brave ? (
          <li>
            <strong>Brave only:</strong> open <code>brave://settings/privacy</code>, turn on
            {' '}<strong>Use Google services for push messaging</strong>, then restart Brave.
          </li>
        ) : null}
      </ol>
    </>
  );
}

/** Step: add MUIS to the home screen and allow free notifications. `onDone` runs when finished or skipped. */
export default function InstallNotifyCard({ onDone, compact = false }) {
  const [env, setEnv] = useState(null);
  const [tab, setTab] = useState('android');
  const [pushOn, setPushOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');
  const helpRef = useRef(null);

  useEffect(() => {
    const read = () => setEnv({
      installed: isInstalled(),
      standalone: isStandalone(),
      ios: isIos(),
      inApp: isInAppBrowser(),
      brave: isBrave(),
      canPrompt: canPromptInstall(),
      pushSupported: pushSupported(),
      permission: notificationPermission()
    });
    read();
    setTab(devicePlatform());
    syncPush().then(setPushOn);
    return onInstallChange(read);
  }, []);

  if (!env) return null;

  const showHelp = (message) => {
    setHint(message);
    helpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const install = async () => {
    setError('');
    if (env.inApp) {
      showHelp('This app browser cannot add MUIS. Open the page in Chrome or Safari first (see the steps below).');
      return;
    }
    if (canPromptInstall()) {
      const accepted = await promptInstall();
      if (accepted) {
        showToast('MUIS was added to your home screen.');
        setHint('');
      }
      setEnv((e) => ({ ...e, installed: accepted || e.installed, canPrompt: canPromptInstall() }));
      return;
    }
    showHelp(env.ios
      ? 'iPhone does not allow a one-tap install. Follow the 4 steps below. It takes 20 seconds.'
      : 'Your browser did not allow a one-tap install. Follow the steps below.');
  };

  const turnOn = async () => {
    setError('');
    if (env.ios && !env.standalone) {
      showHelp('On iPhone, first add MUIS to your home screen and open it from there. Then tap this button again.');
      return;
    }
    if (notificationPermission() === 'denied') {
      setEnv((e) => ({ ...e, permission: 'denied' }));
      showHelp('Notifications are blocked for this site. Follow “If notifications are blocked” below, then try again.');
      return;
    }
    setBusy(true);
    try {
      await enablePush();
      setPushOn(true);
      setHint('');
      showToast('Notifications are on.');
    } catch (err) {
      setError(err.message);
      setEnv((e) => ({ ...e, permission: notificationPermission() }));
      helpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied. Paste it in Chrome or Safari.');
    } catch {
      showToast('Could not copy. Please copy the link from the address bar.', true);
    }
  };

  return (
    <div className={`install-card${compact ? ' compact' : ''}`}>
      {!compact ? (
        <p className="install-intro">
          We will tell you on your phone when your certificate is ready. It is free: no SMS, no email.
        </p>
      ) : null}

      {env.inApp ? (
        <div className="join-alert alert-error install-inapp">
          <p>You opened this inside Facebook, Messenger or another app. Open it in <strong>Chrome</strong> (Android) or <strong>Safari</strong> (iPhone) first.</p>
          <button type="button" className="btn btn-sm btn-outline" onClick={copyLink}><Copy /> Copy page link</button>
        </div>
      ) : null}

      <div className="install-actions">
        <button
          type="button"
          className={`install-action${env.installed ? ' done' : ''}`}
          onClick={install}
          disabled={env.installed}
        >
          {env.installed ? <CheckCircle2 /> : <Smartphone />}
          <span className="install-action-text">
            <strong>{env.installed ? 'Added to home screen' : 'Add to Home Screen'}</strong>
            <em>{env.installed ? 'Done' : env.canPrompt ? 'One tap' : 'Shows you how'}</em>
          </span>
        </button>
        <button
          type="button"
          className={`install-action${pushOn ? ' done' : ''}`}
          onClick={turnOn}
          disabled={pushOn || busy}
        >
          {pushOn ? <CheckCircle2 /> : <BellRing />}
          <span className="install-action-text">
            <strong>{pushOn ? 'Notifications are on' : busy ? 'Turning on…' : 'Turn on notifications'}</strong>
            <em>{pushOn ? 'Done' : env.permission === 'denied' ? 'Blocked: see steps below' : 'Tap, then Allow'}</em>
          </span>
        </button>
      </div>

      {error ? <div className="join-alert alert-error">{error}</div> : null}
      {hint ? <div className="join-alert install-hint">{hint}</div> : null}

      <div className="install-help" ref={helpRef}>
        <div className="install-help-tabs" role="tablist">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`install-help-tab${tab === id ? ' active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>
        <div className="install-help-body">
          {tab === 'android' ? <AndroidHelp /> : tab === 'ios' ? <IosHelp /> : <DesktopHelp brave={env.brave} />}
        </div>
      </div>

      {onDone ? (
        <div className="install-footer">
          {pushOn ? (
            <button type="button" className="btn btn-gold btn-lg" style={{ width: '100%' }} onClick={onDone}>
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="signin-link"
              onClick={() => {
                localStorage.setItem(NOTIFY_SKIP_KEY, '1');
                onDone();
              }}
            >
              I can’t do this. Continue without phone notifications
            </button>
          )}
          {!pushOn ? <p className="install-skip-note">If you skip, check this page or the bell icon after you sign in to see your certificate status.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
