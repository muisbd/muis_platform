'use client';

import { useEffect, useState } from 'react';
import { Download, Send } from 'lucide-react';
import PageHeader from './PageHeader.js';
import { MAGAZINE_EDITIONS } from '../data/magazineData.js';
import { showToast } from '../utils/toast.js';
import { api, mapMagazine } from '../lib/api.js';

export default function MagazinePage() {
  const [editions, setEditions] = useState(MAGAZINE_EDITIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/magazine/editions')
      .then((data) => {
        if (data.editions?.length) setEditions(data.editions.map(mapMagazine));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    try {
      await api('/magazine/submissions', {
        method: 'POST',
        body: {
          authorName: form.querySelector('[name="authorName"]').value.trim(),
          email: form.querySelector('[name="email"]').value.trim(),
          title: form.querySelector('[name="title"]').value.trim(),
          abstract: form.querySelector('[name="abstract"]').value.trim()
        }
      });
      form.reset();
      showToast('Thank you! Your article submission has been sent to the Editorial Board.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="MUIS Campus Magazine & Publications" description="Student essays, spiritual reflections, academic guidance, and annual society publications." />

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Publications</div>
            <h2>Official MUIS Campus Magazine Editions</h2>
            <p>Read or download digital PDF editions published by Metropolitan University students.</p>
          </div>

          <div className="events-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {editions.map((mag) => (
              <div key={mag.id} className="event-card" style={{ border: '1px solid rgba(201, 154, 76, 0.3)' }}>
                <div className="event-image-wrap" style={{ height: 240 }}>
                  <img src={mag.cover} alt={mag.title} />
                  <span className="event-category-badge">{mag.issue}</span>
                </div>
                <div className="event-content" style={{ padding: 28 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-gold-dark)', fontWeight: 700, marginBottom: 6 }}>Published: {mag.date} • {mag.pagesCount}</div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: 12 }}>{mag.title}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.94rem', marginBottom: 20 }}>{mag.description}</p>

                  <div style={{ background: 'var(--color-bg-warm)', padding: 16, borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--color-navy)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Featured Highlights:</strong>
                    <ul style={{ listStyleType: 'disc', paddingLeft: 18, fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                      {(mag.featuredArticles || []).map((art) => (
                        <li key={art}>{art}</li>
                      ))}
                    </ul>
                  </div>

                  {(mag.downloadUrl || (mag.downloadLink && mag.downloadLink !== '#')) ? (
                    <a className="btn btn-gold btn-download-mag" href={mag.downloadUrl || mag.downloadLink} target="_blank" rel="noopener noreferrer">
                      <Download /> Download Digital PDF ({mag.pagesCount})
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-gold btn-download-mag"
                      onClick={() => showToast('PDF file is not uploaded yet. The committee will add a Cloudinary link in Admin.', true)}
                    >
                      <Download /> PDF coming soon ({mag.pagesCount})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-surface">
        <div className="container">
          <div className="form-card" style={{ maxWidth: 760, margin: '0 auto' }}>
            <div className="eyebrow" style={{ textAlign: 'center' }}>Write for An-Noor</div>
            <h3 style={{ color: 'var(--color-navy)', textAlign: 'center', marginBottom: 12 }}>Submit Your Article or Poetry</h3>
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 24, fontSize: '0.94rem' }}>
              We welcome student submissions on academic ethics, Islamic history, book reviews, personal reflections, and creative poetry for our upcoming Fall 2026 issue.
            </p>

            <form id="magazine-submit-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Author Name *</label>
                  <input name="authorName" type="text" required placeholder="Tariq Rahman" />
                </div>
                <div className="form-group">
                  <label>University Email *</label>
                  <input name="email" type="email" required placeholder="student@metropolitan.edu" />
                </div>
              </div>

              <div className="form-group">
                <label>Article Title / Topic *</label>
                <input name="title" type="text" required placeholder="e.g. Navigating Academic Pressure with Patience" />
              </div>

              <div className="form-group">
                <label>Abstract / Brief Summary *</label>
                <textarea name="abstract" rows="4" required placeholder="Briefly describe your proposed article or paste your text submission here..." />
              </div>

              <button type="submit" className="btn btn-navy btn-lg" style={{ width: '100%' }} disabled={loading}>
                <Send /> {loading ? 'Sending…' : 'Submit Article to Editorial Board'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
