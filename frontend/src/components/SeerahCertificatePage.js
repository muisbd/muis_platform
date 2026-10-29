'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Phone, Clock, CheckCircle2, XCircle, Pencil, Send } from 'lucide-react';
import PageHeader from './PageHeader.js';
import SignInOptions from './SignInOptions.js';
import ProfileForm from './ProfileForm.js';
import InstallNotifyCard, { notifySkipped } from './InstallNotifyCard.js';
import SeerahCertificateImage from './SeerahCertificateImage.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { syncPush } from '../lib/pwa.js';
import { showToast } from '../utils/toast.js';

const STEPS = ['Sign in', 'Your profile', 'Notifications', 'Send request'];

function StepBar({ current }) {
  return (
    <ol className="cert-steps">
      {STEPS.map((label, i) => (
        <li key={label} className={i < current ? 'done' : i === current ? 'active' : ''}>
          <span>{i < current ? '✓' : i + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}

function ProfileSummary({ user, onEdit }) {
  const isGuest = user.attendeeType === 'guest';
  return (
    <div className="cert-summary">
      <div className="cert-summary-name">
        <span>Name on certificate</span>
        <strong>{user.name}</strong>
      </div>
      <dl>
        <div><dt>Attended as</dt><dd>{isGuest ? 'Guest / Guardian' : 'Student'}</dd></div>
        {!isGuest ? (
          <>
            <div><dt>University</dt><dd>{user.university}</dd></div>
            <div><dt>Student ID</dt><dd>{user.studentId}</dd></div>
            <div><dt>Department</dt><dd>{user.department}</dd></div>
            <div><dt>Batch</dt><dd>{user.batch}</dd></div>
          </>
        ) : (
          <>
            <div><dt>Phone</dt><dd>{user.phone}</dd></div>
            {user.guestNote ? <div><dt>Came with</dt><dd>{user.guestNote}</dd></div> : null}
          </>
        )}
      </dl>
      <button type="button" className="btn btn-sm btn-outline" onClick={onEdit}><Pencil /> Edit profile</button>
    </div>
  );
}

function RequestForm({ user, onSent, onEditProfile }) {
  const [phone, setPhone] = useState(user.phone || '');
  const [registeredVia, setRegisteredVia] = useState('');
  const [confirmName, setConfirmName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!registeredVia) {
      setError('Please tell us how you registered.');
      return;
    }
    setBusy(true);
    try {
      const data = await api('/certificates/seerah-2026', {
        method: 'POST',
        body: { phone: phone.trim(), registeredVia, confirmName }
      });
      showToast(data.message);
      onSent(data.request);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <ProfileSummary user={user} onEdit={onEditProfile} />
      {error ? <div className="join-alert alert-error" role="alert">{error}</div> : null}

      <div className="form-group">
        <label>How did you register for Seerah Conference 2026? *</label>
        <div className="cert-choice-grid">
          {[
            ['website', 'On the website'],
            ['booth', 'At the booth (notebook)'],
            ['not_sure', 'Not sure']
          ].map(([id, label]) => (
            <button key={id} type="button" className={`radio-card${registeredVia === id ? ' selected' : ''}`} onClick={() => setRegisteredVia(id)}>
              <span className="radio-card-btn">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="cert-phone">The phone number you used when you registered *</label>
        <div className="input-with-icon">
          <Phone className="input-icon" />
          <input
            id="cert-phone"
            type="tel"
            className="form-control"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
          />
        </div>
        <p className="cert-phone-help">
          Enter the number you gave <strong>on the website</strong>, <strong>at the booth notebook</strong>, or your
          <strong> WhatsApp number in the Seerah group</strong>. We use it to find you in our list. We will not send you any SMS.
        </p>
      </div>

      <label className="cert-confirm">
        <input type="checkbox" checked={confirmName} onChange={(e) => setConfirmName(e.target.checked)} />
        <span>My name <strong>“{user.name}”</strong> is spelled correctly. I understand it will be printed exactly like this.</span>
      </label>

      <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%' }} disabled={busy || !confirmName}>
        <Send /> {busy ? 'Sending…' : 'Request my Seerah Conference 2026 Certificate'}
      </button>
    </form>
  );
}

export default function SeerahCertificatePage() {
  const { user, ready, isLoggedIn, isStaff } = useAuth();
  const [info, setInfo] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [notifyDone, setNotifyDone] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoadError('');
      setInfo(await api('/certificates/seerah-2026/me'));
    } catch (err) {
      setLoadError(err.message);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) load();
    else setInfo(null);
  }, [isLoggedIn, user, load]);

  useEffect(() => {
    if (notifySkipped()) setNotifyDone(true);
    syncPush().then((on) => { if (on) setNotifyDone(true); });
  }, [isLoggedIn]);

  const request = info?.request;
  const status = request?.status;

  let step = 0;
  if (isLoggedIn && info) {
    if (info.missing?.length || editingProfile) step = 1;
    else if (!notifyDone) step = 2;
    else step = 3;
  }

  let body;
  if (!ready || (isLoggedIn && !info && !loadError)) {
    body = <p className="cert-loading">Loading…</p>;
  } else if (!isLoggedIn) {
    body = (
      <>
        <StepBar current={0} />
        <h3 className="cert-title">Sign in to get your certificate</h3>
        <p className="cert-text">Continue with Google. Your MUIS account is created automatically. No password needed.</p>
        <SignInOptions />
      </>
    );
  } else if (loadError) {
    body = <div className="join-alert alert-error">{loadError}</div>;
  } else if (isStaff) {
    body = (
      <>
        <h3 className="cert-title">You are signed in with a committee account</h3>
        <p className="cert-text">Committee accounts review certificate requests. Open the admin desk to approve or reject them.</p>
        <Link href="/admin?tab=certificates" className="btn btn-gold">Open certificate requests</Link>
      </>
    );
  } else if (status === 'approved') {
    body = (
      <>
        <div className="cert-status cert-status-approved"><CheckCircle2 /> Your certificate is ready</div>
        <p className="cert-text">JazakAllah khair for joining Seerah Conference 2026. Download your certificate below.</p>
        <SeerahCertificateImage name={request.certName} style={info.nameStyle} personStyle={request.nameStyle} showActions />
      </>
    );
  } else if (status === 'pending') {
    body = (
      <>
        <div className="cert-status cert-status-pending"><Clock /> Request sent. Waiting for review</div>
        <p className="cert-text">
          MUIS will check your details against the attendance list. You will get a notification when it is approved.
        </p>
        <dl className="cert-request-meta">
          <div><dt>Name on certificate</dt><dd>{request.certName}</dd></div>
          <div><dt>Attended as</dt><dd>{request.attendeeType === 'guest' ? 'Guest / Guardian' : 'Student'}</dd></div>
          <div><dt>Registration phone</dt><dd>{request.phone}</dd></div>
          <div><dt>Sent on</dt><dd>{new Date(request.updatedAt).toLocaleString()}</dd></div>
        </dl>
        {!notifyDone ? (
          <>
            <h4 className="cert-subtitle">Get notified on your phone</h4>
            <InstallNotifyCard compact />
          </>
        ) : null}
      </>
    );
  } else if (status === 'revoked') {
    body = (
      <>
        <div className="cert-status cert-status-rejected"><XCircle /> Your certificate was withdrawn</div>
        <p className="cert-text">{request.reviewNote || 'Please contact MUIS if you think this is a mistake.'}</p>
        <Link href="/contact" className="btn btn-outline">Contact MUIS</Link>
      </>
    );
  } else if (!info.requestsOpen) {
    body = (
      <>
        <h3 className="cert-title">Certificate requests are closed</h3>
        <p className="cert-text">Please contact MUIS if you attended Seerah Conference 2026 and still need a certificate.</p>
      </>
    );
  } else {
    body = (
      <>
        <StepBar current={step} />
        {status === 'rejected' ? (
          <div className="join-alert alert-error cert-rejected-note">
            <strong>Your last request was not approved.</strong> {request.reviewNote} Fix your details and send again.
          </div>
        ) : null}
        {step === 1 ? (
          <>
            <h3 className="cert-title">Complete your profile</h3>
            <p className="cert-text">We need these details for your certificate.</p>
            <ProfileForm
              submitLabel="Save and continue"
              onSaved={() => {
                setEditingProfile(false);
                load();
              }}
            />
          </>
        ) : step === 2 ? (
          <>
            <h3 className="cert-title">Get notified for free</h3>
            <InstallNotifyCard onDone={() => setNotifyDone(true)} />
          </>
        ) : (
          <>
            <h3 className="cert-title">Send your certificate request</h3>
            <p className="cert-text">MUIS will check it and approve it. Then your certificate appears here.</p>
            <RequestForm user={user} onSent={(req) => setInfo((cur) => ({ ...cur, request: req }))} onEditProfile={() => setEditingProfile(true)} />
          </>
        )}
      </>
    );
  }

  return (
    <div className="page-container page-fade-enter">
      <PageHeader
        title="Seerah Conference 2026 Certificate"
        description="Attended Seerah Conference 2026? Sign in, complete your profile and request your certificate."
        parentPage="Seerah Conference 2026"
        parentHash="/seerah-2026"
        eyebrow="Certificates"
      />
      <section className="section">
        <div className="container">
          <div className={`form-card cert-card${status === 'approved' ? ' wide' : ''}`}>
            <div className="cert-card-head"><Award /> Seerah Conference 2026</div>
            {body}
          </div>
        </div>
      </section>
    </div>
  );
}
