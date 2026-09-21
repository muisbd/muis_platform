'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import PageHeader from './PageHeader.js';
import WritingSubmit from './WritingSubmit.js';
import { api } from '../lib/api.js';

export default function BlogsPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/blogs')
      .then((data) => setPosts(data.posts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="MUIS Student Blogs" description="Published after committee review. Anyone may submit a piece below. You cannot publish it yourself." />
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Knowledge</div>
            <h2>Published reflections & campus writing</h2>
            <p>Submit once. Staff either publish on this blog or keep it for the An-Noor magazine.</p>
          </div>
          {loading ? <p>Loading posts…</p> : null}
          {error ? <p className="join-alert alert-error">{error}</p> : null}
          {!loading && !posts.length && !error ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No published posts yet. Check back after the first review cycle.</p>
          ) : null}
          <div className="events-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
            {posts.map((post) => (
              <Link key={post._id} href={`/blogs/${post.slug}`} className="event-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                {post.cover ? (
                  <div className="event-image-wrap" style={{ height: 180 }}>
                    <img src={post.cover} alt="" />
                  </div>
                ) : null}
                <div className="event-content">
                  <div className="eyebrow"><BookOpen style={{ width: 14, height: 14 }} /> {post.byline || post.author?.name}</div>
                  <h3>{post.title}</h3>
                  <p>{String(post.body || '').slice(0, 160)}{post.body?.length > 160 ? '…' : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-bg-surface">
        <div className="container">
          <WritingSubmit defaultKind="blog" />
        </div>
      </section>
    </div>
  );
}
