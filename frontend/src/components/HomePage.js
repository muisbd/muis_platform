'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, Sparkles, Award, HeartHandshake, UserPlus, Calendar, BookOpen,
  FileText, ArrowRight, ShieldCheck, Clock, Mic, HelpCircle, MapPin,
  MessageSquare, Mail, ChevronDown, ExternalLink, Heart, UsersRound
} from 'lucide-react';
import HeroCanvas from './HeroCanvas.js';
import HeroTypewriter from './HeroTypewriter.js';
import PhotoSlideshow from './PhotoSlideshow.js';
import ScrollReveal, { AboutScrollSection } from './ScrollReveal.js';
import SeerahEventCover from './SeerahEventCover.js';
import { api, mapEvent } from '../lib/api.js';
import { UPCOMING_EVENTS } from '../data/eventsData.js';
import { WRITING_CONTEST_DEADLINE_EN } from '../data/sirahSpeakers.js';

export default function HomePage() {
  const [faqOpen, setFaqOpen] = useState(-1);
  const [pinnedEvents, setPinnedEvents] = useState([]);

  useEffect(() => {
    api('/events')
      .then((data) => {
        const pinned = (data.pinned || []).map(mapEvent).filter(Boolean);
        setPinnedEvents(pinned);
      })
      .catch(() => {});
  }, []);

  const fallbackEvent = UPCOMING_EVENTS[0];
  const announcedEvents = pinnedEvents.length ? pinnedEvents : fallbackEvent ? [fallbackEvent] : [];

  return (
    <div className="page-container home-page-container page-fade-enter">
      <section id="home" className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-islamic-pattern-overlay" />
        <div className="hero-glow-orb hero-glow-orb-purple" />
        <div className="hero-glow-orb hero-glow-orb-cyan" />
        <div className="hero-glow-orb hero-glow-orb-teal" />
        <HeroCanvas />

        <div className="container hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-bismillah text-arabic hero-fade-in" style={{ marginBottom: 12 }}>
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>

          <div className="hero-fade-in" style={{ textAlign: 'center', marginBottom: 32 }}>
            <span className="hero-eyebrow-badge" style={{ marginBottom: 0 }}>
              Welcome to MUIS Campus Community
            </span>
          </div>

          <div className="hero-split-grid">
            <div className="hero-text-col hero-fade-delay-1">
              <h1 style={{ fontSize: 'clamp(2.2rem, 4.2vw, 3.4rem)', marginBottom: 20, fontWeight: 800 }}>
                Empowering Faith, <span className="gradient-text-vibrant">Character</span> &{' '}
                <HeroTypewriter />
              </h1>

              <p className="hero-subtext" style={{ margin: '0 0 32px 0', lineHeight: 1.6 }}>
                Metropolitan University Islamic Society (MUIS) is a non-political, non-sectarian student organization committed to Islamic values, academic excellence, and campus leadership in Bangladesh.
              </p>

              <div className="hero-quick-stats" style={{ justifyContent: 'flex-start', marginTop: 24, paddingTop: 20 }}>
                <div className="hero-stat-item">
                  <div className="hero-stat-icon hero-stat-icon-purple"><Users style={{ width: 18, height: 18 }} /></div>
                  <div><span className="hero-stat-num">500+</span> Members</div>
                </div>
                <div className="hero-stat-item">
                  <div className="hero-stat-icon hero-stat-icon-cyan"><Sparkles style={{ width: 18, height: 18 }} /></div>
                  <div><span className="hero-stat-num">20+</span> Events</div>
                </div>
                <div className="hero-stat-item">
                  <div className="hero-stat-icon hero-stat-icon-emerald"><Award style={{ width: 18, height: 18 }} /></div>
                  <div><span className="hero-stat-num">4</span> Pillars</div>
                </div>
                <div className="hero-stat-item">
                  <div className="hero-stat-icon hero-stat-icon-indigo"><HeartHandshake style={{ width: 18, height: 18 }} /></div>
                  <div><span className="hero-stat-num">100%</span> Student Led</div>
                </div>
              </div>
            </div>

            <div className="hero-tiles-col hero-fade-delay-2">
              <div className="hero-4-buttons-square-grid">
                <Link href="/join" className="hero-square-tile tile-glass-amber">
                  <div className="tile-icon-wrap"><UserPlus /></div>
                  <div className="tile-title">Join MUIS</div>
                </Link>

                <Link href="/events-programs" className="hero-square-tile tile-glass-violet">
                  <div className="tile-icon-wrap"><Calendar /></div>
                  <div className="tile-title">Events & Programs</div>
                </Link>

                <Link href="/courses" className="hero-square-tile tile-glass-cyan">
                  <div className="tile-icon-wrap"><BookOpen /></div>
                  <div className="tile-title">Islamic Courses</div>
                </Link>

                <Link href="/magazine" className="hero-square-tile tile-glass-emerald">
                  <div className="tile-icon-wrap"><FileText /></div>
                  <div className="tile-title">Campus Magazine</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-fade-divider">
        <div className="divider-blur-glow" />
        <div className="divider-line-accent" />
      </div>

      <AboutScrollSection>
        <div className="container">
          <div className="about-enhanced-grid">
            <div className="teaser-text">
              <div className="eyebrow" style={{ color: '#C084FC', marginBottom: 12 }}>About MUIS</div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', lineHeight: 1.25, marginBottom: 20 }}>
                A Student-Led Home for <span className="gradient-text-vibrant">Faith</span> & <span className="gradient-text-cyan">Character</span>
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'rgba(243, 244, 246, 0.9)', lineHeight: 1.7, marginBottom: 24 }}>
                Metropolitan University Islamic Society (MUIS) is a non-political, non-sectarian student organization committed to Islamic values, spiritual brotherhood, academic excellence, and ethical leadership across Metropolitan University campus in Bangladesh.
              </p>
              <p style={{ fontSize: '0.98rem', color: 'rgba(243, 244, 246, 0.78)', lineHeight: 1.6, marginBottom: 32 }}>
                We offer regular congregational halaqas, dedicated sisters sanctuary spaces, annual Dawah conferences, Seerah competitions, and community charity initiatives.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link href="/about" className="btn btn-vibrant-primary btn-lg">
                  Explore MUIS Mission & Values <ArrowRight />
                </Link>
              </div>
            </div>

            <div className="about-pillars-rich-grid">
              <div className="about-pillar-card-enhanced">
                <div className="about-pillar-icon-wrap about-pillar-icon-purple">
                  <Sparkles />
                </div>
                <h3 className="about-pillar-title">Spiritual Worship</h3>
                <p className="about-pillar-desc">Daily campus Musalla maintenance, Jummah reminders, & dedicated Sisters Halaqa sessions.</p>
              </div>

              <div className="about-pillar-card-enhanced">
                <div className="about-pillar-icon-wrap about-pillar-icon-cyan">
                  <BookOpen />
                </div>
                <h3 className="about-pillar-title">Islamic Education</h3>
                <p className="about-pillar-desc">Structured Tajweed intensives, Student Fiqh workshops, and Seerah lectures with guest scholars.</p>
              </div>

              <div className="about-pillar-card-enhanced">
                <div className="about-pillar-icon-wrap about-pillar-icon-emerald">
                  <Users />
                </div>
                <h3 className="about-pillar-title">Student Leadership</h3>
                <p className="about-pillar-desc">Fostering campus brotherhood, moral integrity, academic excellence, and student executive growth.</p>
              </div>

              <div className="about-pillar-card-enhanced">
                <div className="about-pillar-icon-wrap about-pillar-icon-rose">
                  <HeartHandshake />
                </div>
                <h3 className="about-pillar-title">Community Service</h3>
                <p className="about-pillar-desc">Ramadan pre-food pack drives, Sylhet emergency flood relief, and student welfare support.</p>
              </div>
            </div>
          </div>

          <div className="home-core-values">
            <div className="section-header" style={{ marginBottom: 20 }}>
              <div className="eyebrow" style={{ color: '#C084FC' }}>Guided Principles</div>
              <h2>Our Core Values</h2>
            </div>
            <div className="about-pillars-rich-grid home-core-values-grid">
              <div className="about-pillar-card-enhanced">
                <div className="about-pillar-icon-wrap about-pillar-icon-purple">
                  <ShieldCheck />
                </div>
                <h3 className="about-pillar-title">Integrity (Ikhlas)</h3>
                <p className="about-pillar-desc">Sincerity of intention and transparency in all our initiatives and financial management.</p>
              </div>
              <div className="about-pillar-card-enhanced">
                <div className="about-pillar-icon-wrap about-pillar-icon-cyan">
                  <Award />
                </div>
                <h3 className="about-pillar-title">Excellence (Ihsan)</h3>
                <p className="about-pillar-desc">Striving for high quality in both academic achievements and Islamic character.</p>
              </div>
              <div className="about-pillar-card-enhanced">
                <div className="about-pillar-icon-wrap about-pillar-icon-emerald">
                  <UsersRound />
                </div>
                <h3 className="about-pillar-title">Unity & Respect</h3>
                <p className="about-pillar-desc">Welcoming students from diverse cultural backgrounds with warmth and mutual respect.</p>
              </div>
              <div className="about-pillar-card-enhanced">
                <div className="about-pillar-icon-wrap about-pillar-icon-rose">
                  <Heart />
                </div>
                <h3 className="about-pillar-title">Compassionate Service</h3>
                <p className="about-pillar-desc">Serving humanity and contributing positively to Metropolitan University and local society.</p>
              </div>
            </div>
          </div>
        </div>
      </AboutScrollSection>

      <ScrollReveal id="slideshow-section" className="section section-slideshow-shade section-scroll-reveal">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="section-header">
            <div className="eyebrow">Past Activity Showcase</div>
            <h2>Campus Life & Event Highlights</h2>
            <p>Explore real moments from past MUIS conferences, congregational prayers, and community drives.</p>
          </div>
          <PhotoSlideshow />
        </div>
      </ScrollReveal>

      <ScrollReveal id="upcoming-event-section" className="section section-upcoming-shade section-scroll-reveal">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="section-header" style={{ marginBottom: 24 }}>
            <div className="eyebrow" style={{ color: '#FBBF24' }}>Open registration</div>
            <h2>Seerah Conference 2026</h2>
          </div>

          <div className="compact-event-card sirah-promo-card" style={{ marginBottom: 28 }}>
            <SeerahEventCover className="sirah-promo-banner" />
            <div className="compact-event-body">
              <div className="compact-event-meta">
                <span className="compact-tag-purple">Flagship Conference</span>
                <span className="compact-tag-emerald"><ShieldCheck /> Open registration</span>
                <span className="compact-tag-gold">150 BDT</span>
              </div>
              <h3 className="compact-event-title">Seerah Conference 2026</h3>
              <p className="compact-event-desc">One registration covers Seerah Quiz, Writing Contest, and Seerah Seminar. Writing contest deadline {WRITING_CONTEST_DEADLINE_EN}. Pay 150 BDT with bKash, then submit your details and TrxID.</p>
              <div className="compact-event-action" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <Link href="/seerah-2026" className="btn btn-vibrant-primary btn-sm">
                  Register at muis.bd/seerah-2026 <ExternalLink />
                </Link>
                <Link href="/seerah-2026/details" className="btn btn-outline btn-sm">
                  Event details
                </Link>
              </div>
            </div>
          </div>

          {announcedEvents.length ? (
            <>
              <div className="section-header" style={{ marginBottom: 24, marginTop: 12 }}>
                <div className="eyebrow" style={{ color: '#38BDF8' }}>Upcoming Campus Event</div>
                <h2>{announcedEvents.length === 1 ? announcedEvents[0].title : 'Pinned announcements'}</h2>
              </div>
              {announcedEvents.map((event) => (
                <div key={event.id || event.slug} className="compact-event-card" style={{ marginTop: 12 }}>
                  <div className="compact-event-cover" style={{ backgroundImage: `url('${event.image || '/images/dawah_event.png'}')` }}>
                    <span className="compact-event-badge"><Calendar /> {event.date}</span>
                  </div>

                  <div className="compact-event-body">
                    <div className="compact-event-meta">
                      <span className="compact-tag-purple">{event.badge || 'Upcoming Program'}</span>
                      <span className="compact-tag-emerald"><ShieldCheck /> Separate Seating</span>
                    </div>
                    <h3 className="compact-event-title">{event.title}</h3>
                    <p className="compact-event-desc">{event.description}</p>
                    <div className="compact-event-action">
                      <Link href={`/events-programs/${event.id || event.slug}`} className="btn btn-vibrant-primary btn-sm">
                        View Event Details & Schedule <ExternalLink />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : null}
        </div>
      </ScrollReveal>

      <ScrollReveal className="section section-bg-surface section-scroll-reveal">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px auto' }}>
            <div className="eyebrow" style={{ color: '#38BDF8' }}>Structured Learning</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)' }}>Islamic Courses & Short Workshops</h2>
            <p style={{ fontSize: '1.02rem', color: 'rgba(243,244,246,0.85)' }}>
              Master Quranic Tajweed, understand practical student Fiqh, and participate in ethical leadership seminars with guest scholars.
            </p>
          </div>

          <div className="courses-showcase-grid">
            <div className="course-card-vibrant">
              <div>
                <div className="course-card-header">
                  <span className="course-badge course-badge-purple">Popular Course</span>
                  <div className="course-card-icon"><BookOpen /></div>
                </div>
                <h3 className="course-card-title">Essential Fiqh of Student Life</h3>
                <p className="course-card-desc">Comprehensive understanding of daily Taharah, Salah rules, halaal transactions, and campus conduct for university students.</p>
                <div className="course-meta-pills">
                  <span className="course-meta-pill"><Clock style={{ width: 14, height: 14 }} /> 4 Weeks</span>
                  <span className="course-meta-pill"><Calendar style={{ width: 14, height: 14 }} /> Saturdays 4:00 PM</span>
                </div>
              </div>
              <Link href="/courses" className="btn btn-navy" style={{ width: '100%', justifyContent: 'center' }}>View Course Details <ArrowRight /></Link>
            </div>

            <div className="course-card-vibrant">
              <div>
                <div className="course-card-header">
                  <span className="course-badge course-badge-cyan">Hands-on Workshop</span>
                  <div className="course-card-icon"><Mic /></div>
                </div>
                <h3 className="course-card-title">Quranic Tajweed & Recitation</h3>
                <p className="course-card-desc">Practical Makharij and Sifaat correction intensive, designed to improve student Quran recitation with certified Qaris.</p>
                <div className="course-meta-pills">
                  <span className="course-meta-pill"><Clock style={{ width: 14, height: 14 }} /> 6 Weeks</span>
                  <span className="course-meta-pill"><Calendar style={{ width: 14, height: 14 }} /> Bi-Weekly Evening</span>
                </div>
              </div>
              <Link href="/courses" className="btn btn-navy" style={{ width: '100%', justifyContent: 'center' }}>View Course Details <ArrowRight /></Link>
            </div>

            <div className="course-card-vibrant">
              <div>
                <div className="course-card-header">
                  <span className="course-badge course-badge-emerald">Weekend Seminar</span>
                  <div className="course-card-icon"><Award /></div>
                </div>
                <h3 className="course-card-title">Seerah & Modern Leadership</h3>
                <p className="course-card-desc">In-depth exploration of the Prophetic Seerah, extracting timeless principles for modern youth leadership and character.</p>
                <div className="course-meta-pills">
                  <span className="course-meta-pill"><Clock style={{ width: 14, height: 14 }} /> 2 Days Seminar</span>
                  <span className="course-meta-pill"><Calendar style={{ width: 14, height: 14 }} /> Monthly Weekend</span>
                </div>
              </div>
              <Link href="/courses" className="btn btn-navy" style={{ width: '100%', justifyContent: 'center' }}>View Course Details <ArrowRight /></Link>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link href="/courses" className="btn btn-gold btn-lg">
              Browse All Courses & Workshop Catalog <ArrowRight />
            </Link>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal id="donate-banner-section" className="section section-donate-shade section-scroll-reveal">
        <div className="donate-section-ambient-glow" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="donation-card-rich">
            <div className="donation-grid-flex">
              <div>
                <div className="eyebrow" style={{ color: '#34D399' }}>Sustain Our Work</div>
                <h3 style={{ color: '#FFFFFF', marginBottom: 8, fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 800 }}>Support Campus Prayer Spaces & Student Welfare</h3>
                <p style={{ color: 'rgba(243,244,246,0.92)', marginBottom: 0, fontSize: '1.02rem' }}>100% transparent student-managed fund for Musalla maintenance and Ramadan Iftars.</p>
              </div>
              <Link href="/donate" className="btn btn-emerald btn-lg" style={{ boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)', whiteSpace: 'nowrap' }}>Donate & Fund Breakdown <ArrowRight /></Link>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal className="section section-bg-surface section-scroll-reveal">
        <div className="container">
          <div className="youtube-preview-section">
            <div className="youtube-grid-3col">
              <div className="youtube-embed-card">
                <div className="youtube-embed-wrapper">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/gC-0VwLpzFk"
                    title="MUIS YouTube Video Highlight 1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="youtube-embed-card">
                <div className="youtube-embed-wrapper">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/YCZ90U-64Bg"
                    title="MUIS YouTube Video Highlight 2"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="youtube-embed-card">
                <div className="youtube-embed-wrapper">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/N3bdDzPaGjA"
                    title="MUIS YouTube Video Highlight 3"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="join-muis-card">
            <div className="eyebrow" style={{ color: '#C084FC', marginBottom: 8 }}>Connect & Engage</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: '#FFFFFF', fontWeight: 800, marginBottom: 12 }}>
              Have Questions or Want to Join MUIS?
            </h2>
            <p style={{ color: 'rgba(243, 244, 246, 0.88)', fontSize: '1.05rem', maxWidth: 620, margin: '0 auto', lineHeight: 1.6 }}>
              Connect with executive committee officers, visit the campus Musalla, or ask us any questions regarding student membership and upcoming programs.
            </p>

            <div className="join-actions-wrap" style={{ marginBottom: 24 }}>
              <Link href="/contact" className="btn btn-vibrant-primary btn-lg" style={{ boxShadow: '0 10px 30px rgba(168, 85, 247, 0.45)' }}>
                <HelpCircle /> Ask a Question / Contact MUIS <ArrowRight />
              </Link>
            </div>

            <div className="faq-suggestions-wrap">
              <div className={`faq-accordion-item${faqOpen === 0 ? ' open' : ''}`}>
                <button className="faq-accordion-header" onClick={() => setFaqOpen(faqOpen === 0 ? -1 : 0)}>
                  <span><HelpCircle className="faq-icon-purple" /> How can Metropolitan University students join MUIS?</span>
                  <ChevronDown className="faq-chevron" />
                </button>
                <div className="faq-accordion-body">
                  <p>All enrolled Metropolitan University students (brothers & sisters across all departments) are eligible to join MUIS free. Simply fill out our online member form or visit the MUIS desk during orientation week.</p>
                </div>
              </div>

              <div className={`faq-accordion-item${faqOpen === 1 ? ' open' : ''}`}>
                <button className="faq-accordion-header" onClick={() => setFaqOpen(faqOpen === 1 ? -1 : 1)}>
                  <span><MapPin className="faq-icon-cyan" /> Where is the campus Musalla located?</span>
                  <ChevronDown className="faq-chevron" />
                </button>
                <div className="faq-accordion-body">
                  <p>The campus prayer space is located on Level 4 of the Main Building, with dedicated separate prayer areas, ablution (Wudu) facilities, and halaqa lounges for Brothers and Sisters.</p>
                </div>
              </div>

              <div className={`faq-accordion-item${faqOpen === 2 ? ' open' : ''}`}>
                <button className="faq-accordion-header" onClick={() => setFaqOpen(faqOpen === 2 ? -1 : 2)}>
                  <span><BookOpen className="faq-icon-emerald" /> Are MUIS Islamic short courses free?</span>
                  <ChevronDown className="faq-chevron" />
                </button>
                <div className="faq-accordion-body">
                  <p>Yes, all Tajweed intensives, Seerah seminars, and student Fiqh workshops are 100% free of charge for university students with course study packs provided.</p>
                </div>
              </div>
            </div>

            <div className="join-quick-badges" style={{ marginTop: 32 }}>
              <span className="join-quick-badge">
                <MapPin style={{ color: '#38BDF8', width: 16, height: 16 }} /> Musalla: Main Building, Level 4
              </span>
              <span className="join-quick-badge">
                <MessageSquare style={{ color: '#34D399', width: 16, height: 16 }} /> Official Student WhatsApp Group
              </span>
              <span className="join-quick-badge">
                <Mail style={{ color: '#C084FC', width: 16, height: 16 }} /> muis.official@mu.edu.bd
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
