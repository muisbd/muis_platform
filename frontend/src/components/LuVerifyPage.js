'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LogIn, Mail } from 'lucide-react';
import PageHeader from './PageHeader.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { showToast } from '../utils/toast.js';

function fmt(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

export default function LuVerifyPage() {
  const { user, ready, isLuVerifier, loginLu, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (!ready || !isLuVerifier) return undefined;
    let cancelled = false;
    setLoading(true);
    api('/lu-verify')
      .then((data) => {
        if (!cancelled) setRows(data.list || []);
      })
      .catch((err) => {
        if (!cancelled) showToast(err.message, true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, isLuVerifier]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginLu(email.trim(), password);
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const decide = async (id, decision) => {
    try {
      const data = await api(`/lu-verify/${id}`, { method: 'PATCH', body: { decision } });
      showToast(data.message || 'Saved.');
      setRows((current) => current.map((row) => (row.id === id ? { ...row, ...data.row, _id: row._id } : row)));
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const visible = rows.filter((row) => {
    if (filter === 'pending') return row.luStatus === 'pending' && row.status !== 'accepted' && row.status !== 'rejected';
    if (filter === 'verified') return row.luStatus === 'verified';
    if (filter === 'rejected') return row.luStatus === 'rejected' || (row.status === 'rejected' && row.luStatus !== 'verified');
    return true;
  });

  return (
    <div className="page-container page-fade-enter admin-page">
      <PageHeader
        title="Leading University check"
        description="Confirm only whether this person is a Leading University student. MUIS checks the payment."
        eyebrow="Verification only"
        parentPage="Seerah 2026"
        parentHash="/seerah-2026"
      />
      <section className="section" style={{ paddingTop: 12 }}>
        <div className="container" style={{ maxWidth: 860 }}>
          {!ready ? <p>Loading…</p> : null}

          {ready && user && !isLuVerifier ? (
            <div className="form-card" style={{ maxWidth: 'none' }}>
              <p>This page is only for the Leading University verification login.</p>
              <button type="button" className="btn btn-outline" onClick={() => router.push('/admin')}>Back to MUIS admin</button>
            </div>
          ) : null}

          {ready && !user ? (
            <div className="form-card auth-card" style={{ maxWidth: 480 }}>
              <h3 style={{ color: 'var(--color-navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <LogIn /> Sign in to verify
              </h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, fontSize: '0.92rem' }}>
                One shared login. You can only say yes or no. You cannot accept the seat or see other registrations.
              </p>
              {error ? <div className="join-alert alert-error" role="alert">{error}</div> : null}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="lu-email">Email *</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" />
                    <input id="lu-email" type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="lu-password">Password *</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" />
                    <input id="lu-password" type="password" className="form-control" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                  </div>
                </div>
                <button type="submit" className="btn btn-navy btn-lg" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            </div>
          ) : null}

          {ready && isLuVerifier ? (
            <div className="admin-table-wrap">
              <div className="sirah-admin-toolbar">
                <div className="sirah-filter-row">
                  {[
                    ['pending', 'Waiting'],
                    ['verified', 'Verified'],
                    ['rejected', 'Not their student'],
                    ['all', 'All']
                  ].map(([id, label]) => (
                    <button key={id} type="button" className={`tab-btn${filter === id ? ' active' : ''}`} onClick={() => setFilter(id)}>
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={async () => {
                    await logout();
                    setRows([]);
                  }}
                >
                  Sign out
                </button>
              </div>
              {loading ? <p>Loading…</p> : null}
              {!loading && !visible.length ? <p className="admin-meta">No students in this list.</p> : null}
              {visible.map((row) => {
                const waiting = row.luStatus === 'pending' && row.status !== 'accepted' && row.status !== 'rejected';
                return (
                  <div key={row.id} className="admin-row">
                    <div>
                      <div className="admin-row-title">
                        <strong>{row.name}</strong>
                        <span className={`admin-badge admin-badge-${row.luStatus === 'verified' ? 'accepted' : row.luStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                          {row.luStatus === 'verified' ? 'Verified' : row.luStatus === 'rejected' ? 'Not their student' : 'Waiting'}
                        </span>
                      </div>
                      <div className="admin-meta">{row.studentId} · {row.department || 'No department'}{row.batch ? ` · Batch ${row.batch}` : ''}</div>
                      <div className="admin-meta">{row.gender || 'Gender not given'} · {row.phone || 'no phone'} · {row.email}</div>
                      <div className="admin-meta">{fmt(row.createdAt)}{row.status === 'accepted' ? ' · MUIS accepted the seat' : ''}{row.status === 'rejected' && row.luStatus === 'verified' ? ' · MUIS did not accept the seat' : ''}</div>
                    </div>
                    <div className="admin-actions">
                      {waiting ? (
                        <>
                          <button type="button" className="btn btn-sm btn-emerald" onClick={() => decide(row.id, 'verified')}>Yes, our student</button>
                          <button type="button" className="btn btn-sm btn-outline" onClick={() => decide(row.id, 'rejected')}>No, not our student</button>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
