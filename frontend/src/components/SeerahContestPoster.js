'use client';

import { BookOpen, Calendar, Clock, Mail, Mic, PenLine, Sparkles, User } from 'lucide-react';
import { WRITING_CONTEST_DEADLINE_EN } from '../data/sirahSpeakers.js';

const ACCENT = {
  quiz: {
    Icon: BookOpen,
    mark: 'Q',
    meta: [
      { icon: Calendar, label: '17 October' },
      { icon: Clock, label: '11 AM' },
      { icon: BookOpen, label: 'MCQ & short answers' }
    ]
  },
  writing: {
    Icon: PenLine,
    mark: 'W',
    meta: [
      { icon: Calendar, label: `Deadline ${WRITING_CONTEST_DEADLINE_EN}` },
      { icon: PenLine, label: 'Max 200 words' },
      { icon: Mail, label: 'Email or Facebook' }
    ]
  },
  seminar: {
    Icon: Mic,
    mark: 'S',
    meta: [
      { icon: Calendar, label: '17 October' },
      { icon: Clock, label: 'Two sessions' },
      { icon: Mic, label: 'Bus & lunch' }
    ]
  },
  conference: {
    Icon: Sparkles,
    mark: '26',
    meta: [
      { icon: Calendar, label: '17 October' },
      { icon: Sparkles, label: 'One registration' },
      { icon: BookOpen, label: '150 BDT' }
    ]
  }
};

export default function SeerahContestPoster({ slide, variant = 'carousel' }) {
  const accent = ACCENT[slide.accent] || ACCENT.quiz;
  const Icon = accent.Icon;
  const guests = Array.isArray(slide.guests) ? slide.guests : [];
  const highlights = Array.isArray(slide.highlights) ? slide.highlights : [];

  return (
    <div className={`seerah-poster seerah-poster-${slide.accent} seerah-poster-${variant}`}>
      <div className="seerah-poster-pattern" aria-hidden="true" />
      <span className="seerah-poster-mark" aria-hidden="true">{accent.mark}</span>
      <span className="seerah-poster-corner tl" aria-hidden="true" />
      <span className="seerah-poster-corner tr" aria-hidden="true" />
      <span className="seerah-poster-corner bl" aria-hidden="true" />
      <span className="seerah-poster-corner br" aria-hidden="true" />

      <div className="seerah-poster-body">
        <span className="seerah-poster-kicker">
          <Icon />
          {slide.kicker}
        </span>
        <h3 className="seerah-poster-title">
          <span>{slide.line1}</span>
          <strong>{slide.line2}</strong>
        </h3>
        <div className="seerah-poster-rule" aria-hidden="true">
          <i />
        </div>
        {slide.title ? <p className="seerah-poster-bn">{slide.title}</p> : null}
        {highlights.length ? (
          <div className="seerah-poster-guests seerah-poster-highlights">
            {highlights.map((item) => (
              <span key={item} className="seerah-poster-guest">
                <Sparkles />
                {item}
              </span>
            ))}
          </div>
        ) : null}
        {guests.length ? (
          <div className="seerah-poster-guests">
            {guests.map((name) => (
              <span key={name} className="seerah-poster-guest">
                <User />
                {name}
              </span>
            ))}
          </div>
        ) : null}
        <div className="seerah-poster-meta">
          {accent.meta.map((item) => {
            const MetaIcon = item.icon;
            return (
              <span key={item.label} className="seerah-poster-chip">
                <MetaIcon />
                {item.label}
              </span>
            );
          })}
        </div>
        {variant === 'cover' ? null : (
          <p className="seerah-poster-caption" lang="bn">{slide.caption}</p>
        )}
      </div>
    </div>
  );
}
