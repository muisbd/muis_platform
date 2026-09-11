'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UserPlus, User, CreditCard, GraduationCap, Award, UserCheck,
  Mail, Phone, BookOpen, Calendar, Loader2, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api.js';

export default function JoinPage() {
  const [status, setStatus] = useState('Current Student');
  const [gender, setGender] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const showAlert = (msg, isError = true) => {
    setAlert({ msg, isError });
  };

  const hideAlert = () => setAlert(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    hideAlert();

    const form = e.currentTarget;
    const name = form.querySelector('#join-name')?.value.trim() || '';
    const id = form.querySelector('#join-id')?.value.trim() || '';
    const email = form.querySelector('#join-email')?.value.trim() || '';
    const phone = form.querySelector('#join-phone')?.value.trim() || '';
    const department = form.querySelector('#join-dept')?.value.trim() || '';
    const year = form.querySelector('#join-year')?.value.trim() || 'N/A';
    const motivation = form.querySelector('#join-motivation')?.value.trim() || 'N/A';

    if (!name) {
      showAlert('Please enter your Full Name.');
      return;
    }
    if (!id) {
      showAlert('Please enter your Student ID.');
      return;
    }
    if (!status) {
      showAlert('Please select your Status (Current Student / Alumni).');
      return;
    }
    if (!gender) {
      showAlert('Please select your Gender.');
      return;
    }
    if (!email || !email.includes('@')) {
      showAlert('Please enter a valid Email Address.');
      return;
    }
    if (!phone) {
      showAlert('Please enter your Mobile Number (WhatsApp).');
      return;
    }
    if (!department) {
      showAlert('Please enter your Department (e.g. CSE, LLB, BBA).');
      return;
    }

    const payload = {
      name,
      studentId: id,
      status,
      gender,
      email,
      phone,
      department,
      year: year || 'N/A',
      motivation: motivation || 'N/A'
    };

    setLoading(true);

    try {
      await api('/membership', { method: 'POST', body: payload });
      setLoading(false);
      setSuccess({ ...payload, id });
    } catch (err) {
      setLoading(false);
      showAlert(err.message || 'Could not submit your application. Please try again.');
    }
  };

  const submitAnother = () => {
    setSuccess(null);
    setStatus('Current Student');
    setGender('');
    hideAlert();
    setFormKey((k) => k + 1);
  };

  return (
    <div className="page-container join-page-container page-fade-enter" style={{ paddingTop: 100 }}>
      <section className="section section-bg-surface" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="join-form-wrapper">
            <div className="join-card">
              <div className="join-card-header">
                <h2><UserPlus className="join-icon-glow" /> Membership Application Form</h2>
                <p>Please fill out your details below to join MUIS.</p>
              </div>

              <form key={formKey} id="join-muis-form" className={`join-form${success ? ' hidden' : ''}`} noValidate onSubmit={handleSubmit}>
                <div
                  id="join-form-alert"
                  className={`join-alert${alert ? (alert.isError ? ' alert-error' : ' alert-success') : ' hidden'}`}
                  role="alert"
                >
                  {alert?.msg}
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="join-name">Full Name <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <User className="input-icon" />
                      <input type="text" id="join-name" name="name" className="form-control" placeholder="e.g. Niyaz Ahmad Khan" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="join-id">Student ID <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <CreditCard className="input-icon" />
                      <input type="text" id="join-id" name="id" className="form-control" placeholder="e.g. 231-115-052" required />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Status <span className="required">*</span></label>
                    <div className="radio-card-group">
                      <label className={`radio-card${status === 'Current Student' ? ' selected' : ''}`} id="status-card-current">
                        <input type="radio" id="status-current" name="status" value="Current Student" checked={status === 'Current Student'} required onChange={() => setStatus('Current Student')} />
                        <span className="radio-card-btn"><GraduationCap /> Current Student</span>
                      </label>
                      <label className={`radio-card${status === 'Alumni' ? ' selected' : ''}`} id="status-card-alumni">
                        <input type="radio" id="status-alumni" name="status" value="Alumni" checked={status === 'Alumni'} required onChange={() => setStatus('Alumni')} />
                        <span className="radio-card-btn"><Award /> Alumni</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Gender <span className="required">*</span></label>
                    <div className="radio-card-group">
                      <label className={`radio-card${gender === 'Male' ? ' selected' : ''}`} id="gender-card-male">
                        <input type="radio" id="gender-male" name="gender" value="Male" checked={gender === 'Male'} required onChange={() => setGender('Male')} />
                        <span className="radio-card-btn"><UserCheck /> Male</span>
                      </label>
                      <label className={`radio-card${gender === 'Female' ? ' selected' : ''}`} id="gender-card-female">
                        <input type="radio" id="gender-female" name="gender" value="Female" checked={gender === 'Female'} required onChange={() => setGender('Female')} />
                        <span className="radio-card-btn"><User /> Female</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="join-email">Email Address <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <Mail className="input-icon" />
                      <input type="email" id="join-email" name="email" className="form-control" placeholder="e.g. student@metrouni.edu.bd" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="join-phone">Mobile Number (WhatsApp) <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <Phone className="input-icon" />
                      <input type="tel" id="join-phone" name="phone" className="form-control" placeholder="e.g. +8801712345678" required />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="join-dept">Department <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <BookOpen className="input-icon" />
                      <input type="text" id="join-dept" name="department" className="form-control" placeholder="e.g. CSE, LLB, BBA" required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="join-year">Year & Semester <span className="optional-tag">(For Current Students)</span></label>
                    <div className="input-with-icon">
                      <Calendar className="input-icon" />
                      <input type="text" id="join-year" name="year" className="form-control" placeholder="e.g. 3-2" />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label htmlFor="join-motivation">Why do you want to join MUIS? <span className="optional-tag">(Optional)</span></label>
                  <div className="textarea-with-icon">
                    <textarea id="join-motivation" name="motivation" className="form-control textarea-control" rows="3" placeholder="Share your motivation or thoughts on joining MUIS (Optional)..." />
                  </div>
                </div>

                <div className="form-submit-row text-center">
                  <button type="submit" id="join-submit-btn" className="btn btn-emerald btn-lg btn-center" disabled={loading}>
                    <span className={`btn-text${loading ? ' hidden' : ''}`}>Complete Membership Application</span>
                    <span className={`btn-spinner${loading ? '' : ' hidden'}`}><Loader2 className="spin" /> Submitting...</span>
                  </button>
                </div>

                <div className="privacy-note text-center">
                  <ShieldCheck style={{ width: 14, height: 14, display: 'inline-block', verticalAlign: 'middle' }} />
                  {' '}Your information is securely processed for official MUIS membership records.
                </div>
              </form>

              <div id="join-success-card" className={`join-success-card${success ? '' : ' hidden'}`}>
                <div className="success-icon-wrap">
                  <CheckCircle2 />
                </div>
                <h3>JazakAllah Khair! Application Received</h3>
                <p id="join-success-msg">Your MUIS membership application has been saved. Check your email for confirmation. You can also <Link href="/register">create a student account</Link> for the private prayer journal.</p>
                {success && (
                  <div className="success-details-box text-left" id="success-summary-box">
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', lineHeight: 1.8, marginTop: 16 }}>
                      <div><strong>Name:</strong> {success.name}</div>
                      <div><strong>Student ID:</strong> {success.id}</div>
                      <div><strong>Status:</strong> {success.status}</div>
                      <div><strong>Gender:</strong> {success.gender}</div>
                      <div><strong>Email:</strong> {success.email}</div>
                      <div><strong>Mobile (WhatsApp):</strong> {success.phone}</div>
                      <div><strong>Department:</strong> {success.department}</div>
                      <div><strong>Year & Semester:</strong> {success.year}</div>
                      {success.motivation !== 'N/A' ? <div><strong>Why Join MUIS:</strong> {success.motivation}</div> : null}
                    </div>
                  </div>
                )}
                <div className="success-actions" style={{ marginTop: 24, textAlign: 'center' }}>
                  <Link href="/" className="btn btn-emerald btn-md">Return to Homepage</Link>
                  <button id="join-another-btn" type="button" className="btn btn-outline btn-md" style={{ marginLeft: 12 }} onClick={submitAnother}>Submit Another Response</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
