'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Calendar, MapPin } from 'lucide-react';
import PageHeader from './PageHeader.js';
import { UPCOMING_COURSES, PREVIOUS_COURSES } from '../data/coursesData.js';
import { showToast } from '../utils/toast.js';
import { api, mapCourse } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';

export default function CoursesPage() {
  const { isLoggedIn, isMember, isPendingMember, user } = useAuth();
  const [enrollCourse, setEnrollCourse] = useState(null);
  const [notesCourse, setNotesCourse] = useState(null);
  const [upcoming, setUpcoming] = useState(UPCOMING_COURSES);
  const [archived, setArchived] = useState(PREVIOUS_COURSES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/courses')
      .then((data) => {
        if (data.upcoming?.length) setUpcoming(data.upcoming.map(mapCourse));
        if (data.archived?.length) setArchived(data.archived.map(mapCourse));
      })
      .catch(() => {});
  }, []);

  const closeModal = () => {
    setEnrollCourse(null);
    setNotesCourse(null);
    document.body.style.overflow = '';
  };

  const openEnrollModal = (course) => {
    if (!isLoggedIn) {
      showToast('Sign in with your approved MUIS membership to enroll.', true);
      return;
    }
    if (!isMember) {
      showToast(isPendingMember
        ? 'Your Join application is waiting for committee approval.'
        : 'Join MUIS and wait for approval before enrolling in courses.', true);
      return;
    }
    setEnrollCourse(course);
    document.body.style.overflow = 'hidden';
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    try {
      await api(`/courses/${encodeURIComponent(enrollCourse.id)}/enroll`, {
        method: 'POST',
        body: {
          departmentSemester: form.querySelector('[name="departmentSemester"]').value.trim()
        }
      });
      const title = enrollCourse.title;
      closeModal();
      showToast(`Successfully enrolled in "${title}". Check your email for details.`);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleNotesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api(`/courses/${encodeURIComponent(notesCourse.id)}/notes-request`, {
        method: 'POST',
        body: {}
      });
      showToast(`Course notes request for "${notesCourse.title}" sent.`);
      closeModal();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="Islamic Courses & Workshops" description="Structured Islamic education, Tajweed intensives, Fiqh seminars, and spiritual development workshops." />

      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Active Offerings</div>
            <h2>Upcoming Courses & Intensive Workshops</h2>
            <p>Enrollment is for approved MUIS members only. Visitors can still read the catalog. {!isMember ? <> <Link href="/join">Join MUIS</Link> or <Link href="/login">sign in</Link>.</> : null}</p>
          </div>

          <div className="events-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {upcoming.map((course) => (
              <div key={course.id} className="event-card" style={{ border: '1px solid rgba(139, 92, 246, 0.35)', background: 'rgba(15, 23, 42, 0.85)' }}>
                <div className="event-content" style={{ padding: 28 }}>
                  <span className="event-category-badge" style={{ position: 'static', display: 'inline-block', marginBottom: 12, borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38BDF8' }}>{course.type}</span>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: 8, color: '#FFFFFF' }}>{course.title}</h3>
                  <div style={{ fontSize: '0.88rem', color: '#C084FC', fontWeight: 700, marginBottom: 12 }}>
                    Instructor: {course.instructor}
                  </div>

                  <p style={{ color: 'rgba(243, 244, 246, 0.88)', fontSize: '0.94rem', marginBottom: 20 }}>{course.description}</p>

                  <div className="event-meta" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, fontSize: '0.88rem', marginBottom: 20, color: '#38BDF8' }}>
                    <div className="event-meta-item"><Clock /> <strong style={{ color: '#FFFFFF' }}>Schedule:</strong> {course.schedule}</div>
                    <div className="event-meta-item"><Calendar /> <strong style={{ color: '#FFFFFF' }}>Duration:</strong> {course.duration}</div>
                    <div className="event-meta-item"><MapPin /> <strong style={{ color: '#FFFFFF' }}>Venue:</strong> {course.venue}</div>
                  </div>

                  {course.syllabus?.length ? (
                    <div style={{ background: 'rgba(7, 9, 19, 0.7)', padding: 14, borderRadius: 'var(--radius-sm)', marginBottom: 20, border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#38BDF8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Key Syllabus Topics:</strong>
                      <ul style={{ listStyleType: 'disc', paddingLeft: 18, fontSize: '0.85rem', color: 'rgba(243, 244, 246, 0.88)' }}>
                        {course.syllabus.map((topic) => (
                          <li key={topic}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <button className="btn btn-vibrant-primary btn-enroll" onClick={() => openEnrollModal(course)}>Enroll in Course</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-bg-surface">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">Past Studies</div>
            <h2>Previous Courses Archive</h2>
            <p>Access study materials, lecture recordings, and slides from past MUIS courses.</p>
          </div>

          <div className="steps-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {archived.map((course) => (
              <div key={course.id} className="step-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="committee-role" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC', border: '1px solid rgba(168, 85, 247, 0.4)' }}>Archived</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(243, 244, 246, 0.7)' }}>{course.duration}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginBottom: 6 }}>{course.title}</h3>
                <div style={{ fontSize: '0.85rem', color: '#C084FC', fontWeight: 600, marginBottom: 10 }}>Instructor: {course.instructor}</div>
                <p style={{ fontSize: '0.9rem', color: 'rgba(243, 244, 246, 0.85)', marginBottom: 16 }}>{course.summary}</p>
                  <button
                    className="btn btn-outline-white btn-sm btn-request-notes"
                    onClick={() => {
                      if (!isLoggedIn || !isMember) {
                        showToast('Approved MUIS members can request notes after signing in.', true);
                        return;
                      }
                      setNotesCourse(course);
                      document.body.style.overflow = 'hidden';
                    }}
                  >
                  Request Slides & Notes
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {enrollCourse && (
        <div className="lightbox-modal open">
          <div className="lightbox-content" style={{ maxWidth: 500, background: '#0B0E1E', border: '1px solid rgba(139, 92, 246, 0.4)', padding: 36, borderRadius: 'var(--radius-lg)', textAlign: 'left', color: '#FFFFFF' }}>
            <button className="lightbox-close" style={{ top: 16, right: 16, color: '#FFFFFF' }} onClick={closeModal}>&times;</button>
            <div className="eyebrow" style={{ color: '#C084FC' }}>Course Registration</div>
            <h3 style={{ color: '#FFFFFF', marginBottom: 8 }}>{enrollCourse.title}</h3>
            <p style={{ color: 'rgba(243, 244, 246, 0.85)', fontSize: '0.9rem', marginBottom: 24 }}>Complete your registration to receive the digital course handbook and class access link.</p>

            <form id="enroll-form" onSubmit={handleEnrollSubmit}>
              <p style={{ color: 'rgba(243, 244, 246, 0.85)', fontSize: '0.9rem', marginBottom: 16 }}>
                Enrolling as {user?.name} ({user?.email})
              </p>
              <div className="form-group">
                <label style={{ color: '#F3F4F6' }}>Department & Semester *</label>
                <input name="departmentSemester" type="text" required defaultValue={user?.department || ''} placeholder="CSE 5th Semester" />
              </div>
              <button type="submit" className="btn btn-vibrant-primary" style={{ width: '100%', marginTop: 12 }} disabled={loading}>
                {loading ? 'Saving…' : 'Complete Course Enrollment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {notesCourse && (
        <div className="lightbox-modal open">
          <div className="lightbox-content" style={{ maxWidth: 500, background: '#0B0E1E', border: '1px solid rgba(139, 92, 246, 0.4)', padding: 36, borderRadius: 'var(--radius-lg)', textAlign: 'left', color: '#FFFFFF' }}>
            <button className="lightbox-close" style={{ top: 16, right: 16, color: '#FFFFFF' }} onClick={closeModal}>&times;</button>
            <h3 style={{ color: '#FFFFFF', marginBottom: 8 }}>Request notes: {notesCourse.title}</h3>
            <p style={{ color: 'rgba(243, 244, 246, 0.85)', marginBottom: 16 }}>Request will be sent as {user?.name} ({user?.email}).</p>
            <form onSubmit={handleNotesSubmit}>
              <button type="submit" className="btn btn-vibrant-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending…' : 'Request slides'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
