'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import PageHeader from './PageHeader.js';

export default function LoginPage() {
  const { login, isLoggedIn, isStaff } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) router.replace(isStaff ? '/admin' : '/');
  }, [isLoggedIn, isStaff, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    setLoading(true);
    try {
      const user = await login(form.email.value.trim(), form.password.value);
      if (['admin', 'moderator', 'treasurer'].includes(user.role)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="Member login" description="Sign in with the email and password from your Join MUIS application." />
      <section className="section">
        <div className="container">
          <div className="form-card auth-card">
            <h3 style={{ color: 'var(--color-navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <LogIn /> Welcome back
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, fontSize: '0.92rem' }}>
              Courses stay locked until a committee officer approves your membership. Super admin lands in Admin after login.
            </p>
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
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
            <p style={{ marginTop: 16, fontSize: '0.9rem', textAlign: 'center' }}>
              New student? <Link href="/join" style={{ color: 'var(--color-navy)', fontWeight: 700 }}>Join MUIS</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
