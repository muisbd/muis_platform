'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import PageHeader from './PageHeader.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { showToast } from '../utils/toast.js';

const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' }
];

const SALAH_OPTIONS = [
  { value: 'prayed', label: 'Prayed' },
  { value: 'missed', label: 'Missed' },
  { value: 'qada', label: 'Qada' }
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(key, days) {
  const d = new Date(`${key}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(key) {
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

const emptySalah = () => ({
  fajr: 'unset',
  dhuhr: 'unset',
  asr: 'unset',
  maghrib: 'unset',
  isha: 'unset'
});

export default function ProgressPage() {
  const { ready, isLoggedIn } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(todayKey);
  const [form, setForm] = useState({
    salah: emptySalah(),
    avoidedSin: false,
    avoidedSinNote: '',
    helpedSomeone: false,
    helpedSomeoneNote: '',
    productive: false,
    tahajjud: false,
    quranPages: 0
  });
  const [summary, setSummary] = useState({ totalPoints: 0, daysLogged: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn) router.replace('/login');
  }, [ready, isLoggedIn, router]);

  const loadDay = async (day) => {
    try {
      const data = await api(`/progress/day/${day}`);
      if (data.log) {
        setForm({
          salah: { ...emptySalah(), ...(data.log.salah || {}) },
          avoidedSin: data.log.avoidedSin,
          avoidedSinNote: data.log.avoidedSinNote || '',
          helpedSomeone: data.log.helpedSomeone,
          helpedSomeoneNote: data.log.helpedSomeoneNote || '',
          productive: data.log.productive,
          tahajjud: data.log.tahajjud,
          quranPages: data.log.quranPages || 0
        });
      } else {
        setForm({
          salah: emptySalah(),
          avoidedSin: false,
          avoidedSinNote: '',
          helpedSomeone: false,
          helpedSomeoneNote: '',
          productive: false,
          tahajjud: false,
          quranPages: 0
        });
      }
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await api('/progress');
      setSummary(data);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    loadDay(date);
    loadSummary();
  }, [isLoggedIn, date]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api(`/progress/day/${date}`, { method: 'PUT', body: form });
      showToast('Saved privately. Only you can see this log.');
      loadSummary();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const setSalah = (key, value) => {
    setForm((f) => {
      const next = f.salah[key] === value ? 'unset' : value;
      return { ...f, salah: { ...f.salah, [key]: next } };
    });
  };

  if (!ready || !isLoggedIn) return null;

  return (
    <div className="page-container page-fade-enter">
      <PageHeader
        title="Private daily progress"
        description="Your salah and character log. Only you can see it — MUIS staff cannot."
        eyebrow="Personal journal"
      />
      <section className="section progress-section">
        <div className="container">
          <form className="progress-notebook" onSubmit={save}>
            <div className="progress-notebook-top">
              <div className="progress-lock-note">
                <Lock size={16} /> Private — not visible to admin
              </div>
              <div className="progress-stats">
                <div className="progress-stat">
                  <strong>{summary.totalPoints || 0}</strong>
                  <span>Points</span>
                </div>
                <div className="progress-stat">
                  <strong>{summary.daysLogged || 0}</strong>
                  <span>Days logged</span>
                </div>
              </div>
            </div>

            <div className="progress-date-nav">
              <button type="button" className="progress-date-btn" onClick={() => setDate(shiftDate(date, -1))} aria-label="Previous day">
                <ChevronLeft />
              </button>
              <div className="progress-date-label">
                <Calendar size={18} />
                <span>{formatDateLabel(date)}</span>
              </div>
              <button type="button" className="progress-date-btn" onClick={() => setDate(shiftDate(date, 1))} aria-label="Next day">
                <ChevronRight />
              </button>
              {date !== todayKey() ? (
                <button type="button" className="progress-today-btn" onClick={() => setDate(todayKey())}>Today</button>
              ) : null}
            </div>

            <h3>Fard salah</h3>
            <p className="progress-hint">Tap once to choose. Tap again to clear.</p>
            <div className="salah-cards">
              {PRAYERS.map((p) => (
                <div key={p.key} className={`salah-card salah-card-${form.salah[p.key]}`}>
                  <div className="salah-card-name">{p.label}</div>
                  <div className="salah-options">
                    {SALAH_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`salah-opt salah-opt-${opt.value}${form.salah[p.key] === opt.value ? ' active' : ''}`}
                        onClick={() => setSalah(p.key, opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <h3>Also today</h3>
            <div className="habit-grid">
              <button
                type="button"
                className={`habit-card${form.avoidedSin ? ' on' : ''}`}
                onClick={() => setForm((f) => ({ ...f, avoidedSin: !f.avoidedSin }))}
              >
                <span className="habit-mark">{form.avoidedSin ? '✓' : ''}</span>
                <span>I recognized a sin and held back</span>
              </button>
              <button
                type="button"
                className={`habit-card${form.helpedSomeone ? ' on' : ''}`}
                onClick={() => setForm((f) => ({ ...f, helpedSomeone: !f.helpedSomeone }))}
              >
                <span className="habit-mark">{form.helpedSomeone ? '✓' : ''}</span>
                <span>I helped someone with no expected return</span>
              </button>
              <button
                type="button"
                className={`habit-card${form.productive ? ' on' : ''}`}
                onClick={() => setForm((f) => ({ ...f, productive: !f.productive }))}
              >
                <span className="habit-mark">{form.productive ? '✓' : ''}</span>
                <span>Today was productive for studies and deen</span>
              </button>
              <button
                type="button"
                className={`habit-card${form.tahajjud ? ' on' : ''}`}
                onClick={() => setForm((f) => ({ ...f, tahajjud: !f.tahajjud }))}
              >
                <span className="habit-mark">{form.tahajjud ? '✓' : ''}</span>
                <span>Tahajjud</span>
              </button>
            </div>

            {form.avoidedSin ? (
              <textarea
                className="progress-note"
                rows={2}
                placeholder="Private note about self-restraint (only you see this)"
                value={form.avoidedSinNote}
                onChange={(e) => setForm((f) => ({ ...f, avoidedSinNote: e.target.value }))}
              />
            ) : null}
            {form.helpedSomeone ? (
              <textarea
                className="progress-note"
                rows={2}
                placeholder="Private note about helping someone (only you see this)"
                value={form.helpedSomeoneNote}
                onChange={(e) => setForm((f) => ({ ...f, helpedSomeoneNote: e.target.value }))}
              />
            ) : null}

            <div className="quran-row">
              <span>Quran pages today</span>
              <div className="quran-stepper">
                <button type="button" onClick={() => setForm((f) => ({ ...f, quranPages: Math.max(0, f.quranPages - 1) }))}>−</button>
                <strong>{form.quranPages}</strong>
                <button type="button" onClick={() => setForm((f) => ({ ...f, quranPages: f.quranPages + 1 }))}>+</button>
              </div>
            </div>

            <button className="btn btn-emerald btn-lg progress-save" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save today privately'}
            </button>
          </form>

          <p className="progress-footer-link">
            Want to write for MUIS? <Link href="/my-blogs">Open my blogs workspace</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
