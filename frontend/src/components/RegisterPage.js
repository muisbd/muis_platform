'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import PageHeader from './PageHeader.js';

export default function RegisterPage() {
  const { register, isLoggedIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) router.replace('/progress');
  }, [isLoggedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    setLoading(true);
    try {
      await register({
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
        studentId: form.studentId.value.trim(),
        phone: form.phone.value.trim(),
        department: form.department.value.trim(),
        gender: form.gender.value
      });
      router.push('/progress');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="Create a student account" description="Needed for the private salah journal. Join MUIS membership is a separate form and does not require login." />
      <section className="section">
        <div className="container">
          <div className="form-card auth-card">
            <h3 style={{ color: 'var(--color-navy)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserPlus /> Register
            </h3>
            {error ? <div className="join-alert alert-error" role="alert">{error}</div> : null}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <div className="input-with-icon">
                  <User className="input-icon" />
                  <input name="name" className="form-control" required placeholder="Your name" />
                </div>
              </div>
              <div className="form-group">
                <label>University Email *</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" />
                  <input name="email" type="email" className="form-control" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password * (min 6)</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" />
                    <input name="password" type="password" className="form-control" required minLength={6} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Student ID</label>
                  <div className="input-with-icon">
                    <CreditCard className="input-icon" />
                    <input name="studentId" className="form-control" placeholder="231-115-052" />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" className="form-control" />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input name="department" className="form-control" placeholder="CSE" />
                </div>
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" className="form-control" defaultValue="">
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <button type="submit" className="btn btn-navy btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
            <p style={{ marginTop: 16, fontSize: '0.9rem', textAlign: 'center' }}>
              Already registered? <Link href="/login" style={{ color: 'var(--color-navy)', fontWeight: 700 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
