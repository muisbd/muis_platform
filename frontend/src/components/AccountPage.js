'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, UserCircle, BellRing, Pencil } from 'lucide-react';
import PageHeader from './PageHeader.js';
import SignInOptions from './SignInOptions.js';
import ProfileForm from './ProfileForm.js';
import InstallNotifyCard from './InstallNotifyCard.js';
import SeerahCertificateImage from './SeerahCertificateImage.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';

const STATUS_TEXT = {
  pending: 'Request sent. Waiting for review.',
  approved: 'Approved. Your certificate is ready.',
  rejected: 'Not approved. Fix your details and send again.',
  revoked: 'Withdrawn by MUIS.'
};

export default function AccountPage() {
  const { user, ready, isLoggedIn, isStaff } = useAuth();
  const [cert, setCert] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || isStaff) return;
    api('/certificates/seerah-2026/me').then(setCert).catch(() => setCert(null));
  }, [isLoggedIn, isStaff, user]);

  const profileIncomplete = Boolean(user && !isStaff && (!user.attendeeType || cert?.missing?.length));
  const request = cert?.request;

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="My profile" description="Your MUIS account, certificates and notifications." eyebrow="Account" />
      <section className="section">
        <div className="container account-grid">
          {!ready ? <p className="cert-loading">Loading…</p> : !isLoggedIn ? (
            <div className="form-card cert-card">
              <h3 className="cert-title">Sign in</h3>
              <SignInOptions />
            </div>
          ) : (
            <>
              <div className="form-card cert-card">
                <div className="cert-card-head"><UserCircle /> Profile</div>
                {editing || profileIncomplete ? (
                  <ProfileForm onSaved={() => setEditing(false)} />
                ) : (
                  <div className="cert-summary">
                    <div className="cert-summary-name">
                      <span>Full name</span>
                      <strong>{user.name}</strong>
                    </div>
                    <dl>
                      <div><dt>Email</dt><dd>{user.email}</dd></div>
                      <div><dt>Attended as</dt><dd>{user.attendeeType === 'guest' ? 'Guest / Guardian' : 'Student'}</dd></div>
                      {user.attendeeType === 'student' ? (
                        <>
                          <div><dt>University</dt><dd>{user.university}</dd></div>
                          <div><dt>Student ID</dt><dd>{user.studentId}</dd></div>
                          <div><dt>Department</dt><dd>{user.department}</dd></div>
                          <div><dt>Batch</dt><dd>{user.batch}</dd></div>
                        </>
                      ) : null}
                      {user.phone ? <div><dt>Phone</dt><dd>{user.phone}</dd></div> : null}
                      {user.guestNote ? <div><dt>Came with</dt><dd>{user.guestNote}</dd></div> : null}
                    </dl>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditing(true)}><Pencil /> Edit profile</button>
                  </div>
                )}
              </div>

              {!isStaff ? (
                <div className="form-card cert-card">
                  <div className="cert-card-head"><Award /> My certificates</div>
                  <h4 className="cert-subtitle">Seerah Conference 2026</h4>
                  <p className="cert-text">{request ? STATUS_TEXT[request.status] : 'You have not requested this certificate yet.'}</p>
                  {request?.status === 'approved' ? (
                    <SeerahCertificateImage name={request.certName} style={cert.nameStyle} personStyle={request.nameStyle} showActions />
                  ) : (
                    <Link href="/seerah-2026/certificate" className="btn btn-gold">
                      {request ? 'Open certificate page' : 'Request my certificate'}
                    </Link>
                  )}
                </div>
              ) : null}

              <div className="form-card cert-card">
                <div className="cert-card-head"><BellRing /> Phone notifications</div>
                <InstallNotifyCard compact />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
