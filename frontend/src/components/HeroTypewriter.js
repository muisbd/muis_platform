'use client';

import { useEffect, useState } from 'react';

const WORDS = [
  'Student Leadership',
  'Brotherhood',
  'Spiritual Growth',
  'Moral Excellence',
  'Community Service'
];

export default function HeroTypewriter() {
  const [text, setText] = useState(WORDS[0]);

  useEffect(() => {
    let wordIdx = 0;
    let charIdx = WORDS[0].length;
    let isDeleting = true;
    let timer;

    function tick() {
      const targetWord = WORDS[wordIdx];

      if (isDeleting) {
        charIdx = Math.max(0, charIdx - 1);
      } else {
        charIdx = Math.min(targetWord.length, charIdx + 1);
      }

      setText(targetWord.substring(0, charIdx));

      let delay = isDeleting ? 45 : 85;

      if (!isDeleting && charIdx === targetWord.length) {
        delay = 2500;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        wordIdx = (wordIdx + 1) % WORDS.length;
        delay = 300;
      }

      timer = setTimeout(tick, delay);
    }

    timer = setTimeout(tick, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span className="hero-word-slideshow-wrap">
      <span id="hero-rotating-word" className="gradient-text-cyan">{text}</span>
      <span className="typewriter-cursor" />
    </span>
  );
}
