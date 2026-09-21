'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Mail, User, CreditCard, Hash, ShieldCheck, Phone, GraduationCap,
  CheckCircle2, Layers, ChevronDown, ChevronLeft, ChevronRight, UserCheck,
  Copy, Check, Smartphone, Wallet, Banknote, PenLine, ArrowRight,
  Calendar, Clock, Sparkles
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { showToast } from '../utils/toast.js';
import { SIRAH_SLIDES, SEERAH_CAROUSEL, WRITING_CONTEST_DEADLINE_EN, WRITING_CONTEST_DEADLINE_SHORT } from '../data/sirahSpeakers.js';
import SeerahContestPoster from './SeerahContestPoster.js';

const BKASH_NUMBER = '+8801576795376';
const REGISTRATION_FEE = '150';
const REGISTRATION_FEE_LABEL = '150 BDT';
const BKASH_COPY_ALL = `Amount: ${REGISTRATION_FEE_LABEL}\nNumber: ${BKASH_NUMBER}\nType: Personal (Send Money)`;

function copyToClipboard(text) {
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

  if (navigator.clipboard?.writeText) {
    return Promise.race([
      navigator.clipboard.writeText(text),
      new Promise((_, reject) => window.setTimeout(() => reject(new Error('clipboard timeout')), 700))
    ]).catch(() => {
      if (!fallbackCopy()) throw new Error('copy failed');
    });
  }
  if (fallbackCopy()) return Promise.resolve();
  return Promise.reject(new Error('copy failed'));
}

function PaymentCopyRow({ field, copied, onCopy }) {
  const isCopied = copied === field.key;
  return (
    <div className="sirah-pay-row">
      <div className="sirah-pay-row-text">
        <span>{field.label}</span>
        <strong>{field.value}</strong>
      </div>
      {field.copyable !== false ? (
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

function useSwipe(onPrev, onNext) {
  const startX = useRef(null);
  return {
    onTouchStart: (event) => {
      startX.current = event.changedTouches[0]?.clientX ?? null;
    },
    onTouchEnd: (event) => {
      if (startX.current == null) return;
      const dx = (event.changedTouches[0]?.clientX ?? startX.current) - startX.current;
      startX.current = null;
      if (dx > 48) onPrev();
      if (dx < -48) onNext();
    }
  };
}

function SeerahCarousel({ slides }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;
  const slide = slides[currentIdx];
  const goPrev = () => setCurrentIdx((idx) => (idx - 1 + total) % total);
  const goNext = () => setCurrentIdx((idx) => (idx + 1) % total);
  const swipe = useSwipe(goPrev, goNext);

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get('slide');
    if (!wanted) return undefined;
    const idx = slides.findIndex((item) => item.id === wanted);
    if (idx < 0) return undefined;
    setCurrentIdx(idx);
    setPaused(true);
    return undefined;
  }, [slides]);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => {
      setCurrentIdx((idx) => (idx + 1) % total);
    }, 4200);
    return () => clearInterval(timer);
  }, [paused, total]);

  const ContestIcon = slide.accent === 'writing' ? PenLine : BookOpen;
  const isSpeakerSlide = slide.kind === 'speaker' && Boolean(slide.image);
  const isContestSlide = slide.kind === 'contest';

  return (
    <div
      className="seerah-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`seerah-carousel-slide seerah-carousel-${slide.kind}${slide.accent ? ` seerah-carousel-${slide.accent}` : ''}${slide.image ? ' has-image' : ''}${isSpeakerSlide ? ' seerah-carousel-speaker-split' : ''}${isContestSlide ? ' seerah-carousel-contest-designed' : ''}`}
        style={!isSpeakerSlide && !isContestSlide && slide.image ? {
          backgroundImage: `url('${slide.image}')`,
          backgroundPosition: slide.position || 'center'
        } : undefined}
        {...swipe}
      >
        <button
          type="button"
          className="sirah-mini-nav prev"
          aria-label="Previous slide"
          onClick={goPrev}
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          className="sirah-mini-nav next"
          aria-label="Next slide"
          onClick={goNext}
        >
          <ChevronRight />
        </button>
        {isSpeakerSlide ? (
          <div className="seerah-speaker-slide">
            <div className="seerah-speaker-copy">
              <span className="seerah-carousel-kicker">{slide.kicker}</span>
              <strong>{slide.title}</strong>
              <em>{slide.caption}</em>
            </div>
            <div className="seerah-speaker-photo-wrap">
              <img src={slide.image} alt={slide.title} />
            </div>
          </div>
        ) : isContestSlide ? (
          <SeerahContestPoster slide={slide} />
        ) : !slide.image ? (
          <div className="seerah-carousel-placeholder">
            <span className="seerah-carousel-icon" aria-hidden="true"><ContestIcon /></span>
            <span className="seerah-carousel-kicker">{slide.kicker}</span>
            <strong>{slide.title}</strong>
            <span>{slide.caption}</span>
          </div>
        ) : (
          <div className="seerah-carousel-caption">
            <span>{slide.kicker}</span>
            <strong>{slide.title}</strong>
            <em>{slide.caption}</em>
          </div>
        )}
      </div>
      <div className="sirah-mini-dots">
        {slides.map((item, idx) => (
          <button
            key={item.id || item.image || item.title}
            type="button"
            className={`sirah-mini-dot${idx === currentIdx ? ' active' : ''}`}
            aria-label={`Slide ${idx + 1}`}
            onClick={() => setCurrentIdx(idx)}
          />
        ))}
      </div>
    </div>
  );
}

function GlimpseSlideshow() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const total = SIRAH_SLIDES.length;
  const slide = SIRAH_SLIDES[currentIdx];
  const goPrev = () => setCurrentIdx((idx) => (idx - 1 + total) % total);
  const goNext = () => setCurrentIdx((idx) => (idx + 1) % total);
  const swipe = useSwipe(goPrev, goNext);

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
        {...swipe}
      >
        <button
          type="button"
          className="sirah-mini-nav prev"
          aria-label="Previous photo"
          onClick={goPrev}
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          className="sirah-mini-nav next"
          aria-label="Next photo"
          onClick={goNext}
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
  const [gender, setGender] = useState('');
  const [batch, setBatch] = useState('');
  const [copied, setCopied] = useState('');
  const [showStickyCta, setShowStickyCta] = useState(false);

  const copyValue = async (text, label) => {
    setCopied(label);
    try {
      await copyToClipboard(text);
    } catch {
      setCopied('');
      showToast('Could not copy. Please copy it manually.', true);
    }
  };

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(''), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

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
      batch: batch.trim(),
      gender,
      paymentMethod: 'bKash',
      trxId: form.trxId.value.trim(),
      paidTo: ''
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

  useEffect(() => {
    if (window.location.hash !== '#sirah-register') return undefined;
    const timer = window.setTimeout(scrollToRegister, 80);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector('.sirah-banner');
      const register = document.getElementById('sirah-register');
      if (!hero || !register || submitted) {
        setShowStickyCta(false);
        return;
      }
      const heroBottom = hero.getBoundingClientRect().bottom;
      const registerTop = register.getBoundingClientRect().top;
      setShowStickyCta(heroBottom < 72 && registerTop > window.innerHeight * 0.58);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [submitted]);

  return (
    <div className="page-container page-fade-enter sirah-page">
      {copied ? (
        <div className="sirah-copied-popup" role="status">
          <CheckCircle2 />
          <span>Copied</span>
        </div>
      ) : null}

      <section className="sirah-banner">
        <div className="hero-islamic-pattern-overlay" />
        <div className="container sirah-banner-inner">
          <div className="hero-bismillah text-arabic sirah-banner-bismillah">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          <div className="sirah-hero-grid sirah-hero-grid-single">
            <div className="sirah-banner-copy">
              <div className="eyebrow" style={{ color: '#FBBF24' }}>Metropolitan University Islamic Society <span className="sirah-presents">presents</span></div>
              <h1>Seerah Conference 2026</h1>
              <span className="sirah-prophet-lead">The timeless life of the Prophet</span>
              <div className="sirah-prophet-honorific">
                <span className="sirah-prophet-arabic-wrap">
                  <span className="sirah-prophet-noor" aria-hidden="true" />
                  <strong className="sirah-prophet-arabic text-arabic" lang="ar" dir="rtl">{'\u0645\u064F\u062D\u064E\u0645\u0651\u064E\u062F'}</strong>
                </span>
                <span className="sirah-prophet-english">Muhammad</span>
                <span className="sirah-prophet-salawat" lang="ar">صلى الله عليه وسلم</span>
              </div>
              <p className="hero-subtext sirah-hero-subtext-full">
                One registration for three programs: Seerah Quiz, Writing Contest, and Seerah Seminar. Writing contest deadline {WRITING_CONTEST_DEADLINE_EN}.
              </p>
              <p className="hero-subtext sirah-hero-subtext-short">
                One registration covers Quiz, Writing Contest, and Seminar. Writing deadline {WRITING_CONTEST_DEADLINE_EN}.
              </p>
              <div className="sirah-hero-meta">
                <span><Calendar /> 17 Oct · Saturday</span>
                <span><Clock /> Starts 11 AM</span>
                <span><PenLine /> Writing deadline {WRITING_CONTEST_DEADLINE_SHORT}</span>
                <span><Banknote /> {REGISTRATION_FEE_LABEL}</span>
              </div>
              <div className="sirah-hero-actions">
                <button type="button" className="btn btn-gold" onClick={scrollToRegister}>
                  Register now
                </button>
                <Link href="/seerah-2026/details" className="btn btn-outline sirah-hero-details-btn">
                  Event details <ArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="sirah-scroll-down"
          onClick={() => {
            document.getElementById('seerah-programs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          aria-label="Scroll down to see more"
        >
          <span>Scroll down</span>
          <ChevronDown />
        </button>
      </section>

      <section id="seerah-programs" className="section seerah-carousel-section">
        <div className="container">
          <div className="section-header seerah-section-header">
            <div className="eyebrow" style={{ color: '#FBBF24' }}><Sparkles /> This year’s highlights</div>
            <h2>What’s on at Seerah 2026</h2>
            <p>Quiz, writing contest, and seminar. One registration. Writing contest deadline {WRITING_CONTEST_DEADLINE_EN}.</p>
          </div>

          <div className="seerah-highlights-carousel">
            <SeerahCarousel slides={SEERAH_CAROUSEL} />
          </div>
          <p className="seerah-carousel-note">
            <Link href="/seerah-2026/details">Read full event details</Link>
          </p>
        </div>
      </section>

      <section id="sirah-register" className="section sirah-register-section">
        <div className="container" style={{ maxWidth: 860 }}>
          {isStaff ? (
            <p style={{ textAlign: 'center', marginBottom: 20 }}>
              <Link href="/admin" className="btn btn-gold btn-sm">Open Admin: Seerah desk</Link>
            </p>
          ) : null}

          {error ? <div className="join-alert alert-error" role="alert">{error}</div> : null}

          {submitted ? (
            <div className="form-card sirah-success-card">
              <CheckCircle2 className="sirah-success-icon" />
              <h3>Registration submitted</h3>
              <p>
                JazakAllah khair, <strong>{submitted.name}</strong>. We received your form.
                MUIS will check TrxID <strong>{submitted.trxId}</strong> and then approve or reject your seat.
              </p>
              <dl className="sirah-success-meta">
                <div><dt>Student ID</dt><dd>{submitted.studentId}</dd></div>
                <div><dt>Phone</dt><dd>{submitted.phone}</dd></div>
                <div><dt>Email</dt><dd>{submitted.email}</dd></div>
                <div><dt>Department</dt><dd>{submitted.department}</dd></div>
                {submitted.batch ? <div><dt>Batch</dt><dd>{submitted.batch}</dd></div> : null}
                {submitted.gender ? <div><dt>Gender</dt><dd>{submitted.gender}</dd></div> : null}
                <div><dt>Payment</dt><dd>bKash</dd></div>
                <div><dt>TrxID</dt><dd>{submitted.trxId}</dd></div>
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
              <div className="sirah-pay-card sirah-pay-card-bkash">
                <div className="sirah-pay-card-head">
                  <div className="sirah-pay-card-labels">
                    <span className="sirah-pay-kicker"><Wallet /> Step 1 · Pay with bKash</span>
                    <span className="sirah-pay-modal-badge">Send Money</span>
                  </div>
                  <h3><Smartphone /> bKash Payment Info</h3>
                  <div className="sirah-fee-badge">
                    <Banknote />
                    Registration fee <strong>{REGISTRATION_FEE_LABEL}</strong>
                  </div>
                  <p>Send {REGISTRATION_FEE_LABEL} to this personal bKash number, then paste the TrxID in the form below.</p>
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
                  <span>bKash number</span>
                  <strong>{BKASH_NUMBER}</strong>
                  <button
                    type="button"
                    className={`sirah-pay-copy sirah-pay-copy-hero${copied === 'hero' ? ' copied' : ''}`}
                    onClick={() => copyValue(BKASH_NUMBER, 'hero')}
                  >
                    {copied === 'hero' ? <Check /> : <Copy />}
                    {copied === 'hero' ? 'Copied' : 'Copy number'}
                  </button>
                </div>
                <div className="sirah-pay-rows">
                  <PaymentCopyRow
                    field={{ key: 'type', label: 'Account type', value: 'Personal (Send Money)', copyable: false }}
                    copied={copied}
                    onCopy={copyValue}
                  />
                </div>
                <ol className="sirah-pay-steps">
                  <li>Open the bKash app</li>
                  <li>Tap Send Money</li>
                  <li>Paste the number and send {REGISTRATION_FEE_LABEL}</li>
                  <li>Copy the TrxID into the form</li>
                </ol>
                <button
                  type="button"
                  className="btn btn-outline sirah-pay-copy-all"
                  onClick={() => copyValue(BKASH_COPY_ALL, 'all')}
                >
                  {copied === 'all' ? <Check /> : <Copy />}
                  <span className="sirah-copy-label-full">{copied === 'all' ? 'Copied all details' : 'Copy bKash number & amount'}</span>
                  <span className="sirah-copy-label-short">{copied === 'all' ? 'Copied' : 'Copy all details'}</span>
                </button>
              </div>

              <div className="form-card" style={{ marginTop: 28, maxWidth: 'none' }}>
                <div className="sirah-form-head">
                  <div>
                    <h3 style={{ color: '#F8FAFC', marginBottom: 8 }}>
                      <BookOpen /> Step 2 · Register<span className="sirah-form-title-rest"> for Seerah 2026</span>
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 0, fontSize: '0.92rem' }}>
                      Pay the <strong>{REGISTRATION_FEE_LABEL}</strong> fee first, then enter your TrxID.
                      This covers the quiz, writing contest, and seminar. Send writing contest entries by {WRITING_CONTEST_DEADLINE_EN}. This is not MUIS membership.
                    </p>
                  </div>
                  <Link href="/seerah-2026/details" className="btn btn-outline btn-sm sirah-form-details-link">Event details</Link>
                </div>
                <form onSubmit={handleRegister} style={{ marginTop: 20 }}>
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
                        <input name="studentId" className="form-control" required placeholder="231-115-052" autoComplete="off" />
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
                      <label>Batch</label>
                      <div className="input-with-icon">
                        <Layers className="input-icon" />
                        <input
                          name="batch"
                          type="number"
                          inputMode="numeric"
                          min="1"
                          className="form-control"
                          value={batch}
                          onChange={(e) => setBatch(e.target.value)}
                          placeholder="e.g. 62"
                        />
                      </div>
                    </div>
                  </div>
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
                    <label>bKash Transaction ID (TrxID) *</label>
                    <div className="input-with-icon">
                      <Hash className="input-icon" />
                      <input id="sirah-trx-id" name="trxId" className="form-control" required placeholder="e.g. 9J4K2L8M1N" style={{ fontFamily: 'monospace' }} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%' }} disabled={loading}>
                    <ShieldCheck /> {loading ? 'Submitting…' : 'Submit registration'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section sirah-glimpse-section">
        <div className="container">
          <GlimpseSlideshow />
        </div>
      </section>

      {showStickyCta ? (
        <div className="sirah-sticky-cta">
          <div className="sirah-sticky-cta-copy">
            <strong>Register · {REGISTRATION_FEE_LABEL}</strong>
            <span>Writing deadline {WRITING_CONTEST_DEADLINE_SHORT}</span>
          </div>
          <button type="button" className="btn btn-gold" onClick={scrollToRegister}>
            Register
          </button>
        </div>
      ) : null}
    </div>
  );
}
