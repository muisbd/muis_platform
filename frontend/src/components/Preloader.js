'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

function isSeerahPath(path) {
  if (!path) return false;
  return path === '/seerah-2026'
    || path.startsWith('/seerah-2026/')
    || path === '/sirah-2026'
    || path.startsWith('/sirah-2026/');
}

export default function Preloader() {
  const pathname = usePathname();
  const skipLogo = isSeerahPath(pathname);
  const [visible, setVisible] = useState(!skipLogo);
  const [fading, setFading] = useState(false);
  const isFirst = useRef(true);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (skipLogo) {
      document.body.style.overflow = '';
      return undefined;
    }

    document.body.style.overflow = 'hidden';
    dismissedRef.current = false;

    const removePreloader = () => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      setFading(true);
      setTimeout(() => {
        setVisible(false);
        setFading(false);
        document.body.style.overflow = '';
      }, 650);
    };

    let loadTimer;
    const startLoadDismiss = () => {
      loadTimer = setTimeout(removePreloader, 600);
    };

    if (document.readyState === 'complete') {
      startLoadDismiss();
    } else {
      window.addEventListener('load', startLoadDismiss);
    }

    const fallbackTimer = setTimeout(removePreloader, 3500);

    return () => {
      window.removeEventListener('load', startLoadDismiss);
      clearTimeout(loadTimer);
      clearTimeout(fallbackTimer);
    };
  }, [skipLogo]);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    if (isSeerahPath(pathname)) {
      setVisible(false);
      setFading(false);
      document.body.style.overflow = '';
      return undefined;
    }

    dismissedRef.current = false;
    setVisible(true);
    setFading(false);
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'instant' });

    const showTimer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setVisible(false);
        setFading(false);
        document.body.style.overflow = '';
      }, 450);
    }, 450);

    return () => clearTimeout(showTimer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      id="preloader"
      className={`preloader-overlay${fading ? ' preloader-fade-out' : ''}`}
      aria-hidden="true"
    >
      <div className="preloader-backdrop" />
      <div className="preloader-glow" />

      <div className="preloader-content">
        <div className="preloader-logo-container">
          <img src="/logo.svg" alt="MUIS Logo" className="preloader-full-logo" />
          <div className="preloader-shimmer-sweep" />
        </div>
      </div>
    </div>
  );
}
