'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from './PageHeader.js';
import AdminContentPanel from './AdminContentPanel.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { showToast } from '../utils/toast.js';

const ALL_TABS = [
  { id: 'overview', label: 'Overview', roles: ['admin', 'moderator', 'treasurer'] },
  { id: 'memberships', label: 'Membership', roles: ['admin', 'moderator'] },
  { id: 'messages', label: 'Messages', roles: ['admin', 'moderator'] },
  { id: 'donations', label: 'Donations', roles: ['admin', 'treasurer'] },
  { id: 'rsvps', label: 'Event tickets', roles: ['admin', 'moderator'] },
  { id: 'sirah', label: 'Sirah 2026', roles: ['admin', 'moderator', 'treasurer'] },
  { id: 'enrollments', label: 'Enrollments', roles: ['admin', 'moderator'] },
  { id: 'notes', label: 'Notes', roles: ['admin', 'moderator'] },
  { id: 'magazine', label: 'Writing', roles: ['admin', 'moderator'] },
  { id: 'blogs', label: 'Blogs', roles: ['admin', 'moderator'] },
  { id: 'users', label: 'Users', roles: ['admin'] },
  { id: 'content', label: 'Content', roles: ['admin', 'moderator'] }
];

function statusLabel(value) {
  return {
    new: 'New',
    approved: 'Approved',
    added_to_group: 'In WhatsApp group',
    rejected: 'Rejected',
    pending: 'Pending',
    matched: 'Verified',
    handled: 'Handled',
    pending_review: 'Pending',
    pending_verify: 'Pending',
    published: 'Published',
    draft: 'Draft',
    accepted: 'Accepted'
  }[value] || value;
}

function fmt(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

function csvCell(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadSirahCsv(list, filename) {
  const headers = ['Name', 'Student ID', 'Phone', 'Email', 'Department', 'Batch', 'Gender', 'Payment method', 'TrxID / Paid to', 'Status', 'Reference', 'Submitted'];
  const lines = [
    headers.join(','),
    ...list.map((row) => [
      row.name,
      row.studentId,
      row.phone,
      row.email,
      row.department,
      row.batch,
      row.gender,
      row.paymentMethod,
      sirahPaymentRef(row),
      row.status,
      row.ticketCode,
      row.createdAt ? new Date(row.createdAt).toISOString() : ''
    ].map(csvCell).join(','))
  ];
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function sirahListText(list) {
  const header = ['Name', 'Student ID', 'Phone', 'Email', 'Department', 'Batch', 'Gender', 'Payment', 'TrxID / Paid to'].join('\t');
  const body = list.map((row) => [
    row.name,
    row.studentId,
    row.phone,
    row.email,
    row.department,
    row.batch || '',
    row.gender || '',
    row.paymentMethod,
    sirahPaymentRef(row)
  ].join('\t'));
  return [header, ...body].join('\n');
}

async function copyText(text, okMessage) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(okMessage);
  } catch {
    showToast('Could not copy.', true);
  }
}

function isCashPayment(row) {
  return String(row?.paymentMethod || '').toLowerCase() === 'cash';
}

function sirahPaymentRef(row) {
  if (isCashPayment(row)) return row.paidTo || row.trxId || '—';
  return row.trxId || '—';
}

function sirahPaymentLabel(row) {
  return isCashPayment(row) ? `Cash · Paid to ${sirahPaymentRef(row)}` : `${row.paymentMethod} · TrxID ${sirahPaymentRef(row)}`;
}

function isSirahPending(row) {
  return row.status === 'pending_review' || row.status === 'pending_verify';
}

export default function AdminDashboard() {
  const { user, ready, isStaff } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sirahUpdates, setSirahUpdates] = useState([]);
  const [sirahFilter, setSirahFilter] = useState('pending');

  const tabs = ALL_TABS.filter((t) => user && (user.role === 'admin' || t.roles.includes(user.role)));

  useEffect(() => {
    if (!ready) return;
    if (!isStaff) router.replace('/login');
  }, [ready, isStaff, router]);

  const load = async (current = tab) => {
    setLoading(true);
    try {
      if (current === 'overview') {
        setOverview(await api('/admin/overview'));
      } else if (current === 'memberships') setRows((await api('/admin/memberships')).list || []);
      else if (current === 'messages') setRows((await api('/admin/messages')).list || []);
      else if (current === 'donations') setRows((await api('/admin/donations')).list || []);
      else if (current === 'rsvps') setRows((await api('/admin/rsvps')).list || []);
      else if (current === 'sirah') {
        setRows((await api('/admin/sirah')).list || []);
        try {
          setSirahUpdates((await api('/admin/sirah-updates')).list || []);
        } catch {
          setSirahUpdates([]);
        }
      }
      else if (current === 'enrollments') setRows((await api('/admin/enrollments')).list || []);
      else if (current === 'notes') setRows((await api('/admin/notes')).list || []);
      else if (current === 'magazine') setRows((await api('/admin/magazine-submissions')).list || []);
      else if (current === 'blogs') setRows((await api('/admin/blogs')).list || []);
      else if (current === 'users') setRows((await api('/admin/users')).list || []);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isStaff) return;
    if (tab === 'content') return;
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isStaff]);

  const patch = async (path, body) => {
    try {
      await api(path, { method: 'PATCH', body });
      showToast('Saved.');
      load(tab);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  if (!ready || !isStaff) return null;

  return (
    <div className="page-container page-fade-enter admin-page">
      <PageHeader
        title="MUIS Admin"
        description={`Signed in as ${user?.name} (${user?.role}). Super admin can manage membership, tickets, writing, and donations.`}
        eyebrow="Committee desk"
      />
      <section className="section" style={{ paddingTop: 12 }}>
        <div className="container">
          <div className="admin-tabs">
            {tabs.map((t) => (
              <button key={t.id} type="button" className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? <p>Loading…</p> : null}

          {tab === 'overview' && overview ? (
            <div className="progress-stats admin-overview">
              <div className="progress-stat"><strong>{overview.memberships}</strong><span>New memberships</span></div>
              <div className="progress-stat"><strong>{overview.messages}</strong><span>Open messages</span></div>
              <div className="progress-stat"><strong>{overview.donations}</strong><span>Pending TrxIDs</span></div>
              <div className="progress-stat"><strong>{overview.pendingBlogs}</strong><span>Blogs to review</span></div>
              <div className="progress-stat"><strong>{overview.magSubs}</strong><span>Magazine subs</span></div>
              <div className="progress-stat"><strong>{overview.users}</strong><span>Accounts</span></div>
              <div className="progress-stat"><strong>{overview.sirah || 0}</strong><span>Sirah to review</span></div>
            </div>
          ) : null}

          {tab === 'memberships' && Array.isArray(rows) ? (
            <div className="admin-table-wrap">
              <p className="admin-help">
                These are Join applications. Each one also creates a login. <strong>Approve</strong> makes them a MUIS member (courses unlock).
                <strong> In WhatsApp group</strong> = you already added them to the official chat.
              </p>
              {rows.map((row) => (
                <div key={row._id} className="admin-row">
                  <div>
                    <div className="admin-row-title">
                      <strong>{row.name}</strong>
                      <span className={`admin-badge admin-badge-${row.reviewStatus}`}>{statusLabel(row.reviewStatus)}</span>
                    </div>
                    <div className="admin-meta">{row.studentId} · {row.email} · {row.phone}</div>
                    <div className="admin-meta">{row.department} · {row.status} {row.year && row.year !== 'N/A' ? `· ${row.year}` : ''} · {fmt(row.createdAt)}</div>
                    {row.motivation && row.motivation !== 'N/A' ? <p className="admin-meta">Why join: {row.motivation}</p> : null}
                  </div>
                  <div className="admin-actions">
                    {row.reviewStatus !== 'approved' && row.reviewStatus !== 'added_to_group' ? (
                      <button type="button" className="btn btn-sm btn-emerald" onClick={() => patch(`/admin/memberships/${row._id}`, { reviewStatus: 'approved' })}>Approve</button>
                    ) : null}
                    {row.reviewStatus !== 'added_to_group' ? (
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(`/admin/memberships/${row._id}`, { reviewStatus: 'added_to_group' })}>Mark in WhatsApp group</button>
                    ) : null}
                    {row.reviewStatus !== 'rejected' ? (
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(`/admin/memberships/${row._id}`, { reviewStatus: 'rejected' })}>Reject</button>
                    ) : (
                      <button type="button" className="btn btn-sm btn-emerald" onClick={() => patch(`/admin/memberships/${row._id}`, { reviewStatus: 'new' })}>Reopen</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'messages' && Array.isArray(rows) ? (
            <div className="admin-table-wrap">
              {rows.map((row) => (
                <div key={row._id} className="admin-row">
                  <div>
                    <strong>{row.name}</strong> · {row.email} · {row.subject}
                    <p className="admin-meta">{row.message}</p>
                  </div>
                  {!row.handled ? (
                    <button type="button" className="btn btn-sm btn-navy" onClick={() => patch(`/admin/messages/${row._id}`, { handled: true })}>Mark handled</button>
                  ) : <span className="admin-meta">Handled</span>}
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'donations' && Array.isArray(rows) ? (
            <div className="admin-table-wrap">
              {rows.map((row) => (
                <div key={row._id} className="admin-row">
                  <div>
                    <div className="admin-row-title">
                      <strong>{row.donorName}</strong>
                      <span className={`admin-badge admin-badge-${row.verified}`}>{statusLabel(row.verified)}</span>
                    </div>
                    <div className="admin-meta">TrxID {row.trxId} · {row.method}</div>
                    <div className="admin-meta">{row.contact} · {fmt(row.createdAt)}</div>
                  </div>
                  <div className="admin-actions">
                    {row.verified !== 'matched' ? (
                      <button type="button" className="btn btn-sm btn-emerald" onClick={() => patch(`/admin/donations/${row._id}`, { verified: 'matched' })}>Verify</button>
                    ) : null}
                    {row.verified !== 'rejected' ? (
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(`/admin/donations/${row._id}`, { verified: 'rejected' })}>Reject</button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'rsvps' && Array.isArray(rows) ? (
            <div className="admin-table-wrap">
              <p className="admin-help">Guest event applications. Approve to email a ticket. This is not MUIS membership.</p>
              {rows.map((row) => (
                <div key={row._id} className="admin-row">
                  <div>
                    <div className="admin-row-title">
                      <strong>{row.fullName}</strong>
                      <span className={`admin-badge admin-badge-${row.ticketStatus || 'pending'}`}>{statusLabel(row.ticketStatus || 'pending')}</span>
                    </div>
                    <div className="admin-meta">{row.email} · {row.event?.title || row.event?.slug} · {row.departmentYear}</div>
                    {row.ticketCode ? <div className="admin-meta">Ticket {row.ticketCode}</div> : null}
                  </div>
                  <div className="admin-actions">
                    {(row.ticketStatus || 'pending') !== 'approved' ? (
                      <button type="button" className="btn btn-sm btn-emerald" onClick={() => patch(`/admin/rsvps/${row._id}`, { ticketStatus: 'approved' })}>Approve ticket</button>
                    ) : null}
                    {(row.ticketStatus || 'pending') !== 'rejected' ? (
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(`/admin/rsvps/${row._id}`, { ticketStatus: 'rejected' })}>Reject</button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'sirah' && Array.isArray(rows) ? (() => {
            const pendingCount = rows.filter(isSirahPending).length;
            const accepted = rows.filter((row) => row.status === 'accepted');
            const rejectedCount = rows.filter((row) => row.status === 'rejected').length;
            const visible = rows.filter((row) => {
              if (sirahFilter === 'all') return true;
              if (sirahFilter === 'pending') return isSirahPending(row);
              return row.status === sirahFilter;
            });
            return (
            <div className="admin-table-wrap">
              <p className="admin-help">
                Check the TrxID, then Approve or Reject. Use the accepted list below for the final registered candidates.
              </p>
              <div className="sirah-admin-toolbar">
                <div className="sirah-filter-row">
                  {[
                    ['pending', `Pending (${pendingCount})`],
                    ['accepted', `Accepted (${accepted.length})`],
                    ['rejected', `Rejected (${rejectedCount})`],
                    ['all', `All (${rows.length})`]
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={`tab-btn${sirahFilter === id ? ' active' : ''}`}
                      onClick={() => setSirahFilter(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="sirah-export-row">
                  <button
                    type="button"
                    className="btn btn-sm btn-emerald"
                    disabled={!accepted.length}
                    onClick={() => {
                      downloadSirahCsv(accepted, 'sirah-2026-accepted.csv');
                      showToast('Accepted list downloaded.');
                    }}
                  >
                    Download accepted CSV
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    disabled={!accepted.length}
                    onClick={() => copyText(sirahListText(accepted), 'Accepted list copied. Paste into Excel or Google Sheets.')}
                  >
                    Copy accepted list
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    disabled={!rows.length}
                    onClick={() => downloadSirahCsv(rows, 'sirah-2026-all.csv')}
                  >
                    Download all
                  </button>
                </div>
              </div>

              {sirahFilter === 'accepted' && accepted.length ? (
                <div className="sirah-final-table-wrap">
                  <table className="sirah-final-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Student ID</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Dept</th>
                        <th>Batch</th>
                        <th>Gender</th>
                        <th>Payment</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {accepted.map((row, index) => (
                        <tr key={row._id}>
                          <td>{index + 1}</td>
                          <td>{row.name}</td>
                          <td>{row.studentId}</td>
                          <td>{row.phone || '—'}</td>
                          <td>{row.email}</td>
                          <td>{row.department || '—'}</td>
                          <td>{row.batch || '—'}</td>
                          <td>{row.gender || '—'}</td>
                          <td>
                            <button type="button" className="sirah-inline-copy" onClick={() => copyText(sirahPaymentRef(row), isCashPayment(row) ? 'Name copied' : 'TrxID copied')}>
                              {isCashPayment(row) ? `Cash · ${sirahPaymentRef(row)}` : row.trxId}
                            </button>
                          </td>
                          <td>
                            <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(`/admin/sirah/${row._id}`, { status: 'rejected' })}>Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {!visible.length ? <p className="admin-meta">No registrations in this list yet.</p> : null}
              {sirahFilter !== 'accepted' ? visible.map((row) => (
                <div key={row._id} className="admin-row">
                  <div>
                    <div className="admin-row-title">
                      <strong>{row.name}</strong>
                      <span className={`admin-badge admin-badge-${row.status}`}>{statusLabel(row.status)}</span>
                    </div>
                    <div className="admin-meta">{row.studentId} · {row.phone || 'no phone'} · {row.email}</div>
                    <div className="admin-meta">
                      {row.department || 'Department not given'}
                      {row.batch ? ` · Batch ${row.batch}` : ''}
                      {row.gender ? ` · ${row.gender}` : ''}
                    </div>
                    <div className="admin-meta">
                      {sirahPaymentLabel(row)}{' '}
                      <button type="button" className="sirah-inline-copy" onClick={() => copyText(sirahPaymentRef(row), isCashPayment(row) ? 'Name copied' : 'TrxID copied')}>
                        copy
                      </button>
                      {' · '}{fmt(row.createdAt)}
                    </div>
                    {row.ticketCode ? <div className="admin-meta">Reference {row.ticketCode}</div> : null}
                    {row.adminNote ? <div className="admin-meta">Note: {row.adminNote}</div> : null}
                  </div>
                  <div className="admin-actions">
                    {row.status !== 'accepted' ? (
                      <button type="button" className="btn btn-sm btn-emerald" onClick={() => patch(`/admin/sirah/${row._id}`, { status: 'accepted' })}>Approve</button>
                    ) : null}
                    {row.status !== 'rejected' ? (
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(`/admin/sirah/${row._id}`, { status: 'rejected' })}>Reject</button>
                    ) : (
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(`/admin/sirah/${row._id}`, { status: 'pending_review' })}>Reopen</button>
                    )}
                  </div>
                </div>
              )) : null}

              {user?.role === 'admin' || user?.role === 'moderator' ? (
                <form
                  className="form-card"
                  style={{ margin: '24px 0 0', maxWidth: 'none' }}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    try {
                      await api('/admin/sirah-updates', {
                        method: 'POST',
                        body: { title: form.title.value.trim(), body: form.body.value.trim() }
                      });
                      form.reset();
                      showToast('Update posted.');
                      load('sirah');
                    } catch (err) {
                      showToast(err.message, true);
                    }
                  }}
                >
                  <h3 style={{ color: '#F8FAFC', marginBottom: 12 }}>Optional event note</h3>
                  <input name="title" className="form-control" required placeholder="Title (e.g. Venue confirmed)" />
                  <textarea name="body" className="form-control" required placeholder="Internal note for the team" rows={3} />
                  <button className="btn btn-navy" type="submit">Save note</button>
                </form>
              ) : null}
              {sirahUpdates.length ? (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ marginBottom: 8 }}>Posted notes</h4>
                  {sirahUpdates.map((item) => (
                    <div key={item._id} className="admin-meta" style={{ marginBottom: 8 }}>
                      <strong>{item.title}</strong> — {item.body}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            );
          })() : null}

          {tab === 'enrollments' && Array.isArray(rows) ? (
            <div className="admin-table-wrap">
              <p className="admin-help">Students enrolled in Islamic courses. Open Content → Courses to edit a course and see the same list under each class.</p>
              {rows.map((row) => (
                <div key={row._id} className="admin-row">
                  <div>
                    <strong>{row.fullName}</strong> · {row.email}
                    <div className="admin-meta">{row.course?.title} · {row.departmentSemester} · enrolled {fmt(row.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'notes' && Array.isArray(rows) ? (
            <div className="admin-table-wrap">
              {rows.map((row) => (
                <div key={row._id} className="admin-row">
                  <div>
                    <strong>{row.courseTitle}</strong> · {row.email || 'no email'}
                    <div className="admin-meta">{row.name} · {row.handled ? 'handled' : 'new'}</div>
                  </div>
                  {!row.handled ? (
                    <button type="button" className="btn btn-sm btn-navy" onClick={() => patch(`/admin/notes/${row._id}`, {})}>Mark sent</button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'magazine' && Array.isArray(rows) ? (
            <div className="admin-table-wrap">
              <p className="admin-help">Public writing submissions (blog or magazine). Publish on the website, accept for An-Noor, or reject.</p>
              {rows.map((row) => (
                <div key={row._id} className="admin-row">
                  <div>
                    <strong>{row.title}</strong> · {row.authorName} · {row.kind || 'magazine'} · {row.status}
                    <p className="admin-meta">{row.abstract}</p>
                    {row.publishedSlug ? <p className="admin-meta">Live: /blogs/{row.publishedSlug}</p> : null}
                  </div>
                  <div className="admin-actions">
                    {row.status !== 'published' ? (
                      <button type="button" className="btn btn-sm btn-emerald" onClick={() => patch(`/admin/magazine-submissions/${row._id}`, { publishAsBlog: true })}>Publish on blog</button>
                    ) : null}
                    <button type="button" className="btn btn-sm btn-gold" onClick={() => patch(`/admin/magazine-submissions/${row._id}`, { status: 'accepted', reviewNote: 'Accepted for the next issue.' })}>Keep for magazine</button>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(`/admin/magazine-submissions/${row._id}`, { status: 'rejected', reviewNote: 'Not selected this round.' })}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'blogs' && Array.isArray(rows) ? (
            <div className="admin-table-wrap">
              {rows.map((row) => (
                <div key={row._id} className="admin-row">
                  <div>
                    <strong>{row.title}</strong> · {row.status}
                    <div className="admin-meta">{row.author?.name} · {row.bloggerId} · {row.slug}</div>
                    <p className="admin-meta">{String(row.body || '').slice(0, 220)}</p>
                  </div>
                  <div className="admin-actions">
                    {row.status === 'pending_review' ? (
                      <>
                        <button type="button" className="btn btn-sm btn-emerald" onClick={() => patch(`/admin/blogs/${row._id}`, { status: 'published' })}>Publish</button>
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(`/admin/blogs/${row._id}`, { status: 'rejected', reviewNote: 'Please revise and resubmit.' })}>Reject</button>
                      </>
                    ) : row.status === 'published' ? (
                      <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(`/admin/blogs/${row._id}`, { status: 'rejected', reviewNote: 'Unpublished by MUIS.' })}>Unpublish</button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'users' && Array.isArray(rows) ? (
            <div className="admin-table-wrap">
              {rows.map((row) => (
                <div key={row._id} className="admin-row">
                  <div>
                    <strong>{row.name}</strong> · {row.email} · {row.role}
                    <div className="admin-meta">Member: {row.memberStatus || 'none'} · {row.frozen ? 'frozen' : 'active'}</div>
                  </div>
                  <div className="admin-actions">
                    <button type="button" className="btn btn-sm btn-emerald" onClick={() => patch(`/admin/users/${row._id}`, { memberStatus: 'approved' })}>Mark member</button>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => patch(`/admin/users/${row._id}`, { frozen: !row.frozen })}>{row.frozen ? 'Unfreeze' : 'Freeze'}</button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'content' ? <AdminContentPanel isAdmin={user?.role === 'admin'} /> : null}
        </div>
      </section>
    </div>
  );
}
