'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  BookOpen, Mail, User, CreditCard, Hash, ShieldCheck, Phone, GraduationCap,
  CheckCircle2, Layers, ChevronDown, ChevronLeft, ChevronRight, UserCheck, Mic,
  Copy, Check, X, Smartphone, Landmark, Wallet, Banknote
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { showToast } from '../utils/toast.js';
import { SIRAH_SPEAKERS, SIRAH_SLIDES } from '../data/sirahSpeakers.js';

const BKASH_NUMBER = '+8801576795376';
const BANK_ACCOUNT = '715910100016533';
const REGISTRATION_FEE = '150';
const REGISTRATION_FEE_LABEL = '150 BDT';
const BANK_DETAILS = [
  ['Account name', 'Metropolitan University Islamic Society (MUIS)'],
  ['Account number', BANK_ACCOUNT],
  ['Bank', 'NRBC Bank'],
  ['Branch', 'Bateshwar Branch (Islamic Window)'],
  ['Routing number', '260270812']
];
const BANK_COPY = BANK_DETAILS.map(([label, value]) => `${label}: ${value}`).join('\n');

const PAYMENT_INFO = {
  bKash: {
    method: 'bKash',
    title: 'bKash Payment Info',
    badge: 'Send Money',
    accent: 'bkash',
    intro: `Send ${REGISTRATION_FEE_LABEL} to this personal bKash number, then paste the TrxID in the registration form.`,
    hero: { label: 'bKash number', value: BKASH_NUMBER },
    fields: [
      { key: 'type', label: 'Account type', value: 'Personal (Send Money)', copyable: false }
    ],
    steps: ['Open the bKash app', 'Tap Send Money', `Paste the number and send ${REGISTRATION_FEE_LABEL}`, 'Copy the TrxID into the form'],
    copyAll: `Amount: ${REGISTRATION_FEE_LABEL}\nNumber: ${BKASH_NUMBER}`,
    copyAllLabel: 'Copy bKash number'
  },
  bank: {
    method: 'NRBC Bank',
    title: 'NRBC Bank Payment Info',
    badge: 'Bank Transfer',
    accent: 'bank',
    intro: `Transfer ${REGISTRATION_FEE_LABEL} to this MUIS NRBC account, then paste the transaction ID or reference in the registration form.`,
    hero: { label: 'Account number', value: BANK_ACCOUNT },
    fields: BANK_DETAILS.map(([label, value]) => ({
      key: label,
      label,
      value
    })),
    steps: ['Open your bank or NRBC app', `Send ${REGISTRATION_FEE_LABEL} to this account`, 'Save the transaction ID', 'Paste it in the form below'],
    copyAll: `Amount: ${REGISTRATION_FEE_LABEL}\n${BANK_COPY}`,
    copyAllLabel: 'Copy all bank details'
  }
};

function PaymentCopyRow({ field, copied, onCopy, emphasize }) {
  const isCopied = copied === field.key;
  const copyable = field.copyable !== false;
  return (
    <div className={`sirah-pay-row${emphasize ? ' emphasize' : ''}`}>
      <div className="sirah-pay-row-text">
        <span>{field.label}</span>
        <strong>{field.value}</strong>
      </div>
      {copyable ? (
        <button
          type="button"
          className={`sirah-pay-copy${isCopied ? ' copied' : ''}`}
          onClick={() => onCopy(field.value, field.key)}
          aria-label={`Copy ${field.label}`}
        >
          {isCopied ? <Check /> : <Copy />}
          {isCopied ? 'Copied' : 'Copy'}
        </button>
      ) : null}
    </div>
  );
}

function SirahSlideshow() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const total = SIRAH_SLIDES.length;
  const slide = SIRAH_SLIDES[currentIdx];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((idx) => (idx + 1) % total);
    }, 3200);
    return () => clearInterval(timer);
  }, [total]);

  return (
    <div className="sirah-mini-slideshow">
      <div className="sirah-glimpse-header">
        <div className="eyebrow" style={{ color: '#FBBF24' }}>Previous year</div>
        <h2>Glimpse of our Seerah Conference 2025</h2>
      </div>
      <div
        className="sirah-mini-slide"
        style={{
          backgroundImage: `url('${slide.image}')`,
          backgroundPosition: slide.position || 'center'
        }}
      >
        <button
          type="button"
          className="sirah-mini-nav prev"
          aria-label="Previous photo"
          onClick={() => setCurrentIdx((idx) => (idx - 1 + total) % total)}
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          className="sirah-mini-nav next"
          aria-label="Next photo"
          onClick={() => setCurrentIdx((idx) => (idx + 1) % total)}
        >
          <ChevronRight />
        </button>
        <div className="sirah-mini-caption">
          <strong>{slide.title}</strong>
          <span>{slide.caption}</span>
        </div>
      </div>
      <div className="sirah-mini-dots">
        {SIRAH_SLIDES.map((item, idx) => (
          <button
            key={item.image}
            type="button"
            className={`sirah-mini-dot${idx === currentIdx ? ' active' : ''}`}
            aria-label={`Photo ${idx + 1}`}
            onClick={() => setCurrentIdx(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default function SirahConferencePage() {
  const { isStaff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [gender, setGender] = useState('');
  const [copied, setCopied] = useState('');
  const [payModal, setPayModal] = useState('');
  const cashPayment = paymentMethod === 'Cash';
  const activePay = payModal ? PAYMENT_INFO[payModal] : null;

  const copyValue = async (text, label) => {
    setCopied(label);
    const fallbackCopy = () => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(area);
      area.focus();
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    };

    try {
      if (navigator.clipboard?.writeText) {
        await Promise.race([
          navigator.clipboard.writeText(text),
          new Promise((_, reject) => window.setTimeout(() => reject(new Error('clipboard timeout')), 700))
        ]);
        return;
      }
      if (fallbackCopy()) return;
    } catch {
      try {
        if (fallbackCopy()) return;
      } catch {
        /* continue to toast */
      }
    }
    setCopied('');
    showToast('Could not copy. Please copy it manually.', true);
  };

  const openPayModal = (key) => {
    const info = PAYMENT_INFO[key];
    setPaymentMethod(info.method);
    setPayModal(key);
  };

  const closePayModal = () => setPayModal('');

  const continueToForm = () => {
    closePayModal();
    window.setTimeout(() => {
      const field = document.getElementById('sirah-trx-id');
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field?.focus();
    }, 50);
  };

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(''), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!payModal) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setPayModal('');
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [payModal]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (gender !== 'Male' && gender !== 'Female') {
      setError('Please choose Male or Female.');
      return;
    }
    const form = e.currentTarget;
    const payload = {
      name: form.name.value.trim(),
      studentId: form.studentId.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      department: form.department.value.trim(),
      batch: form.batch.value.trim(),
      gender,
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
      {copied && !payModal ? (
        <div className="sirah-copied-popup" role="status">
          <CheckCircle2 />
          <span>Copied</span>
        </div>
      ) : null}

      <section className="sirah-banner">
        <div className="hero-islamic-pattern-overlay" />
        <div className="hero-glow-orb hero-glow-orb-purple" />
        <div className="hero-glow-orb hero-glow-orb-cyan" />
        <div className="container sirah-banner-inner">
          <div className="hero-bismillah text-arabic sirah-banner-bismillah">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          <div className="sirah-hero-grid">
            <div className="sirah-banner-copy">
              <div className="eyebrow" style={{ color: '#FBBF24' }}>Metropolitan University Islamic Society</div>
              <h1>Sirah Conference 2026</h1>
              <p className="hero-subtext">
                Immerse yourself in the timeless life of the Prophet Muhammad (<span className="text-arabic">صلى الله عليه وسلم</span>). Discover enduring lessons of compassion, resilience, and moral excellence that illuminate our personal lives, strengthen faith, and guide communities.
              </p>
              <p className="sirah-fee-inline">Registration fee {REGISTRATION_FEE_LABEL}</p>
            </div>

            <div className="sirah-speakers">
              <div className="sirah-speakers-label">
                <Mic /> Our Honorable Speakers
              </div>
              <div className="sirah-speaker-collage">
                {SIRAH_SPEAKERS.map((speaker) => (
                  <figure key={speaker.name} className="sirah-speaker-card">
                    {speaker.photo ? (
                      <div className="sirah-speaker-photo">
                        <img src={speaker.photo} alt={speaker.name} />
                      </div>
                    ) : (
                      <div className="sirah-speaker-placeholder" aria-hidden="true">
                        <User />
                      </div>
                    )}
                    <figcaption>
                      <strong>{speaker.name}</strong>
                      <span>{speaker.title}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
          <SirahSlideshow />
        </div>
        <button
          type="button"
          className="sirah-scroll-down"
          onClick={scrollToRegister}
          aria-label="Scroll down to registration"
        >
          <span>Scroll</span>
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
                {submitted.gender ? <div><dt>Gender</dt><dd>{submitted.gender}</dd></div> : null}
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
              <div className="sirah-pay-panel">
                <div className="sirah-pay-panel-head">
                  <span className="sirah-pay-kicker"><Wallet /> Step 1 · Payment details</span>
                  <h3>Choose how you will pay</h3>
                  <div className="sirah-fee-badge">
                    <Banknote />
                    Registration fee <strong>{REGISTRATION_FEE_LABEL}</strong>
                  </div>
                  <p>Send {REGISTRATION_FEE_LABEL}, then tap a button for the full payment info. Copy what you need and paste your TrxID in the form.</p>
                </div>
                <div className="sirah-pay-buttons">
                  <button
                    type="button"
                    className="sirah-pay-trigger sirah-pay-bkash"
                    onClick={() => openPayModal('bKash')}
                  >
                    <span className="sirah-pay-trigger-icon" aria-hidden="true"><Smartphone /></span>
                    <span className="sirah-pay-trigger-copy">
                      <strong>bKash Payment Info</strong>
                      <em>Send Money · View number & copy</em>
                    </span>
                    <ChevronRight />
                  </button>
                  <button
                    type="button"
                    className="sirah-pay-trigger sirah-pay-bank"
                    onClick={() => openPayModal('bank')}
                  >
                    <span className="sirah-pay-trigger-icon" aria-hidden="true"><Landmark /></span>
                    <span className="sirah-pay-trigger-copy">
                      <strong>NRBC Payment Info</strong>
                      <em>Bank transfer · View account & copy</em>
                    </span>
                    <ChevronRight />
                  </button>
                </div>
              </div>

              <div className="form-card" style={{ marginTop: 28, maxWidth: 'none' }}>
                <h3 style={{ color: '#F8FAFC', marginBottom: 8 }}><BookOpen /> Step 2 · Register for Sirah 2026</h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, fontSize: '0.92rem' }}>
                  Pay the <strong>{REGISTRATION_FEE_LABEL}</strong> registration fee first, then enter your transaction ID. This is <strong>Sirah Conference 2026</strong> only, not MUIS membership.
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
                      <label>Gender *</label>
                      <div className="radio-card-group">
                        <label className={`radio-card${gender === 'Male' ? ' selected' : ''}`}>
                          <input type="radio" name="gender" value="Male" checked={gender === 'Male'} required onChange={() => setGender('Male')} />
                          <span className="radio-card-btn"><UserCheck /> Male</span>
                        </label>
                        <label className={`radio-card${gender === 'Female' ? ' selected' : ''}`}>
                          <input type="radio" name="gender" value="Female" checked={gender === 'Female'} required onChange={() => setGender('Female')} />
                          <span className="radio-card-btn"><User /> Female</span>
                        </label>
                      </div>
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
                        <input id="sirah-trx-id" name="trxId" className="form-control" required placeholder="e.g. 9J4K2L8M1N" style={{ fontFamily: 'monospace' }} />
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

      {activePay
        ? createPortal(
          <div className="sirah-pay-modal" role="dialog" aria-modal="true" aria-labelledby="sirah-pay-modal-title">
            <div className="sirah-pay-modal-backdrop" onClick={closePayModal} />
            <div className={`sirah-pay-modal-card sirah-pay-modal-${activePay.accent}`} onClick={(event) => event.stopPropagation()}>
              <button type="button" className="sirah-pay-modal-close" onClick={closePayModal} aria-label="Close">
                <X />
              </button>
              <div className="sirah-pay-modal-head">
                <span className="sirah-pay-modal-badge">{activePay.badge}</span>
                <h3 id="sirah-pay-modal-title">{activePay.title}</h3>
                <p>{activePay.intro}</p>
              </div>
              <div className="sirah-pay-amount">
                <div className="sirah-pay-amount-text">
                  <span>Registration fee</span>
                  <strong>{REGISTRATION_FEE_LABEL}</strong>
                </div>
                <button
                  type="button"
                  className={`sirah-pay-copy${copied === 'fee' ? ' copied' : ''}`}
                  onClick={() => copyValue(REGISTRATION_FEE, 'fee')}
                >
                  {copied === 'fee' ? <Check /> : <Copy />}
                  {copied === 'fee' ? 'Copied' : 'Copy 150'}
                </button>
              </div>
              <div className="sirah-pay-hero">
                <span>{activePay.hero.label}</span>
                <strong>{activePay.hero.value}</strong>
                <button
                  type="button"
                  className={`sirah-pay-copy sirah-pay-copy-hero${copied === 'hero' ? ' copied' : ''}`}
                  onClick={() => copyValue(activePay.hero.value, 'hero')}
                >
                  {copied === 'hero' ? <Check /> : <Copy />}
                  {copied === 'hero' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="sirah-pay-modal-body">
                <div className="sirah-pay-rows">
                  {activePay.fields.map((field) => (
                    <PaymentCopyRow
                      key={field.key}
                      field={field}
                      copied={copied}
                      onCopy={copyValue}
                      emphasize={field.value === activePay.hero.value}
                    />
                  ))}
                </div>
                <ol className="sirah-pay-steps">
                  {activePay.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="sirah-pay-modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => copyValue(activePay.copyAll, 'all')}
                >
                  {copied === 'all' ? <Check /> : <Copy />}
                  {copied === 'all' ? 'Copied all details' : activePay.copyAllLabel}
                </button>
                <button type="button" className="btn btn-gold" onClick={continueToForm}>
                  Continue to form
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
        : null}
    </div>
  );
}
