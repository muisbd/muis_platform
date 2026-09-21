'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import PageHeader from './PageHeader.js';
import { EVENTS_DATA } from '../data/eventsData.js';
import { showToast } from '../utils/toast.js';
import { api, mapEvent } from '../lib/api.js';

export default function EventDetailPage({ eventId }) {
  const [event, setEvent] = useState(() => EVENTS_DATA.find((e) => e.id === eventId) || null);
  const [loading, setLoading] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api(`/events/${encodeURIComponent(eventId)}`)
      .then((data) => {
        if (!cancelled) setEvent(mapEvent(data.event));
      })
      .catch(() => {
        const local = EVENTS_DATA.find((e) => e.id === eventId);
        if (!cancelled) {
          if (local) setEvent(local);
          else setMissing(true);
        }
      });
    return () => { cancelled = true; };
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    try {
      await api(`/events/${encodeURIComponent(eventId)}/rsvp`, {
        method: 'POST',
        body: {
          fullName: form.querySelector('[name="fullName"]').value.trim(),
          email: form.querySelector('[name="email"]').value.trim(),
          departmentYear: form.querySelector('[name="departmentYear"]').value.trim()
        }
      });
      form.reset();
      showToast('Application received. This is not a ticket yet. MUIS will email you if staff approve your ticket.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  if (missing) {
    return (
      <div className="page-container page-fade-enter">
        <PageHeader title="Event not found" description="This event id is not in our records." parentPage="Events & Programs" parentHash="/events-programs" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-container page-fade-enter">
        <PageHeader title="Loading event…" description="" parentPage="Events & Programs" parentHash="/events-programs" />
      </div>
    );
  }

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title={event.title} description={`${event.date}${event.time ? ` at ${event.time}` : ''} · ${event.location}`} parentPage="Events & Programs" parentHash="/events-programs" />

      <section className="section">
        <div className="container">
          <div className="about-grid" style={{ alignItems: 'flex-start' }}>
            <div>
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: 320, marginBottom: 24 }}>
                <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div className="eyebrow">{event.badge} Event Detail</div>
              <h2 style={{ marginBottom: 16 }}>{event.title}</h2>

              <div className="event-meta" style={{ fontSize: '1rem', gap: 24, marginBottom: 24 }}>
                <div className="event-meta-item"><Calendar /> <strong>Date:</strong> {event.date}</div>
                {event.time ? <div className="event-meta-item"><Clock /> <strong>Time:</strong> {event.time}</div> : null}
                <div className="event-meta-item"><MapPin /> <strong>Venue:</strong> {event.location}</div>
              </div>

              <h3 style={{ marginBottom: 12 }}>Event Overview & Objective</h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--color-text-main)', marginBottom: 24 }}>
                {event.description} This session is designed to foster meaningful discussions, practical learning, and fellowship among university students. Refreshments and learning materials will be provided.
              </p>

              <h3 style={{ marginBottom: 12 }}>Event Schedule & Flow</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                <li style={{ padding: '12px 16px', background: 'var(--color-surface)', borderLeft: '3px solid var(--color-gold)', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Start (10 mins prior):</strong> Arrival & Student Check-in
                </li>
                <li style={{ padding: '12px 16px', background: 'var(--color-surface)', borderLeft: '3px solid var(--color-navy)', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Main Session:</strong> Lecture / Activity / Workshop
                </li>
                <li style={{ padding: '12px 16px', background: 'var(--color-surface)', borderLeft: '3px solid var(--color-gold)', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Q&A & Social:</strong> Q&A Session followed by light refreshments
                </li>
              </ul>

              <Link href="/events-programs" className="btn btn-outline-navy"><ArrowLeft /> Back to Events & Programs</Link>
            </div>

            <div className="form-card" style={{ margin: 0, width: '100%' }}>
              <div className="eyebrow">Event registration</div>
              <h3 style={{ color: 'var(--color-navy)', marginBottom: 8 }}>Apply for a ticket</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>
                Guests do not need a MUIS login. You will get an email that we received your details. A ticket is sent only after a committee officer approves you.
              </p>

              <form id="event-detail-rsvp-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="fullName" type="text" required placeholder="e.g. Tariq Rahman" />
                </div>

                <div className="form-group">
                  <label>University Email *</label>
                  <input name="email" type="email" required placeholder="student@metropolitan.edu" />
                </div>

                <div className="form-group">
                  <label>Department & Year *</label>
                  <input name="departmentYear" type="text" required placeholder="CSE 3rd Year" />
                </div>

                <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%', marginTop: 12 }} disabled={loading}>
                  <Calendar /> {loading ? 'Sending…' : 'Submit application'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
