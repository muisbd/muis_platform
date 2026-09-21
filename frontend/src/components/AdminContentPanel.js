'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { showToast } from '../utils/toast.js';

const EMPTY_EVENT = {
  slug: '',
  title: '',
  date: '',
  time: '',
  location: '',
  description: '',
  image: '',
  isUpcoming: true,
  pinned: false
};
const EMPTY_COURSE = {
  slug: '',
  title: '',
  instructor: '',
  description: '',
  duration: '',
  schedule: '',
  venue: '',
  type: 'Course',
  archived: false
};
const EMPTY_MEMBER = { name: '', role: '', dept: '', quote: '', avatar: '', order: 0 };
const EMPTY_GALLERY = { image: '', tag: 'Community', caption: '' };
const EMPTY_MAG = { slug: '', title: '', issue: '', downloadUrl: '' };

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const data = await api('/upload', { method: 'POST', formData });
  return data.url;
}

export default function AdminContentPanel({ isAdmin }) {
  const [section, setSection] = useState('events');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [committee, setCommittee] = useState([]);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [editingEventId, setEditingEventId] = useState('');
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [editingCourseId, setEditingCourseId] = useState('');
  const [memberForm, setMemberForm] = useState(EMPTY_MEMBER);
  const [editingMemberId, setEditingMemberId] = useState('');
  const [galleryForm, setGalleryForm] = useState(EMPTY_GALLERY);
  const [magForm, setMagForm] = useState(EMPTY_MAG);
  const [uploading, setUploading] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [eventData, courseData, enrollData, committeeData] = await Promise.all([
        api('/events'),
        api('/courses'),
        api('/admin/enrollments'),
        api('/content/committee')
      ]);
      const allEvents = [...(eventData.upcoming || []), ...(eventData.past || [])];
      setEvents(allEvents);
      setCourses([...(courseData.upcoming || []), ...(courseData.archived || [])]);
      setEnrollments(enrollData.list || []);
      setGallery(eventData.gallery || []);
      setCommittee(committeeData.members || []);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (file, target) => {
    if (!file) return;
    setUploading(target);
    try {
      const url = await uploadImage(file);
      if (target === 'event') setEventForm((prev) => ({ ...prev, image: url }));
      if (target === 'gallery') setGalleryForm((prev) => ({ ...prev, image: url }));
      if (target === 'member') setMemberForm((prev) => ({ ...prev, avatar: url }));
      showToast('Image uploaded.');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setUploading('');
    }
  };

  const saveEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingEventId) {
        await api(`/events/${editingEventId}`, { method: 'PATCH', body: eventForm });
        showToast('Event updated.');
      } else {
        await api('/events', { method: 'POST', body: eventForm });
        showToast('Event saved.');
      }
      setEventForm(EMPTY_EVENT);
      setEditingEventId('');
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourseId) {
        await api(`/courses/${editingCourseId}`, { method: 'PATCH', body: courseForm });
        showToast('Course updated.');
      } else {
        await api('/courses', { method: 'POST', body: courseForm });
        showToast('Course saved.');
      }
      setCourseForm(EMPTY_COURSE);
      setEditingCourseId('');
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const saveMember = async (e) => {
    e.preventDefault();
    try {
      if (editingMemberId) {
        await api(`/content/committee/${editingMemberId}`, { method: 'PATCH', body: memberForm });
        showToast('Committee member updated.');
      } else {
        await api('/content/committee', { method: 'POST', body: memberForm });
        showToast('Committee member added.');
      }
      setMemberForm(EMPTY_MEMBER);
      setEditingMemberId('');
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const saveGallery = async (e) => {
    e.preventDefault();
    if (!galleryForm.image || !galleryForm.caption) {
      showToast('Please add a photo and a caption.', true);
      return;
    }
    try {
      await api('/content/gallery', { method: 'POST', body: galleryForm });
      showToast('Photo added to the album.');
      setGalleryForm(EMPTY_GALLERY);
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const studentsFor = (courseId) => enrollments.filter((row) => String(row.course?._id) === String(courseId));

  return (
    <div className="admin-content-panel">
      <p className="admin-help">
        Update website content here: pin events on the home page, edit courses and student lists, upload gallery photos, and change About page committee cards.
      </p>
      <div className="sirah-filter-row" style={{ marginBottom: 20 }}>
        {[
          ['events', 'Events & pin'],
          ['courses', 'Courses'],
          ['gallery', 'Album'],
          ['committee', 'Committee'],
          ['magazine', 'Magazine']
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab-btn${section === id ? ' active' : ''}`}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? <p>Loading…</p> : null}

      {section === 'events' ? (
        <div className="admin-content-grid">
          <form className="form-card" onSubmit={saveEvent}>
            <h3 style={{ color: 'var(--color-navy)' }}>{editingEventId ? 'Edit event' : 'Add event'}</h3>
            <input className="form-control" placeholder="slug (dawah-2027)" required value={eventForm.slug} onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })} />
            <input className="form-control" placeholder="Title" required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            <input className="form-control" placeholder="Date label" required value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
            <input className="form-control" placeholder="Time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} />
            <input className="form-control" placeholder="Location" required value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
            <textarea className="form-control" placeholder="Description / announcement" required value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
            <input className="form-control" placeholder="Image URL" value={eventForm.image} onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })} />
            <label className="admin-file-label">
              {uploading === 'event' ? 'Uploading…' : 'Upload event photo'}
              <input type="file" accept="image/*" hidden onChange={(e) => onUpload(e.target.files?.[0], 'event')} />
            </label>
            <label className="check-row"><input type="checkbox" checked={eventForm.isUpcoming} onChange={(e) => setEventForm({ ...eventForm, isUpcoming: e.target.checked })} /> Upcoming</label>
            <label className="check-row"><input type="checkbox" checked={eventForm.pinned} onChange={(e) => setEventForm({ ...eventForm, pinned: e.target.checked })} /> Pin on home page</label>
            <button className="btn btn-navy" type="submit">{editingEventId ? 'Update event' : 'Create event'}</button>
            {editingEventId ? (
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => {
                  setEditingEventId('');
                  setEventForm(EMPTY_EVENT);
                }}
              >
                Cancel edit
              </button>
            ) : null}
          </form>

          <div className="admin-table-wrap" style={{ gridColumn: '1 / -1' }}>
            <h3>Events</h3>
            {events.map((ev) => (
              <div key={ev._id || ev.slug} className="admin-row">
                <div>
                  <strong>{ev.title}</strong>
                  <div className="admin-meta">
                    {ev.slug} · {ev.isUpcoming ? 'upcoming' : 'past'} · {ev.date}
                    {ev.pinned ? ' · pinned on home' : ''}
                  </div>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-gold"
                    onClick={() => api(`/events/${ev._id || ev.slug}`, { method: 'PATCH', body: { pinned: !ev.pinned } }).then(() => { showToast(ev.pinned ? 'Unpinned from home.' : 'Pinned on home.'); load(); }).catch((err) => showToast(err.message, true))}
                  >
                    {ev.pinned ? 'Unpin' : 'Pin on home'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      setEditingEventId(ev._id || ev.slug);
                      setEventForm({
                        slug: ev.slug || '',
                        title: ev.title || '',
                        date: ev.date || '',
                        time: ev.time || '',
                        location: ev.location || '',
                        description: ev.description || '',
                        image: ev.image || '',
                        isUpcoming: Boolean(ev.isUpcoming),
                        pinned: Boolean(ev.pinned)
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {section === 'courses' ? (
        <div className="admin-content-grid">
          <form className="form-card" onSubmit={saveCourse}>
            <h3 style={{ color: 'var(--color-navy)' }}>{editingCourseId ? 'Edit course' : 'Add course'}</h3>
            <input className="form-control" placeholder="slug" required value={courseForm.slug} onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })} />
            <input className="form-control" placeholder="Title" required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
            <input className="form-control" placeholder="Instructor" value={courseForm.instructor} onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })} />
            <input className="form-control" placeholder="Type (Course / Workshop)" value={courseForm.type} onChange={(e) => setCourseForm({ ...courseForm, type: e.target.value })} />
            <input className="form-control" placeholder="Duration" value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} />
            <input className="form-control" placeholder="Schedule" value={courseForm.schedule} onChange={(e) => setCourseForm({ ...courseForm, schedule: e.target.value })} />
            <input className="form-control" placeholder="Venue" value={courseForm.venue} onChange={(e) => setCourseForm({ ...courseForm, venue: e.target.value })} />
            <textarea className="form-control" placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
            <label className="check-row"><input type="checkbox" checked={courseForm.archived} onChange={(e) => setCourseForm({ ...courseForm, archived: e.target.checked })} /> Archived</label>
            <button className="btn btn-navy" type="submit">{editingCourseId ? 'Update course' : 'Create course'}</button>
            {editingCourseId ? (
              <button className="btn btn-outline" type="button" onClick={() => { setEditingCourseId(''); setCourseForm(EMPTY_COURSE); }}>Cancel edit</button>
            ) : null}
          </form>

          <div className="admin-table-wrap" style={{ gridColumn: '1 / -1' }}>
            <h3>Courses & student progress</h3>
            {courses.map((course) => {
              const students = studentsFor(course._id);
              return (
                <div key={course._id || course.slug} className="admin-course-block">
                  <div className="admin-row">
                    <div>
                      <strong>{course.title}</strong>
                      <div className="admin-meta">{course.instructor || 'No instructor'} · {students.length} student{students.length === 1 ? '' : 's'} · {course.archived ? 'archived' : 'active'}</div>
                    </div>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setEditingCourseId(course._id);
                          setCourseForm({
                            slug: course.slug || '',
                            title: course.title || '',
                            instructor: course.instructor || '',
                            description: course.description || '',
                            duration: course.duration || '',
                            schedule: course.schedule || '',
                            venue: course.venue || '',
                            type: course.type || 'Course',
                            archived: Boolean(course.archived)
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  {students.length ? (
                    <ul className="admin-student-list">
                      {students.map((row) => (
                        <li key={row._id}>
                          <strong>{row.fullName}</strong> · {row.email}
                          <span className="admin-meta"> {row.departmentSemester} · enrolled {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="admin-meta" style={{ padding: '0 12px 12px' }}>No students enrolled yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {section === 'gallery' ? (
        <div className="admin-content-grid">
          <form className="form-card" onSubmit={saveGallery}>
            <h3 style={{ color: 'var(--color-navy)' }}>Upload album photo</h3>
            <input className="form-control" placeholder="Caption" required value={galleryForm.caption} onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })} />
            <input className="form-control" placeholder="Tag (Community, Halaqa…)" value={galleryForm.tag} onChange={(e) => setGalleryForm({ ...galleryForm, tag: e.target.value })} />
            <input className="form-control" placeholder="Image URL" value={galleryForm.image} onChange={(e) => setGalleryForm({ ...galleryForm, image: e.target.value })} />
            <label className="admin-file-label">
              {uploading === 'gallery' ? 'Uploading…' : 'Choose photo'}
              <input type="file" accept="image/*" hidden onChange={(e) => onUpload(e.target.files?.[0], 'gallery')} />
            </label>
            {galleryForm.image ? <img src={galleryForm.image} alt="" className="admin-thumb" /> : null}
            <button className="btn btn-navy" type="submit">Add to album</button>
          </form>
          <div className="admin-table-wrap" style={{ gridColumn: '1 / -1' }}>
            <h3>Album photos</h3>
            {gallery.map((item) => (
              <div key={item._id || item.image} className="admin-row">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img src={item.image} alt="" className="admin-thumb-sm" />
                  <div>
                    <strong>{item.caption}</strong>
                    <div className="admin-meta">{item.tag}</div>
                  </div>
                </div>
                {isAdmin ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => api(`/content/gallery/${item._id}`, { method: 'DELETE' }).then(() => { showToast('Photo removed.'); load(); }).catch((err) => showToast(err.message, true))}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {section === 'committee' ? (
        <div className="admin-content-grid">
          <form className="form-card" onSubmit={saveMember}>
            <h3 style={{ color: 'var(--color-navy)' }}>{editingMemberId ? 'Edit committee member' : 'Add committee member'}</h3>
            <input className="form-control" placeholder="Name" required value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
            <input className="form-control" placeholder="Role" required value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })} />
            <input className="form-control" placeholder="Department" value={memberForm.dept} onChange={(e) => setMemberForm({ ...memberForm, dept: e.target.value })} />
            <input className="form-control" placeholder="Order (0, 1, 2…)" type="number" value={memberForm.order} onChange={(e) => setMemberForm({ ...memberForm, order: Number(e.target.value) })} />
            <textarea className="form-control" placeholder="Quote" value={memberForm.quote} onChange={(e) => setMemberForm({ ...memberForm, quote: e.target.value })} />
            <input className="form-control" placeholder="Photo URL" value={memberForm.avatar} onChange={(e) => setMemberForm({ ...memberForm, avatar: e.target.value })} />
            <label className="admin-file-label">
              {uploading === 'member' ? 'Uploading…' : 'Upload photo'}
              <input type="file" accept="image/*" hidden onChange={(e) => onUpload(e.target.files?.[0], 'member')} />
            </label>
            <button className="btn btn-navy" type="submit">{editingMemberId ? 'Update member' : 'Add member'}</button>
            {editingMemberId ? (
              <button className="btn btn-outline" type="button" onClick={() => { setEditingMemberId(''); setMemberForm(EMPTY_MEMBER); }}>Cancel edit</button>
            ) : null}
          </form>
          <div className="admin-table-wrap" style={{ gridColumn: '1 / -1' }}>
            <h3>About page committee</h3>
            {committee.map((member) => (
              <div key={member._id} className="admin-row">
                <div>
                  <strong>{member.name}</strong>
                  <div className="admin-meta">{member.role} · {member.dept}</div>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      setEditingMemberId(member._id);
                      setMemberForm({
                        name: member.name || '',
                        role: member.role || '',
                        dept: member.dept || '',
                        quote: member.quote || '',
                        avatar: member.avatar || '',
                        order: member.order || 0
                      });
                    }}
                  >
                    Edit
                  </button>
                  {isAdmin ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => api(`/content/committee/${member._id}`, { method: 'DELETE' }).then(() => { showToast('Member removed.'); load(); }).catch((err) => showToast(err.message, true))}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {section === 'magazine' ? (
        <form
          className="form-card"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api('/magazine/editions', { method: 'POST', body: magForm });
              showToast('Edition saved. Paste a Cloudinary PDF URL in downloadUrl.');
              setMagForm(EMPTY_MAG);
            } catch (err) {
              showToast(err.message, true);
            }
          }}
        >
          <h3 style={{ color: 'var(--color-navy)' }}>Add magazine edition</h3>
          <input className="form-control" placeholder="slug" required value={magForm.slug} onChange={(e) => setMagForm({ ...magForm, slug: e.target.value })} />
          <input className="form-control" placeholder="Title" required value={magForm.title} onChange={(e) => setMagForm({ ...magForm, title: e.target.value })} />
          <input className="form-control" placeholder="Issue" value={magForm.issue} onChange={(e) => setMagForm({ ...magForm, issue: e.target.value })} />
          <input className="form-control" placeholder="PDF download URL (Cloudinary)" value={magForm.downloadUrl} onChange={(e) => setMagForm({ ...magForm, downloadUrl: e.target.value })} />
          <button className="btn btn-navy" type="submit">Create edition</button>
        </form>
      ) : null}
    </div>
  );
}
