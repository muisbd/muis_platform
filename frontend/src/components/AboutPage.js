'use client';

import { Target, Sparkles, BookOpen, Users, HeartHandshake, ShieldCheck, Award, UsersRound, Heart } from 'lucide-react';
import PageHeader from './PageHeader.js';
import Committee from './Committee.js';
import StatsStrip from './About.js';

export default function AboutPage() {
  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="About MUIS & Executive Committee" description="Our history, mission, core values, and student leadership at Metropolitan University." />

      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <div className="eyebrow">Our Foundation</div>
              <h2 style={{ marginBottom: 24 }}>Nurturing Spiritual Growth & Academic Leadership</h2>

              <p style={{ marginTop: 16, fontSize: '1.05rem', lineHeight: 1.6, color: 'rgba(243, 244, 246, 0.9)' }}>
                Established in 2025 by Metropolitan University students, MUIS serves as the central home for Muslim student life on campus. We strive to create an inclusive environment where students can balance academic ambition with spiritual growth and meaningful service.
              </p>

              <div style={{ marginTop: 24, padding: 20, background: 'rgba(15, 23, 42, 0.85)', borderLeft: '4px solid #C084FC', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <h4 style={{ color: '#C084FC', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target style={{ width: 20, height: 20, color: '#38BDF8' }} /> Our Mission Statement
                </h4>
                <p style={{ fontSize: '0.95rem', marginBottom: 0, color: 'rgba(243, 244, 246, 0.9)', fontStyle: 'italic' }}>
                  &quot;To cultivate a warm, inclusive campus sanctuary that empowers Muslim students to achieve academic excellence, embody moral integrity, and actively serve the broader community.&quot;
                </p>
              </div>
            </div>

            <div className="story-card" style={{ background: 'rgba(15, 23, 42, 0.85)', color: '#FFFFFF', padding: 36, borderRadius: 'var(--radius-lg)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <div className="eyebrow" style={{ color: '#C084FC' }}>President&apos;s Welcome</div>
              <h3 style={{ color: '#FFFFFF', marginBottom: 12 }}>&quot;Welcome to Your Home on Campus&quot;</h3>
              <p style={{ color: 'rgba(243, 244, 246, 0.88)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                &quot;Whether you are a fresh student embarking on your university journey or a returning student seeking community, MUIS offers a space where you can belong, grow spiritually, and make lifelong friends. We invite you to join our circles and make the most of your university years.&quot;
              </p>
              <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12, fontWeight: 700, color: '#C084FC' }}>
                Safwan Uddin Ahmed, MUIS President (Head of EEE)
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-bg-surface">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Our Core Pillars</div>
            <h2>What We Do Across Campus</h2>
            <p>Four interconnected areas of activity that shape student life at Metropolitan University.</p>
          </div>

          <div className="pillars-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            <div className="pillar-card" style={{ padding: '32px 24px' }}>
              <div className="pillar-icon"><Sparkles style={{ color: '#C084FC' }} /></div>
              <h3>1. Worship & Musalla Facilities</h3>
              <p>We manage the central campus Musalla (Building B, Room 304), ensuring clean, air-conditioned prayer halls with dedicated wudu areas for brothers and sisters.</p>
            </div>

            <div className="pillar-card" style={{ padding: '32px 24px' }}>
              <div className="pillar-icon"><BookOpen style={{ color: '#38BDF8' }} /></div>
              <h3>2. Spiritual & Intellectual Education</h3>
              <p>Our educational programs include weekly Tafseer halaqas, Quran Tajweed circles, guest scholar lectures, and discussions on contemporary ethics.</p>
            </div>

            <div className="pillar-card" style={{ padding: '32px 24px' }}>
              <div className="pillar-icon"><Users style={{ color: '#10B981' }} /></div>
              <h3>3. Brotherhood, Sisterhood & Socials</h3>
              <p>We foster genuine camaraderie through Welcome Week stalls, brothers&apos; sports outings, sisters&apos; tea socials, annual retreat trips, and community dinners.</p>
            </div>

            <div className="pillar-card" style={{ padding: '32px 24px' }}>
              <div className="pillar-icon"><HeartHandshake style={{ color: '#F43F5E' }} /></div>
              <h3>4. Charity & Community Service</h3>
              <p>Putting faith into action, MUIS volunteers organize emergency relief drives, local food distributions in Sylhet, blood donation camps, and winter blanket drives.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Guided Principles</div>
            <h2>Our Core Values</h2>
          </div>

          <div className="values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            <div className="step-card">
              <h4 style={{ color: '#FFFFFF', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck style={{ width: 20, height: 20, color: '#C084FC' }} /> Integrity (Ikhlas)
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(243,244,246,0.85)' }}>Sincerity of intention and transparency in all our initiatives and financial management.</p>
            </div>
            <div className="step-card">
              <h4 style={{ color: '#FFFFFF', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award style={{ width: 20, height: 20, color: '#38BDF8' }} /> Excellence (Ihsan)
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(243,244,246,0.85)' }}>Striving for high quality in both academic achievements and Islamic character.</p>
            </div>
            <div className="step-card">
              <h4 style={{ color: '#FFFFFF', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <UsersRound style={{ width: 20, height: 20, color: '#10B981' }} /> Unity & Respect
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(243,244,246,0.85)' }}>Welcoming students from diverse cultural backgrounds with warmth and mutual respect.</p>
            </div>
            <div className="step-card">
              <h4 style={{ color: '#FFFFFF', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart style={{ width: 20, height: 20, color: '#F43F5E' }} /> Compassionate Service
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'rgba(243,244,246,0.85)' }}>Serving humanity and contributing positively to Metropolitan University and local society.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-bg-surface" style={{ padding: '40px 0' }}>
        <div className="container">
          <StatsStrip />
        </div>
      </section>

      <div style={{ marginTop: 20 }}>
        <Committee />
      </div>
    </div>
  );
}
