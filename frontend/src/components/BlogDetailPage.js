'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PageHeader from './PageHeader.js';
import { api } from '../lib/api.js';

export default function BlogDetailPage({ slug }) {
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    api(`/blogs/slug/${encodeURIComponent(slug)}`)
      .then((data) => setPost(data.post))
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) {
    return (
      <div className="page-container page-fade-enter">
        <PageHeader title="Post not found" description={error} parentPage="Blogs" parentHash="/blogs" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="page-container page-fade-enter">
        <PageHeader title="Loading…" description="" parentPage="Blogs" parentHash="/blogs" />
      </div>
    );
  }

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title={post.title} description={`By ${post.byline || post.author?.name || 'MUIS writer'}`} parentPage="Blogs" parentHash="/blogs" />
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          {post.cover ? (
            <img src={post.cover} alt="" style={{ width: '100%', borderRadius: 16, marginBottom: 24, maxHeight: 360, objectFit: 'cover' }} />
          ) : null}
          <article className="blog-body" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.75, fontSize: '1.05rem' }}>
            {post.body}
          </article>
          <Link href="/blogs" className="btn btn-outline-navy" style={{ marginTop: 32 }}><ArrowLeft /> All blogs</Link>
        </div>
      </section>
    </div>
  );
}
