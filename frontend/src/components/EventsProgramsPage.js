'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, ShieldCheck, Clock } from 'lucide-react';
import PageHeader from './PageHeader.js';
import Gallery from './Gallery.js';
import { UPCOMING_EVENTS, PAST_EVENTS, WEEKLY_PROGRAMS } from '../data/eventsData.js';
import { api, mapEvent } from '../lib/api.js';

const FILTERS = [
  { key: 'all', label: 'All Past Events' },
  { key: 'halaqa', label: 'Halaqas & Talks' },
  { key: 'charity', label: 'Charity & Relief' },
  { key: 'community', label: 'Community Gatherings' },
  { key: 'workshop', label: 'Workshops' }
];

export default function EventsProgramsPage() {
  const [filter, setFilter] = useState('all');
  const [upcoming, setUpcoming] = useState(UPCOMING_EVENTS);
  const [past, setPast] = useState(PAST_EVENTS);
  const [weekly, setWeekly] = useState(WEEKLY_PROGRAMS);

  useEffect(() => {
    api('/events')
      .then((data) => {
        if (data.upcoming?.length) setUpcoming(data.upcoming.map(mapEvent));
        if (data.past?.length) setPast(data.past.map(mapEvent));
        if (data.weekly?.length) setWeekly(data.weekly);
      })
      .catch(() => {});
  }, []);

  const upcomingEvent = upcoming[0] || UPCOMING_EVENTS[0];

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="Campus Events & Photo Gallery" description="Browse our past event archives, weekly halaqa schedule, and upcoming flagship programs." />

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow" style={{ color: '#C084FC' }}>Past Event Archive</div>
            <h2>Past Campus Events & Activities</h2>
            <p>Highlights from our past conferences, congregational prayers, food drives, and workshops.</p>
          </div>

          <div className="filter-tabs">
            {FILTERS.map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn${filter === tab.key ? ' active' : ''}`}
                data-filter={tab.key}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="events-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
            {past.map((event) => (
              <Link
                key={event.id}
                href={`/events-programs/${event.id}`}
                className="event-card"
                data-category={event.category}
                style={{ display: filter === 'all' || event.category === filter ? 'flex' : 'none', textDecoration: 'none', color: 'inherit' }}
              >
                <div className="event-image-wrap">
                  <img src={event.image} alt={event.title} />
                  <span className="event-category-badge">{event.badge}</span>
                </div>
                <div className="event-content">
                  <div className="event-meta">
                    <div className="event-meta-item"><Calendar /> {event.date}</div>
                    <div className="event-meta-item"><MapPin /> {event.location}</div>
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="event-footer">
                    <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck style={{ width: 14, height: 14 }} /> Separate Brother & Sister Arrangement
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div style={{ marginTop: 20 }}>
        <Gallery />
      </div>

      <section className="section section-bg-surface">
        <div className="container">
          <div className="programs-schedule" style={{ marginTop: 0 }}>
            <div className="programs-header">
              <div className="eyebrow" style={{ color: '#C084FC' }}>Regular Gatherings</div>
              <h3>MUIS Weekly Programs Schedule</h3>
              <p>Consistent, weekly opportunities to learn, grow, and unwind together. All programs feature dedicated separate seating for Brothers & Sisters.</p>
            </div>

            <div className="programs-list">
              {weekly.map((prog) => (
                <div key={prog.title} className="program-item">
                  <div className="program-day">{prog.day}</div>
                  <div className="program-title">{prog.title}</div>
                  <div className="program-time-loc">
                    <span><Clock /> {prog.time}</span>
                    <span><MapPin /> {prog.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow" style={{ color: '#38BDF8' }}>Upcoming Campus Program</div>
            <h2>Dawah Event 2026</h2>
            <p>Our single upcoming major program scheduled for December 2026.</p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr', gap: 0, boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }} className="upcoming-banner-grid">
            <div style={{ height: 340, backgroundImage: `url('${upcomingEvent.image}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.95) 100%)' }} />
              <span style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(56, 189, 248, 0.25)', backdropFilter: 'blur(8px)', border: '1px solid #38BDF8', color: '#38BDF8', fontWeight: 700, fontSize: '0.82rem', padding: '6px 16px', borderRadius: 20, textTransform: 'uppercase' }}>
                <Calendar /> {upcomingEvent.date}
              </span>
            </div>

            <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '4px 12px', borderRadius: 16, fontSize: '0.8rem', fontWeight: 700 }}>Upcoming Program</span>
                <span style={{ color: '#10B981', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck style={{ width: 16, height: 16 }} /> Separate Brother & Sister Seating
                </span>
              </div>

              <h3 style={{ fontSize: '1.8rem', color: '#FFFFFF', fontWeight: 800, marginBottom: 12 }}>{upcomingEvent.title}</h3>

              <p style={{ color: 'rgba(243, 244, 246, 0.9)', fontSize: '1.02rem', lineHeight: 1.6, marginBottom: 24 }}>
                {upcomingEvent.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 28, fontSize: '0.9rem', color: '#38BDF8' }}>
                <div><Calendar /> <strong>Date:</strong> {upcomingEvent.date}</div>
                <div><MapPin /> <strong>Venue:</strong> {upcomingEvent.location}</div>
                <div><Clock /> <strong>Schedule:</strong> {upcomingEvent.time}</div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <Link href={`/events-programs/${upcomingEvent.id}`} className="btn btn-vibrant-primary">
                  View Event Details & RSVP
                </Link>
              </div>

              <div style={{ padding: 16, background: 'rgba(7, 9, 19, 0.7)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #10B981', color: 'rgba(243,244,246,0.85)', fontSize: '0.88rem' }}>
                <strong style={{ color: '#10B981' }}>Privacy Note:</strong> All MUIS programs maintain separate, dignified seating and facilities for Brothers & Sisters. Sisters&apos; personal details and program photos are strictly private.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
