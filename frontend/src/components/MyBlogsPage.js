'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PenLine } from 'lucide-react';
import PageHeader from './PageHeader.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { showToast } from '../utils/toast.js';

export default function MyBlogsPage() {
  const { user, ready, isLoggedIn, isBlogger } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!isLoggedIn) router.replace('/login');
  }, [ready, isLoggedIn, router]);

  const load = () => {
    if (!isBlogger) return;
    api('/blogs/mine').then((data) => setPosts(data.posts || [])).catch((err) => showToast(err.message, true));
  };

  useEffect(() => {
    if (isBlogger) load();
  }, [isBlogger]);

  const requestId = async () => {
    try {
      await api('/blogs/request-id', { method: 'POST' });
      showToast('Request sent. MUIS will issue a Blogger ID after review.');
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const createDraft = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/blogs', { method: 'POST', body: { title, body, tags } });
      setTitle('');
      setBody('');
      setTags('');
      showToast('Draft saved. Submit it when you are ready for review.');
      load();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const submitReview = async (id) => {
    try {
      await api(`/blogs/${id}/submit`, { method: 'POST' });
      showToast('Sent to MUIS for review. You cannot publish it yourself.');
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  if (!ready || !isLoggedIn) return null;

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="My blogs" description="Draft privately. Only MUIS can publish after review." />
      <section className="section">
        <div className="container">
          {!isBlogger ? (
            <div className="form-card auth-card">
              <h3 style={{ color: 'var(--color-navy)' }}>You need a Blogger ID</h3>
              <p style={{ margin: '12px 0 20px' }}>The committee issues IDs so students cannot self-publish on the public site.</p>
              <button type="button" className="btn btn-navy" onClick={requestId}>Request a Blogger ID</button>
            </div>
          ) : (
            <>
              <p style={{ marginBottom: 16, fontSize: '0.9rem' }}>Signed in as {user?.name} · {user?.bloggerId || 'Blogger'}</p>
              <div className="form-card" style={{ maxWidth: 760, margin: '0 auto 40px' }}>
                <h3 style={{ color: 'var(--color-navy)', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}><PenLine /> New draft</h3>
                <form onSubmit={createDraft}>
                  <div className="form-group">
                    <label>Title *</label>
                    <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input className="form-control" value={tags} onChange={(e) => setTags(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Body *</label>
                    <textarea className="form-control" rows={10} value={body} onChange={(e) => setBody(e.target.value)} required />
                  </div>
                  <button className="btn btn-navy" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save draft'}</button>
                </form>
              </div>
              <div className="admin-table-wrap">
                {posts.map((post) => (
                  <div key={post._id} className="admin-row">
                    <div>
                      <strong>{post.title}</strong>
                      <div className="admin-meta">{post.status.replace('_', ' ')}</div>
                    </div>
                    {post.status === 'draft' || post.status === 'rejected' ? (
                      <button type="button" className="btn btn-sm btn-gold" onClick={() => submitReview(post._id)}>Submit for review</button>
                    ) : post.status === 'published' ? (
                      <Link href={`/blogs/${post.slug}`} className="btn btn-sm btn-outline">View live</Link>
                    ) : (
                      <span className="admin-meta">Waiting on MUIS</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
