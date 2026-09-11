'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Mail, User, CreditCard, Hash, ShieldCheck, LogIn } from 'lucide-react';
import { api, setToken } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { showToast } from '../utils/toast.js';

function statusText(status) {
  return {
    pending_verify: 'Verify your email',
    pending_review: 'Waiting for MUIS to accept your registration',
    accepted: 'Accepted — you are registered',
    rejected: 'Not accepted'
  }[status] || status;
}

export default function SirahConferencePage() {
  const { user, isLoggedIn, isStaff, login, applyToken, logout, ready } = useAuth();
  const [step, setStep] = useState('form');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [registration, setRegistration] = useState(null);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    if (!ready || !isLoggedIn) return;
    api('/sirah/me')
      .then((data) => {
        setRegistration(data.registration || null);
        setUpdates(data.updates || []);
        if (data.registration) setStep('account');
      })
      .catch(() => {});
  }, [ready, isLoggedIn]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const payload = {
      name: form.name.value.trim(),
      studentId: form.studentId.value.trim(),
      email: form.email.value.trim(),
      paymentMethod: form.paymentMethod.value,
      trxId: form.trxId.value.trim()
    };
    setLoading('register');
    try {
      await api('/sirah/register', { method: 'POST', body: payload });
      setEmail(payload.email);
      setStep('verify');
      showToast('A 6-digit code was sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const code = e.currentTarget.code.value.trim();
    setLoading('verify');
    try {
      const data = await api('/sirah/verify', { method: 'POST', body: { email, code } });
      showToast(data.message);
      if (data.alreadyVerified && !data.token) {
        setStep('form');
        return;
      }
      if (data.token && applyToken) await applyToken(data.token);
      else if (data.token) setToken(data.token);
      setStep('account');
      const me = await api('/sirah/me').catch(() => null);
      if (me?.registration) setRegistration(me.registration);
      if (me?.updates) setUpdates(me.updates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    setLoading('login');
    try {
      await login(form.email.value.trim(), form.password.value);
      const me = await api('/sirah/me');
      setRegistration(me.registration || null);
      setUpdates(me.updates || []);
      setStep('account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  };

  const resend = async () => {
    setLoading('resend');
    try {
      await api('/sirah/resend-code', { method: 'POST', body: { email } });
      showToast('A new code was sent.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="page-container page-fade-enter sirah-page">
      <section className="hero" style={{ minHeight: 360, paddingTop: 120 }}>
        <div className="container hero-content" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div className="hero-bismillah text-arabic" style={{ marginBottom: 12 }}>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          <div className="eyebrow" style={{ color: '#FBBF24' }}>Metropolitan University Islamic Society</div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', marginBottom: 12 }}>Sirah Conference 2026</h1>
          <p className="hero-subtext" style={{ margin: '0 auto 16px', maxWidth: 640 }}>
            Scan the QR or open <strong>muis.bd/sirah-2026</strong>. Register with your name, student ID, email, and payment TrxID. We email a verification code, then a login so you can track your seat.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          {isStaff ? (
            <p style={{ textAlign: 'center', marginBottom: 20 }}>
              <Link href="/admin" className="btn btn-gold btn-sm">Open Admin — Sirah desk</Link>
            </p>
          ) : null}

          {error ? <div className="join-alert alert-error" role="alert">{error}</div> : null}

          {step === 'account' && isLoggedIn ? (
            <div className="form-card">
              <h3 style={{ color: 'var(--color-navy)', marginBottom: 8 }}>Your Sirah 2026 registration</h3>
              {registration ? (
                <>
                  <p style={{ marginBottom: 12, fontWeight: 700 }}>{statusText(registration.status)}</p>
                  <p className="admin-meta">Name: {registration.name}</p>
                  <p className="admin-meta">Student ID: {registration.studentId}</p>
                  <p className="admin-meta">Email: {registration.email}</p>
                  <p className="admin-meta">Payment: {registration.paymentMethod} · {registration.trxId}</p>
                  {registration.ticketCode ? <p className="admin-meta">Reference: {registration.ticketCode}</p> : null}
                  {registration.adminNote ? <p className="admin-meta">Note from MUIS: {registration.adminNote}</p> : null}
                </>
              ) : (
                <p>No Sirah registration is linked to {user?.email}. Fill the form below if you still need to apply.</p>
              )}
              <div style={{ marginTop: 20 }}>
                <h4 style={{ color: 'var(--color-navy)', marginBottom: 8 }}>Event updates</h4>
                {!updates.length ? <p className="admin-meta">No updates posted yet.</p> : null}
                {updates.map((item) => (
                  <div key={item._id} style={{ marginBottom: 12 }}>
                    <strong>{item.title}</strong>
                    <p className="admin-meta">{item.body}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginTop: 16 }}
                onClick={() => {
                  logout();
                  setStep('form');
                  setRegistration(null);
                  setUpdates([]);
                }}
              >
                Log out
              </button>
            </div>
          ) : null}

          {step === 'verify' ? (
            <div className="form-card">
              <h3 style={{ color: 'var(--color-navy)', marginBottom: 8 }}><Mail /> Enter the code from your email</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>Sent to <strong>{email}</strong>. After this we email your login password.</p>
              <form onSubmit={handleVerify}>
                <div className="form-group">
                  <label>6-digit code *</label>
                  <input name="code" className="form-control" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required placeholder="123456" />
                </div>
                <button type="submit" className="btn btn-navy btn-lg" style={{ width: '100%' }} disabled={Boolean(loading)}>
                  {loading === 'verify' ? 'Checking…' : 'Verify email'}
                </button>
              </form>
              <p style={{ marginTop: 12, textAlign: 'center', display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-sm btn-outline" onClick={resend} disabled={Boolean(loading)}>Resend code</button>
                <button type="button" className="btn btn-sm btn-outline" onClick={() => { setStep('form'); setError(''); }}>Use a different email</button>
              </p>
            </div>
          ) : null}

          {step === 'form' || (step === 'account' && isLoggedIn && !registration) ? (
            <div className="form-card">
              <h3 style={{ color: 'var(--color-navy)', marginBottom: 8 }}><BookOpen /> Register</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 16, fontSize: '0.92rem' }}>
                Pay first, then enter the TrxID. This is <strong>Sirah Conference 2026</strong> only — not MUIS membership.
              </p>
              <div className="sirah-pay-box">
                <p><strong>bKash Send Money:</strong> +8801576795376</p>
                <p><strong>NRBC Bank:</strong> Metropolitan University Islamic Society (MUIS) · A/c 715910100016533 · Bateshwar Branch (Islamic Window)</p>
              </div>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Full name *</label>
                  <div className="input-with-icon">
                    <User className="input-icon" />
                    <input name="name" className="form-control" required placeholder="Your name" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Student ID *</label>
                  <div className="input-with-icon">
                    <CreditCard className="input-icon" />
                    <input name="studentId" className="form-control" required placeholder="231-115-052" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" />
                    <input name="email" type="email" className="form-control" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Payment method *</label>
                  <select name="paymentMethod" className="form-control" required defaultValue="bKash">
                    <option value="bKash">bKash</option>
                    <option value="NRBC Bank">NRBC Bank</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment TrxID / reference *</label>
                  <div className="input-with-icon">
                    <Hash className="input-icon" />
                    <input name="trxId" className="form-control" required placeholder="e.g. 9J4K2L8M1N" />
                  </div>
                </div>
                <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%' }} disabled={Boolean(loading)}>
                  <ShieldCheck /> {loading === 'register' ? 'Sending code…' : 'Submit & send verification code'}
                </button>
              </form>
            </div>
          ) : null}

          {step === 'form' && !isLoggedIn ? (
            <div className="form-card" style={{ marginTop: 24 }}>
              <h3 style={{ color: 'var(--color-navy)', marginBottom: 8 }}><LogIn /> Already verified? Sign in</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 16, fontSize: '0.9rem' }}>Use the password we emailed after your code was accepted.</p>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" className="form-control" required defaultValue={email} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input name="password" type="password" className="form-control" required minLength={6} />
                </div>
                <button type="submit" className="btn btn-navy" style={{ width: '100%' }} disabled={Boolean(loading)}>
                  {loading === 'login' ? 'Signing in…' : 'Open my Sirah registration'}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
