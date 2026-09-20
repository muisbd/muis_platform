'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Mail, User, CreditCard, Hash, ShieldCheck, Phone, GraduationCap,
  Copy, CheckCircle2, Layers, ChevronDown
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { showToast } from '../utils/toast.js';
import SirahBannerImage from './SirahBannerImage.js';

const BKASH_NUMBER = '+8801576795376';
const BANK_ACCOUNT = '715910100016533';
const BANK_DETAILS = [
  ['Account name', 'Metropolitan University Islamic Society (MUIS)'],
  ['Account number', BANK_ACCOUNT],
  ['Bank', 'NRBC Bank'],
  ['Branch', 'Bateshwar Branch (Islamic Window)'],
  ['Routing number', '260270812']
];
const BANK_COPY = BANK_DETAILS.map(([label, value]) => `${label}: ${value}`).join('\n');

async function copyValue(text, okMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(okMessage);
  } catch {
    showToast('Could not copy. Please copy it manually.', true);
  }
}

export default function SirahConferencePage() {
  const { isStaff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const cashPayment = paymentMethod === 'Cash';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const payload = {
      name: form.name.value.trim(),
      studentId: form.studentId.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      department: form.department.value.trim(),
      batch: form.batch.value.trim(),
      section: form.section.value.trim(),
      paymentMethod,
      trxId: cashPayment ? '' : form.trxId.value.trim(),
      paidTo: cashPayment ? form.paidTo.value.trim() : ''
    };
    setLoading(true);
    try {
      const data = await api('/sirah/register', { method: 'POST', body: payload });
      setSubmitted(payload);
      showToast(data.message || 'Registration submitted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToRegister = () => {
    document.getElementById('sirah-register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page-container page-fade-enter sirah-page">
      <section className="sirah-banner">
        <div className="container sirah-banner-inner">
          <div className="hero-bismillah text-arabic sirah-banner-bismillah">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          <figure className="sirah-banner-frame">
            <SirahBannerImage priority />
          </figure>
          <div className="sirah-banner-copy">
            <div className="eyebrow" style={{ color: '#FBBF24' }}>Metropolitan University Islamic Society</div>
            <h1>Sirah Conference 2026</h1>
            <p className="hero-subtext">
              Pay the fee, copy the number below, then submit your details and transaction ID. MUIS will approve your seat after checking payment.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="sirah-scroll-down"
          onClick={scrollToRegister}
          aria-label="Scroll down to registration"
        >
          <ChevronDown />
        </button>
      </section>

      <section id="sirah-register" className="section sirah-register-section">
        <div className="container" style={{ maxWidth: 860 }}>
          {isStaff ? (
            <p style={{ textAlign: 'center', marginBottom: 20 }}>
              <Link href="/admin" className="btn btn-gold btn-sm">Open Admin: Sirah desk</Link>
            </p>
          ) : null}

          {error ? <div className="join-alert alert-error" role="alert">{error}</div> : null}

          {submitted ? (
            <div className="form-card sirah-success-card">
              <CheckCircle2 className="sirah-success-icon" />
              <h3>Registration submitted</h3>
              <p>
                JazakAllah khair, <strong>{submitted.name}</strong>. We received your form.
                {submitted.paymentMethod === 'Cash' ? (
                  <> MUIS will check cash paid to <strong>{submitted.paidTo}</strong> and then approve or reject your seat.</>
                ) : (
                  <> MUIS will check TrxID <strong>{submitted.trxId}</strong> and then approve or reject your seat.</>
                )}
              </p>
              <dl className="sirah-success-meta">
                <div><dt>Student ID</dt><dd>{submitted.studentId}</dd></div>
                <div><dt>Phone</dt><dd>{submitted.phone}</dd></div>
                <div><dt>Email</dt><dd>{submitted.email}</dd></div>
                <div><dt>Department</dt><dd>{submitted.department}</dd></div>
                {submitted.batch ? <div><dt>Batch</dt><dd>{submitted.batch}</dd></div> : null}
                {submitted.section ? <div><dt>Section</dt><dd>{submitted.section}</dd></div> : null}
                <div><dt>Payment</dt><dd>{submitted.paymentMethod}</dd></div>
                {submitted.paymentMethod === 'Cash' ? (
                  <div><dt>Paid to</dt><dd>{submitted.paidTo}</dd></div>
                ) : (
                  <div><dt>TrxID</dt><dd>{submitted.trxId}</dd></div>
                )}
              </dl>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSubmitted(null);
                  setError('');
                }}
              >
                Submit another registration
              </button>
            </div>
          ) : (
            <>
              <div className="donation-simple-grid sirah-pay-grid">
                <div className="donate-info-card bkash-card">
                  <div className="donate-badge bkash-badge">bKash Send Money</div>
                  <div className="donate-number-display">{BKASH_NUMBER}</div>
                  <button
                    className="btn btn-copy sirah-copy-btn"
                    type="button"
                    onClick={() => copyValue(BKASH_NUMBER, `bKash number ${BKASH_NUMBER} copied`)}
                  >
                    <Copy /> Copy number
                  </button>
                  <div className="donate-details-list">
                    <div><strong>Type:</strong> Personal, Send Money</div>
                    <div><strong>Then:</strong> copy your TrxID into the form below.</div>
                  </div>
                </div>

                <div className="donate-info-card bank-card">
                  <div className="donate-badge bank-badge">NRBC Bank</div>
                  <div className="bank-details-grid">
                    {BANK_DETAILS.map(([label, value]) => (
                      <div key={label}>
                        <small>{label}</small>
                        <strong className={label === 'Account number' ? 'highlight-green' : undefined}>{value}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="sirah-copy-row">
                    <button
                      className="btn btn-copy sirah-copy-btn"
                      type="button"
                      onClick={() => copyValue(BANK_ACCOUNT, 'Account number copied')}
                    >
                      <Copy /> Copy account
                    </button>
                    <button
                      className="btn btn-copy sirah-copy-btn"
                      type="button"
                      onClick={() => copyValue(BANK_COPY, 'Bank details copied')}
                    >
                      <Copy /> Copy all
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-card" style={{ marginTop: 28, maxWidth: 'none' }}>
                <h3 style={{ color: '#F8FAFC', marginBottom: 8 }}><BookOpen /> Register for Sirah 2026</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, fontSize: '0.92rem' }}>
                  Pay first, then enter your transaction ID. This is <strong>Sirah Conference 2026</strong> only, not MUIS membership.
                </p>
                <form onSubmit={handleRegister}>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Participant full name *</label>
                      <div className="input-with-icon">
                        <User className="input-icon" />
                        <input name="name" className="form-control" required placeholder="Your name" autoComplete="name" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Student ID *</label>
                      <div className="input-with-icon">
                        <CreditCard className="input-icon" />
                        <input name="studentId" className="form-control" required placeholder="231-115-052" />
                      </div>
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Phone number *</label>
                      <div className="input-with-icon">
                        <Phone className="input-icon" />
                        <input name="phone" type="tel" className="form-control" required placeholder="01XXXXXXXXX" autoComplete="tel" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <div className="input-with-icon">
                        <Mail className="input-icon" />
                        <input name="email" type="email" className="form-control" required placeholder="student@metrouni.edu.bd" autoComplete="email" />
                      </div>
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Department *</label>
                      <div className="input-with-icon">
                        <GraduationCap className="input-icon" />
                        <input name="department" className="form-control" required placeholder="CSE, BBA, LLB…" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Batch <span className="optional-tag">(if available)</span></label>
                      <div className="input-with-icon">
                        <Layers className="input-icon" />
                        <input name="batch" className="form-control" placeholder="e.g. 231" />
                      </div>
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Section <span className="optional-tag">(if available)</span></label>
                      <input name="section" className="form-control" placeholder="e.g. A" />
                    </div>
                    <div className="form-group">
                      <label>Payment method *</label>
                      <select
                        name="paymentMethod"
                        className="form-control"
                        required
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="bKash">bKash</option>
                        <option value="NRBC Bank">NRBC Bank</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                  </div>
                  {cashPayment ? (
                    <div className="form-group">
                      <label>Paid to (person name) *</label>
                      <div className="input-with-icon">
                        <User className="input-icon" />
                        <input name="paidTo" className="form-control" required placeholder="Name of the person who received the cash" autoComplete="off" />
                      </div>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Transaction ID (TrxID) *</label>
                      <div className="input-with-icon">
                        <Hash className="input-icon" />
                        <input name="trxId" className="form-control" required placeholder="e.g. 9J4K2L8M1N" style={{ fontFamily: 'monospace' }} />
                      </div>
                    </div>
                  )}
                  <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%' }} disabled={loading}>
                    <ShieldCheck /> {loading ? 'Submitting…' : 'Submit registration'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
