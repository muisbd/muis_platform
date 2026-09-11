'use client';

import { useEffect, useState } from 'react';
import { GALLERY_DATA } from '../data/galleryData.js';
import { api } from '../lib/api.js';

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const [items, setItems] = useState(GALLERY_DATA);

  useEffect(() => {
    api('/events')
      .then((data) => {
        if (data.gallery?.length) setItems(data.gallery);
      })
      .catch(() => {});
  }, []);

  const openLightbox = (item) => {
    setLightbox(item);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightbox(null);
    document.body.style.overflow = '';
  };

  return (
    <>
      <section id="gallery" className="section">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Life at MUIS</div>
            <h2>Campus Community Gallery</h2>
            <p>Highlights from recent Jummah gatherings, Ramadan Iftars, sports tournaments, and community drives.</p>
          </div>

          <div className="gallery-grid">
            {items.map((item) => (
              <div key={item.image} className="gallery-item" onClick={() => openLightbox(item)}>
                <img src={item.image} alt={item.caption} />
                <div className="gallery-overlay">
                  <span className="gallery-tag">{item.tag}</span>
                  <div className="gallery-caption">{item.caption}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div
        id="lightbox-modal"
        className={`lightbox-modal${lightbox ? ' open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLightbox();
        }}
      >
        <div className="lightbox-content">
          <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
          {lightbox ? (
            <>
              <img id="lightbox-img" src={lightbox.image} alt="Enlarged gallery photo" />
              <div id="lightbox-caption" className="lightbox-caption">{lightbox.caption}</div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
