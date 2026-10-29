'use client';

import { useState } from 'react';
import { User, CreditCard, GraduationCap, Layers, Phone, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { showToast } from '../utils/toast.js';

const UNIVERSITIES = ['Metropolitan University', 'Leading University'];

export default function ProfileForm({ onSaved, submitLabel = 'Save profile' }) {
  const { user, updateProfile } = useAuth();
  const knownUniversity = UNIVERSITIES.includes(user?.university);
  const [name, setName] = useState(user?.name || '');
  const [attendeeType, setAttendeeType] = useState(user?.attendeeType || '');
  const [universityChoice, setUniversityChoice] = useState(
    user?.university ? (knownUniversity ? user.university : 'Other') : 'Metropolitan University'
  );
  const [otherUniversity, setOtherUniversity] = useState(knownUniversity ? '' : user?.university || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [batch, setBatch] = useState(user?.batch || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [guestNote, setGuestNote] = useState(user?.guestNote || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isStudent = attendeeType === 'student';
  const isGuest = attendeeType === 'guest';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!attendeeType) {
      setError('Please choose: student or guest.');
      return;
    }
    const university = universityChoice === 'Other' ? otherUniversity.trim() : universityChoice;
    if (isStudent && !university) {
      setError('Please write your university name.');
      return;
    }
    setBusy(true);
    try {
      const saved = await updateProfile({
        name: name.trim().replace(/\s+/g, ' '),
        attendeeType,
        university: isStudent ? university : '',
        studentId: isStudent ? studentId.trim() : '',
        department: isStudent ? department.trim() : '',
        batch: isStudent ? batch.trim() : '',
        phone: phone.trim(),
        guestNote: isGuest ? guestNote.trim() : ''
      });
      showToast('Profile saved.');
      onSaved?.(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="profile-form">
      {error ? <div className="join-alert alert-error" role="alert">{error}</div> : null}

      <div className="form-group">
        <label htmlFor="pf-name">Full name (as it should appear on your certificate) *</label>
        <div className="input-with-icon">
          <User className="input-icon" />
          <input id="pf-name" className="form-control" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Muhammad Abdullah Rahman" autoComplete="name" />
        </div>
        <p className="profile-warning"><AlertTriangle /> Check the spelling. This exact name will be printed on your certificate.</p>
      </div>

      <div className="form-group">
        <label>I attended Seerah Conference 2026 as *</label>
        <div className="radio-card-group">
          <button type="button" className={`radio-card${isStudent ? ' selected' : ''}`} onClick={() => setAttendeeType('student')}>
            <span className="radio-card-btn"><GraduationCap /> Student</span>
          </button>
          <button type="button" className={`radio-card${isGuest ? ' selected' : ''}`} onClick={() => setAttendeeType('guest')}>
            <span className="radio-card-btn"><Users /> Guest / Guardian</span>
          </button>
        </div>
        {isGuest ? <p className="profile-hint">Choose this if you are not a student, for example a parent, guardian or other guest.</p> : null}
      </div>

      {isStudent ? (
        <>
          <div className="form-group">
            <label htmlFor="pf-university">University *</label>
            <select id="pf-university" className="form-control" value={universityChoice} onChange={(e) => setUniversityChoice(e.target.value)}>
              {UNIVERSITIES.map((u) => <option key={u}>{u}</option>)}
              <option value="Other">Other university</option>
            </select>
          </div>
          {universityChoice === 'Other' ? (
            <div className="form-group">
              <label htmlFor="pf-other-uni">University name *</label>
              <input id="pf-other-uni" className="form-control" required value={otherUniversity} onChange={(e) => setOtherUniversity(e.target.value)} />
            </div>
          ) : null}
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="pf-sid">Student ID *</label>
              <div className="input-with-icon">
                <CreditCard className="input-icon" />
                <input id="pf-sid" className="form-control" required value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="231-115-052" autoComplete="off" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="pf-dept">Department *</label>
              <div className="input-with-icon">
                <GraduationCap className="input-icon" />
                <input id="pf-dept" className="form-control" required value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="CSE, BBA, LLB…" />
              </div>
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="pf-batch">Batch *</label>
              <div className="input-with-icon">
                <Layers className="input-icon" />
                <input id="pf-batch" className="form-control" required value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g. 58" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="pf-phone">Phone number</label>
              <div className="input-with-icon">
                <Phone className="input-icon" />
                <input id="pf-phone" type="tel" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" autoComplete="tel" />
              </div>
            </div>
          </div>
        </>
      ) : null}

      {isGuest ? (
        <>
          <div className="form-group">
            <label htmlFor="pf-gphone">Phone number *</label>
            <div className="input-with-icon">
              <Phone className="input-icon" />
              <input id="pf-gphone" type="tel" className="form-control" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" autoComplete="tel" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="pf-note">Who did you come with? <span className="optional-tag">(optional)</span></label>
            <input id="pf-note" className="form-control" value={guestNote} onChange={(e) => setGuestNote(e.target.value)} placeholder="e.g. Father of Rahim, CSE batch 58" />
          </div>
        </>
      ) : null}

      <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%' }} disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
