'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Mail, Phone, Facebook, Youtube, ArrowRight } from 'lucide-react';
import { api } from '../lib/api.js';
import { showToast } from '../utils/toast.js';

export default function Footer() {
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.querySelector('input[type="email"]')?.value.trim();
    setLoading(true);
    try {
      await api('/newsletter', { method: 'POST', body: { email } });
      form.reset();
      showToast('Subscribed to MUIS Newsletter. Check your inbox.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" title="Back to Homepage" style={{ display: 'inline-block' }}>
              <img src="/muis_logo_dark.png" alt="MUIS Logo Footer" style={{ filter: 'brightness(0) invert(1)', cursor: 'pointer' }} />
            </Link>
            <p>Metropolitan University Islamic Society (MUIS) is a student-led organization committed to spiritual growth, brotherhood, sisterhood, and community service on campus.</p>
          </div>

          <div className="footer-mobile-side-by-side">
            <div className="footer-col footer-col-left">
              <h4>Quick Navigation</h4>
              <ul className="footer-links">
                <li><Link href="/about">About Us & Committee</Link></li>
                <li><Link href="/events-programs">Events & Gallery</Link></li>
                <li><Link href="/sirah-2026">Sirah Conference 2026</Link></li>
                <li><Link href="/blogs">Student Blogs</Link></li>
                <li><Link href="/join" style={{ color: '#10B981', fontWeight: 600 }}>Join MUIS</Link></li>
                <li><Link href="/donate">Support & Donate</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
              </ul>
            </div>

            <div className="footer-col footer-col-right">
              <h4>Connect With MUIS</h4>
              <ul className="footer-links footer-contact-list">
                <li>
                  <MapPin style={{ color: '#C084FC' }} /> <span>Bateshwar, Sylhet-3104</span>
                </li>
                <li>
                  <Mail style={{ color: '#38BDF8' }} /> <a href="mailto:muis@metrouni.edu.bd">muis@metrouni.edu.bd</a>
                </li>
                <li>
                  <Phone style={{ color: '#10B981' }} /> <a href="tel:+8801576795376">+8801576795376</a>
                </li>
              </ul>

              <div className="footer-social-row">
                <a href="https://www.facebook.com/muis.sylhet/" target="_blank" rel="noopener noreferrer" className="social-btn facebook" aria-label="Facebook"><Facebook /></a>
                <a href="https://www.youtube.com/@muislamicsociety" target="_blank" rel="noopener noreferrer" className="social-btn youtube" aria-label="YouTube"><Youtube /></a>
              </div>
            </div>
          </div>

          <div className="footer-col footer-col-newsletter">
            <h4>Newsletter</h4>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>Subscribe for weekly campus event updates & announcements.</p>
            <form id="newsletter-form" onSubmit={handleNewsletter} style={{ display: 'flex', gap: 8 }}>
              <input type="email" placeholder="Email address" required style={{ padding: 10, fontSize: '0.88rem' }} />
              <button type="submit" className="btn btn-gold btn-sm" disabled={loading}><ArrowRight /></button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; 2026 Metropolitan University Islamic Society (MUIS). All rights reserved.</div>
          <div>
            Designed & Developed by <a href="https://theniyazkhan.bond" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold-light)', fontWeight: 700, textDecoration: 'underline' }}>Niyaz Ahmad Khan</a>
          </div>
          <div className="text-arabic" style={{ color: 'var(--color-gold-light)', fontSize: '1rem' }}>وَقُل رَّبِّ زِدْنِي عِلْمًا — My Lord, increase me in knowledge</div>
        </div>
      </div>
    </footer>
  );
}
