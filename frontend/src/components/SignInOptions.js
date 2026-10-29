'use client';

import { useEffect, useRef, useState } from 'react';
import { Mail, KeyRound, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { isInAppBrowser } from '../lib/pwa.js';

let gsiPromise = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        gsiPromise = null;
        reject(new Error('Could not load Google sign-in.'));
      };
      document.head.appendChild(script);
    });
  }
  return gsiPromise;
}

function GoogleButton({ onSignedIn, onError }) {
  const { loginWithGoogle } = useAuth();
  const holder = useRef(null);
  const handlers = useRef({ loginWithGoogle, onSignedIn, onError });
  handlers.current = { loginWithGoogle, onSignedIn, onError };
  const [state, setState] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { googleClientId } = await api('/auth/providers');
        if (!googleClientId) {
          setState('off');
          return;
        }
        await loadGoogleScript();
        if (cancelled || !holder.current) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          ux_mode: 'popup',
          callback: async ({ credential }) => {
            try {
              const user = await handlers.current.loginWithGoogle(credential);
              handlers.current.onSignedIn?.(user);
            } catch (err) {
              handlers.current.onError?.(err.message);
            }
          }
        });
        const width = Math.max(220, Math.min(380, holder.current.offsetWidth || 320));
        window.google.accounts.id.renderButton(holder.current, {
          theme: 'filled_blue',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width
        });
        setState('ready');
      } catch {
        if (!cancelled) setState('off');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="signin-google">
      <div ref={holder} className="signin-google-holder" />
      {state === 'loading' ? <p className="signin-muted">Loading Google sign-in…</p> : null}
      {state === 'off' ? <p className="signin-muted">Google sign-in is not available right now. Please use the email code below.</p> : null}
    </div>
  );
}

function EmailCodeForm({ onSignedIn }) {
  const { requestEmailCode, verifyEmailCode } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendCode = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await requestEmailCode(email.trim());
      setSent(true);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const checkCode = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await verifyEmailCode(email.trim(), code.trim());
      onSignedIn?.(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="signin-email">
      {error ? <div className="join-alert alert-error" role="alert">{error}</div> : null}
      {message && sent ? <div className="join-alert alert-success" role="status">{message}</div> : null}
      {!sent ? (
        <form onSubmit={sendCode}>
          <div className="form-group">
            <label htmlFor="signin-email">Your email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input
                id="signin-email"
                type="email"
                className="form-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-outline" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Sending…' : 'Send me a code'}
          </button>
        </form>
      ) : (
        <form onSubmit={checkCode}>
          <div className="form-group">
            <label htmlFor="signin-code">6-digit code</label>
            <div className="input-with-icon">
              <KeyRound className="input-icon" />
              <input
                id="signin-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="form-control"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled={busy || code.length !== 6}>
            {busy ? 'Checking…' : 'Sign in'}
          </button>
          <button
            type="button"
            className="signin-link"
            onClick={() => { setSent(false); setCode(''); setMessage(''); }}
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}

/** Google first; email code as a backup. Creates the account automatically on first sign-in. */
export default function SignInOptions({ onSignedIn }) {
  const [error, setError] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setInApp(isInAppBrowser());
  }, []);

  return (
    <div className="signin-options">
      {inApp ? (
        <div className="join-alert alert-error signin-inapp" role="note">
          <AlertTriangle />
          <span>
            You opened this page inside Facebook, Messenger or another app. Google sign-in does not work there.
            Tap <strong>⋮</strong> or <strong>Share</strong> and choose <strong>Open in Chrome</strong> (or Safari), or use the email code below.
          </span>
        </div>
      ) : null}
      {error ? <div className="join-alert alert-error" role="alert">{error}</div> : null}
      <GoogleButton onSignedIn={onSignedIn} onError={setError} />
      <div className="signin-divider"><span>or</span></div>
      {showEmail ? (
        <EmailCodeForm onSignedIn={onSignedIn} />
      ) : (
        <button type="button" className="btn btn-outline signin-email-toggle" onClick={() => setShowEmail(true)}>
          <Mail /> No Google account? Get a code by email
        </button>
      )}
    </div>
  );
}
