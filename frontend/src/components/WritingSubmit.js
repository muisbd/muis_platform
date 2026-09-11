'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { api } from '../lib/api.js';
import { showToast } from '../utils/toast.js';

export default function WritingSubmit({ defaultKind = 'blog' }) {
  const [kind, setKind] = useState(defaultKind);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    try {
      await api('/magazine/submissions', {
        method: 'POST',
        body: {
          kind,
          authorName: form.querySelector('[name="authorName"]').value.trim(),
          email: form.querySelector('[name="email"]').value.trim(),
          title: form.querySelector('[name="title"]').value.trim(),
          abstract: form.querySelector('[name="abstract"]').value.trim()
        }
      });
      form.reset();
      showToast('Received. MUIS will review before anything is published on the site.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div className="eyebrow" style={{ textAlign: 'center' }}>Write for MUIS</div>
      <h3 style={{ color: 'var(--color-navy)', textAlign: 'center', marginBottom: 12 }}>Submit a blog or magazine piece</h3>
      <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: 24, fontSize: '0.94rem' }}>
        Anyone may submit. A committee officer reads it and either publishes it on the blog or keeps it for An-Noor magazine. You cannot publish it yourself.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Where should this go? *</label>
          <select className="form-control" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="blog">Campus blog (public on the website after review)</option>
            <option value="magazine">An-Noor magazine issue</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Your name *</label>
            <input name="authorName" type="text" required placeholder="Tariq Rahman" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" required placeholder="student@metrouni.edu.bd" />
          </div>
        </div>
        <div className="form-group">
          <label>Title *</label>
          <input name="title" type="text" required placeholder="e.g. Navigating Academic Pressure with Patience" />
        </div>
        <div className="form-group">
          <label>Your writing / summary *</label>
          <textarea name="abstract" rows="6" required placeholder="Paste your article, poem, or a clear summary..." />
        </div>
        <button type="submit" className="btn btn-navy btn-lg" style={{ width: '100%' }} disabled={loading}>
          <Send /> {loading ? 'Sending…' : 'Submit for MUIS review'}
        </button>
      </form>
    </div>
  );
}
