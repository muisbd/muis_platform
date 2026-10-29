'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import PageHeader from './PageHeader.js';
import SignInOptions from './SignInOptions.js';

function nextPath() {
  if (typeof window === 'undefined') return '';
  const next = new URLSearchParams(window.location.search).get('next') || '';
  return next.startsWith('/') && !next.startsWith('//') ? next : '';
}

export default function LoginPage() {
  const { login, isLoggedIn, isStaff, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (user?.role === 'lu_verifier') router.replace('/lu-verify');
    else if (isStaff) router.replace(nextPath() || '/admin');
    else router.replace(nextPath() || '/account');
  }, [isLoggedIn, isStaff, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    setLoading(true);
    try {
      await login(form.email.value.trim(), form.password.value);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="Sign in" description="Sign in with Google. No password needed. Your account is created the first time you sign in." />
      <section className="section">
        <div className="container">
          <div className="form-card auth-card">
            <h3 style={{ color: 'var(--color-navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <LogIn /> Welcome
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, fontSize: '0.92rem' }}>
              Use this to get your Seerah Conference 2026 certificate and MUIS updates.
            </p>
            <SignInOptions />

            <details className="signin-members">
              <summary>MUIS members and committee: sign in with password</summary>
              {error ? <div className="join-alert alert-error" role="alert">{error}</div> : null}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="login-email">Email *</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" />
                    <input id="login-email" name="email" type="email" className="form-control" required placeholder="student@metrouni.edu.bd" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="login-password">Password *</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" />
                    <input id="login-password" name="password" type="password" className="form-control" required minLength={6} />
                  </div>
                </div>
                <button type="submit" className="btn btn-navy btn-lg" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in with password'}
                </button>
              </form>
              <p style={{ marginTop: 16, fontSize: '0.9rem', textAlign: 'center' }}>
                Want to become a member? <Link href="/join" style={{ color: 'var(--color-navy)', fontWeight: 700 }}>Join MUIS</Link>
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
