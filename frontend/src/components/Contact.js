'use client';

import { useState } from 'react';
import { MapPin, Mail, Phone, Facebook, Youtube, Send } from 'lucide-react';
import { showToast } from '../utils/toast.js';
import { api } from '../lib/api.js';

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    try {
      await api('/contact', {
        method: 'POST',
        body: {
          name: form.querySelector('#contact-name').value.trim(),
          email: form.querySelector('#contact-email').value.trim(),
          subject: form.querySelector('#contact-subject').value.trim(),
          message: form.querySelector('#contact-message').value.trim()
        }
      });
      form.reset();
      showToast('Message sent! A MUIS committee member will get back to you shortly.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="contact-grid">
          <div className="contact-info-card">
            <div>
              <div className="eyebrow" style={{ color: 'var(--color-gold-light)' }}>Get in Touch</div>
              <h3>We&apos;d Love to Hear From You</h3>
              <p>Have questions about MUIS, prayer room access, or upcoming events? Send us a message or visit our campus office.</p>

              <div className="contact-detail-list">
                <div className="contact-detail-item">
                  <div className="contact-icon-wrap"><MapPin style={{ color: '#C084FC' }} /></div>
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Campus Location</strong>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(243,244,246,0.85)' }}>Metropolitan University, Bateshwar, Sylhet-3104, Bangladesh</div>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-icon-wrap"><Mail style={{ color: '#38BDF8' }} /></div>
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Email Address</strong>
                    <div style={{ fontSize: '0.9rem' }}><a href="mailto:muis@metrouni.edu.bd" style={{ color: '#38BDF8', textDecoration: 'underline' }}>muis@metrouni.edu.bd</a></div>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-icon-wrap"><Phone style={{ color: '#10B981' }} /></div>
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Phone / Helpline</strong>
                    <div style={{ fontSize: '0.9rem' }}><a href="tel:+8801576795376" style={{ color: '#10B981', textDecoration: 'underline' }}>+8801576795376</a></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <strong style={{ color: '#C084FC', display: 'block', marginBottom: 12 }}>Follow MUIS Socials:</strong>
              <div className="social-links" style={{ display: 'flex', gap: 12 }}>
                <a href="https://www.facebook.com/muis.sylhet/" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Facebook" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#C084FC', border: '1px solid rgba(139, 92, 246, 0.4)' }}><Facebook /></a>
                <a href="https://www.youtube.com/@muislamicsociety" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="YouTube" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.4)' }}><Youtube /></a>
                <a href="mailto:muis@metrouni.edu.bd" className="social-btn" aria-label="Email" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.4)' }}><Mail /></a>
                <a href="tel:+8801576795376" className="social-btn" aria-label="Phone" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.4)' }}><Phone /></a>
              </div>
            </div>
          </div>

          <div className="form-card" style={{ margin: 0, maxWidth: '100%' }}>
            <h3 style={{ color: 'var(--color-navy)', marginBottom: 20 }}>Send Us a Direct Message</h3>

            <form id="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="contact-name">Your Full Name *</label>
                <input type="text" id="contact-name" required placeholder="Tariq Rahman" />
              </div>

              <div className="form-group">
                <label htmlFor="contact-email">Email Address *</label>
                <input type="email" id="contact-email" required placeholder="student@metropolitan.edu" />
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Subject</label>
                <input type="text" id="contact-subject" placeholder="General Inquiry / Event RSVP" />
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Message *</label>
                <textarea id="contact-message" rows="4" required placeholder="How can MUIS assist you?" />
              </div>

              <button type="submit" className="btn btn-navy btn-lg" style={{ width: '100%' }} disabled={loading}>
                <Send /> {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
