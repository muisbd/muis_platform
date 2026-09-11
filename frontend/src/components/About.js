'use client';

import { useEffect, useRef, useState } from 'react';

const STATS = [
  { target: 650, initial: '0', label: 'Active Society Members' },
  { target: 35, initial: '0', label: 'Annual Events & Halaqas' },
  { target: 5, initial: '0', label: 'Daily Congregation Prayers' },
  { target: 100, initial: '0%', label: 'Student Volunteers Led' }
];

export default function StatsStrip() {
  const [values, setValues] = useState(STATS.map((s) => s.initial));
  const started = useRef(false);
  const stripRef = useRef(null);

  useEffect(() => {
    const statsSection = stripRef.current;
    if (!statsSection) return;

    const runCounters = () => {
      if (started.current) return;
      started.current = true;

      STATS.forEach((stat, index) => {
        const target = stat.target;
        let count = 0;
        const speed = target / 40;

        const updateCount = () => {
          count += speed;
          if (count < target) {
            setValues((prev) => {
              const next = [...prev];
              next[index] = `${Math.ceil(count)}+`;
              return next;
            });
            setTimeout(updateCount, 30);
          } else {
            setValues((prev) => {
              const next = [...prev];
              next[index] = `${target}+`;
              return next;
            });
          }
        };
        updateCount();
      });
    };

    const onScroll = () => {
      const pos = statsSection.getBoundingClientRect().top;
      if (pos < window.innerHeight) {
        runCounters();
      }
    };

    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="stats-strip" ref={stripRef}>
      {STATS.map((stat, index) => (
        <div key={stat.label} className="stat-item">
          <div className="stat-number" data-target={stat.target}>{values[index]}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
