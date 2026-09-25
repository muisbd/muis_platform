'use client';

import { useEffect, useRef } from 'react';

export default function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const heroSection = document.getElementById('home');

    let width = canvas.width = (heroSection && heroSection.clientWidth > 0) ? heroSection.clientWidth : (window.innerWidth || 1200);
    let height = canvas.height = (heroSection && heroSection.clientHeight > 0) ? heroSection.clientHeight : 700;

    let mouseX = -1000;
    let mouseY = -1000;
    let running = true;

    const colors = [
      { r: 168, g: 85, b: 247 },
      { r: 56, g: 189, b: 248 },
      { r: 99, g: 102, b: 241 },
      { r: 52, g: 211, b: 153 },
      { r: 245, g: 158, b: 11 }
    ];

    const motifs = [];
    const motifCount = Math.min(Math.floor((width * height) / 28000), 28);

    function createMotifs() {
      motifs.length = 0;
      for (let i = 0; i < motifCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const type = Math.random() > 0.4 ? 'star8' : (Math.random() > 0.5 ? 'octagram' : 'diamond');
        const size = Math.random() * 22 + 14;
        motifs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          size,
          baseSize: size,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.008,
          color,
          alpha: Math.random() * 0.28 + 0.18,
          type
        });
      }
    }

    createMotifs();

    const onResize = () => {
      if (!heroSection) return;
      width = canvas.width = heroSection.clientWidth;
      height = canvas.height = heroSection.clientHeight;
      createMotifs();
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('resize', onResize);
    if (heroSection) {
      heroSection.addEventListener('mousemove', onMouseMove);
      heroSection.addEventListener('mouseleave', onMouseLeave);
    }

    function drawIslamicStar(x, y, outerR, innerR, angle, color, alpha, fill = true) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      const points = 8;
      for (let i = 0; i < points * 2; i++) {
        const r = (i % 2 === 0) ? outerR : innerR;
        const a = (i * Math.PI) / points;
        const px = r * Math.cos(a);
        const py = r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      if (fill) {
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.18})`;
        ctx.fill();
      }
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    function drawIslamicOctagram(x, y, size, angle, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.4})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      for (let sq = 0; sq < 2; sq++) {
        ctx.save();
        ctx.rotate(sq * (Math.PI / 4));
        const s = size * 0.78;
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        ctx.restore();
      }

      drawIslamicStar(0, 0, size * 0.35, size * 0.18, -angle * 1.5, color, alpha, false);

      ctx.restore();
    }

    function drawIslamicDiamond(x, y, size, angle, color, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.6, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.6, 0);
      ctx.closePath();
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.lineWidth = 0.95;
      ctx.stroke();
      ctx.restore();
    }

    function animate() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < motifs.length; i++) {
        const m = motifs[i];

        m.x += m.vx;
        m.y += m.vy;
        m.angle += m.rotSpeed;

        if (m.x < -40) m.x = width + 40;
        if (m.x > width + 40) m.x = -40;
        if (m.y < -40) m.y = height + 40;
        if (m.y > height + 40) m.y = -40;

        const dx = mouseX - m.x;
        const dy = mouseY - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxMouseDist = 180;

        let currentAlpha = m.alpha;
        let currentSize = m.baseSize;

        if (dist < maxMouseDist) {
          const factor = (1 - dist / maxMouseDist);
          currentSize = m.baseSize + factor * 8;
          currentAlpha = Math.min(m.alpha + factor * 0.55, 0.95);
        }

        if (m.type === 'star8') {
          drawIslamicStar(m.x, m.y, currentSize, currentSize * 0.45, m.angle, m.color, currentAlpha);
        } else if (m.type === 'octagram') {
          drawIslamicOctagram(m.x, m.y, currentSize, m.angle, m.color, currentAlpha);
        } else {
          drawIslamicDiamond(m.x, m.y, currentSize * 0.7, m.angle, m.color, currentAlpha);
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      running = false;
      window.removeEventListener('resize', onResize);
      if (heroSection) {
        heroSection.removeEventListener('mousemove', onMouseMove);
        heroSection.removeEventListener('mouseleave', onMouseLeave);
      }
    };
  }, []);

  return <canvas id="hero-dot-canvas" ref={canvasRef} className="hero-dot-canvas" />;
}
