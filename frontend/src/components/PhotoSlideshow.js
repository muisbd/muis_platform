'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const SLIDESHOW_PHOTOS = [
  {
    image: '/images/salah.jpg',
    title: 'Outdoor Night Congregational Prayer',
    caption: 'Maghrib congregational prayer in Sujood under illuminated campus fairy lights.'
  },
  {
    image: '/images/iftar.jpg',
    title: 'MUIS Grand Campus Iftar 2026',
    caption: 'Massive outdoor student Iftar gathering with Quranic reflections & community bonding.'
  },
  {
    image: '/images/charity.jpg',
    title: 'Annual Ramadan Pre-Food Pack Drive',
    caption: 'Volunteers packing and distributing essential food care bags to needy families in Sylhet.'
  },
  {
    image: '/images/event.jpg',
    title: 'Annual Seerah Conference 2025',
    caption: 'Inspiring keynote lectures and scholar talks at Metropolitan University Auditorium.'
  },
  {
    image: '/images/workshop.jpg',
    title: 'Faith, Future & Focus Student Workshop',
    caption: 'Interactive classroom seminar on balancing academic excellence with Islamic identity.'
  },
  {
    image: '/images/contest.jpg',
    title: 'Grand Iftar Knowledge Contest Award',
    caption: 'Honoring student winners of the annual Islamic Knowledge & Seerah Quiz Contest.'
  },
  {
    image: '/images/community.jpg',
    title: 'MUIS Executive & Volunteer Gathering',
    caption: 'Executive committee officers and student volunteers celebratory gathering after successful events.'
  },
  {
    image: '/images/speaker.jpg',
    title: 'Guest Scholar Interactive Lecture',
    caption: 'Dr. Shamsul Arefin Shakti delivering \'Student\'s Guide to Ideal Muslim Life\'.'
  },
  {
    image: '/images/food_drive.jpg',
    title: 'Direct Community Food Package Handover',
    caption: 'Student volunteer personally handing over food care package to elderly beneficiary.'
  },
  {
    image: '/images/relief.jpg',
    title: 'Sylhet Emergency Flood Relief Drive',
    caption: 'Volunteers carrying relief food sacks across rural bamboo bridge to reach flood-affected families.'
  }
];

export default function PhotoSlideshow() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const timerRef = useRef(null);
  const total = SLIDESHOW_PHOTOS.length;

  const prevIdx = (currentIdx - 1 + total) % total;
  const nextIdx = (currentIdx + 1) % total;
  const currData = SLIDESHOW_PHOTOS[currentIdx];
  const prevData = SLIDESHOW_PHOTOS[prevIdx];
  const nextData = SLIDESHOW_PHOTOS[nextIdx];

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    timerRef.current = setInterval(() => {
      setCurrentIdx((idx) => (idx + 1) % total);
    }, 2500);
  };

  const goTo = (idx) => {
    setCurrentIdx((idx + total) % total);
    startAutoPlay();
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="slideshow-3panel-container"
      id="landing-photo-slideshow"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
    >
      <div className="slideshow-3panel-grid">
        <div
          className="slideshow-preview-card prev"
          id="slideshow-prev-card"
          style={{ backgroundImage: `url('${prevData.image}')` }}
          onClick={() => goTo(currentIdx - 1)}
        >
          <div className="slideshow-panel-overlay">
            <div className="slideshow-preview-title" id="slideshow-prev-title">{prevData.title}</div>
          </div>
        </div>

        <div
          className="slideshow-main-card"
          id="slideshow-main-card"
          style={{ backgroundImage: `url('${currData.image}')` }}
        >
          <button className="slideshow-middle-btn prev" id="slideshow-middle-prev" aria-label="Previous Photo" onClick={() => goTo(currentIdx - 1)}>
            <ChevronLeft />
          </button>

          <button className="slideshow-middle-btn next" id="slideshow-middle-next" aria-label="Next Photo" onClick={() => goTo(currentIdx + 1)}>
            <ChevronRight />
          </button>

          <div className="slideshow-panel-overlay">
            <h3 className="slideshow-main-title" id="slideshow-main-title">{currData.title}</h3>
            <p className="slideshow-main-caption" id="slideshow-main-caption">{currData.caption}</p>
          </div>
        </div>

        <div
          className="slideshow-preview-card next"
          id="slideshow-next-card"
          style={{ backgroundImage: `url('${nextData.image}')` }}
          onClick={() => goTo(currentIdx + 1)}
        >
          <div className="slideshow-panel-overlay">
            <div className="slideshow-preview-title" id="slideshow-next-title">{nextData.title}</div>
          </div>
        </div>
      </div>

      <div className="slideshow-3panel-controls">
        <div className="coverflow-dots">
          {SLIDESHOW_PHOTOS.map((_, idx) => (
            <span
              key={idx}
              className={`coverflow-dot${idx === currentIdx ? ' active' : ''}`}
              data-dot={idx}
              onClick={() => goTo(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
