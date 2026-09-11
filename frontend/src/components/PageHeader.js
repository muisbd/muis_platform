'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, description, parentPage = 'Home', parentHash = '/', eyebrow = 'MUIS Page Guide' }) {
  return (
    <div className="page-header-banner">
      <div className="page-header-pattern" />
      <div className="container page-header-flex">
        <div className="page-header-text">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href={parentHash}><ArrowLeft /> {parentPage}</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{title}</span>
          </nav>
          {eyebrow ? <div className="eyebrow" style={{ color: 'var(--color-gold-light)', marginTop: 12 }}>{eyebrow}</div> : null}
          <h1 className="page-title">{title}</h1>
          <p className="page-description">{description}</p>
        </div>

        <div className="page-header-logo-wrap">
          <img src="/muis_logo_white.png" alt="Metropolitan University Islamic Society Logo" className="page-header-logo-img" />
        </div>
      </div>
    </div>
  );
}
