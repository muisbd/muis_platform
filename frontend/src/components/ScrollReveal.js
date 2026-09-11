'use client';

import { useEffect, useRef } from 'react';

export default function ScrollReveal({ as: Tag = 'section', id, className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag id={id} ref={ref} className={className}>
      {children}
    </Tag>
  );
}

export function AboutScrollSection({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    function triggerAnimation() {
      target.classList.add('is-visible');
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          triggerAnimation();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 50px 0px' });

    observer.observe(target);

    const handleScroll = () => {
      const rect = target.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.95 || window.scrollY > 10) {
        triggerAnimation();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      id="about-muis-section"
      ref={ref}
      className="section section-bg-surface about-muis-viewport-section about-slide-up-trigger section-scroll-reveal"
    >
      {children}
    </section>
  );
}

