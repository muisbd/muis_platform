'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BellRing, Search, Download, Trash2 } from 'lucide-react';
import CertificateNameEditor from './CertificateNameEditor.js';
import { api } from '../lib/api.js';
import { enablePush } from '../lib/pwa.js';
import { showToast } from '../utils/toast.js';

const CHECK_BADGE = {
  verified: { label: 'Phone verified', cls: 'cert-check-verified' },
  unclear: { label: 'Found, needs a check', cls: 'cert-check-unclear' },
  close: { label: 'Close number found', cls: 'cert-check-close' },
  not_found: { label: 'Phone not found', cls: 'cert-check-none' }
};

const VIA_LABEL = { website: 'Website', booth: 'Booth (notebook)', not_sure: 'Not sure' };

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(rows) {
  const headers = ['Name', 'Type', 'University', 'Student ID', 'Department', 'Batch', 'Came with', 'Phone', 'Phone check', 'Registered via', 'Email', 'Status', 'Sent'];
  const lines = [headers.join(','), ...rows.map((r) => [
    r.certName, r.attendeeType, r.university, r.studentId, r.department, r.batch, r.guestNote, r.phone,
    CHECK_BADGE[r.check?.status]?.label, VIA_LABEL[r.registeredVia], r.email, r.status,
    r.createdAt ? new Date(r.createdAt).toISOString() : ''
  ].map(csvCell).join(','))];
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'seerah-2026-certificates.csv';
  link.click();
  URL.revokeObjectURL(url);
}

/** Shows a phone number with the digits that differ from `other` highlighted. */
function DiffNumber({ value, diff }) {
  return (
    <span className="cert-diff">
      {value.split('').map((d, i) => <span key={i} className={diff.includes(i) ? 'cert-diff-bad' : ''}>{d}</span>)}
    </span>
  );
}

function PhoneCheck({ row }) {
  const c = row.check || {};
  return (
    <div className="cert-check-detail">
      {c.status === 'close' ? c.close.map((m) => (
        <div key={m.phone}>
          User wrote <DiffNumber value={row.phone} diff={m.diff} /> · list has <DiffNumber value={m.phone} diff={m.diff} /> <em>({m.sources.join(', ')})</em>
        </div>
      )) : null}
      {(c.status === 'verified' || c.status === 'unclear') && c.sources?.length ? <div>Found in: {c.sources.join(', ')}</div> : null}
      {row.sharedPhone ? <div className="cert-warn">Another request uses the same phone number.</div> : null}
      {row.sharedStudentId ? <div className="cert-warn">Another request uses the same student ID.</div> : null}
    </div>
  );
}

function SettingsBar({ settings, onChange }) {
  const [pushBusy, setPushBusy] = useState(false);
  return (
    <div className="cert-admin-settings">
      <div className="cert-admin-toggle">
        <div>
          <strong>Seerah registration</strong>
          <span className={settings.registrationOpen ? 'cert-on' : 'cert-off'}>{settings.registrationOpen ? 'Open' : 'Closed'}</span>
        </div>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => onChange({ registrationOpen: !settings.registrationOpen })}>
          {settings.registrationOpen ? 'Close registration' : 'Open registration'}
        </button>
      </div>
      <div className="cert-admin-toggle">
        <div>
          <strong>Certificate requests</strong>
          <span className={settings.requestsOpen ? 'cert-on' : 'cert-off'}>{settings.requestsOpen ? 'Open' : 'Closed'}</span>
        </div>
        <button type="button" className="btn btn-sm btn-outline" onClick={() => onChange({ requestsOpen: !settings.requestsOpen })}>
          {settings.requestsOpen ? 'Stop new requests' : 'Allow requests'}
        </button>
      </div>
      <div className="cert-admin-toggle">
        <div>
          <strong>New request alerts</strong>
          <span className="cert-muted">on this phone or computer</span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={pushBusy}
          onClick={async () => {
            setPushBusy(true);
            try {
              await enablePush();
              showToast('You will get an alert here for new requests.');
            } catch (err) {
              showToast(err.message, true);
            } finally {
              setPushBusy(false);
            }
          }}
        >
          <BellRing /> Turn on alerts
        </button>
      </div>
    </div>
  );
}

function RosterPanel() {
  const [list, setList] = useState(null);
  const [text, setText] = useState('');
  const [source, setSource] = useState('booth');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setList((await api('/seerah-admin/roster')).list || []);
    } catch (err) {
      showToast(err.message, true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    setBusy(true);
    try {
      const data = await api('/seerah-admin/roster', { method: 'POST', body: { text, source } });
      showToast(data.message);
      if (data.skipped?.length) showToast(`Skipped: ${data.skipped.join(', ')}`, true);
      setText('');
      load();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  const shown = (list || []).filter((r) => !query || r.phone.includes(query.replace(/\D/g, '')));

  return (
    <div className="cert-roster">
      <p className="admin-help">
        These numbers are used to check requests automatically. {list ? <strong>{list.length} numbers</strong> : null} ·
        {' '}{list ? list.filter((r) => r.unclear).length : 0} marked unclear.
      </p>
      <div className="form-group">
        <label>Add numbers (paste one per line, any format)</label>
        <textarea className="form-control" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder={'01712345678\n+880 1812-345678'} />
      </div>
      <div className="cert-editor-row">
        <select className="form-control cert-roster-source" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="booth">Booth list</option>
          <option value="whatsapp">WhatsApp group</option>
        </select>
        <button type="button" className="btn btn-sm btn-emerald" disabled={busy || !text.trim()} onClick={add}>Add numbers</button>
      </div>
      <div className="input-with-icon" style={{ margin: '14px 0' }}>
        <Search className="input-icon" />
        <input className="form-control" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a number" />
      </div>
      <div className="cert-roster-list">
        {shown.map((r) => (
          <div key={r._id} className="cert-roster-item">
            <span className="cert-roster-phone">{r.phone}</span>
            <span className="admin-meta">{r.source === 'whatsapp' ? 'WhatsApp' : 'Booth'}</span>
            <label className="cert-roster-unclear">
              <input
                type="checkbox"
                checked={r.unclear}
                onChange={async (e) => {
                  try {
                    await api(`/seerah-admin/roster/${r._id}`, { method: 'PATCH', body: { unclear: e.target.checked } });
                    load();
                  } catch (err) {
                    showToast(err.message, true);
                  }
                }}
              />
              unclear
            </label>
            <button
              type="button"
              className="cert-icon-btn"
              aria-label={`Remove ${r.phone}`}
              onClick={async () => {
                if (!window.confirm(`Remove ${r.phone} from the list?`)) return;
                try {
                  await api(`/seerah-admin/roster/${r._id}`, { method: 'DELETE' });
                  load();
                } catch (err) {
                  showToast(err.message, true);
                }
              }}
            >
              <Trash2 />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminSeerahCertificates() {
  const [settings, setSettings] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [checkFilter, setCheckFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [panel, setPanel] = useState('');
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([api('/seerah-admin/settings'), api('/seerah-admin/requests')]);
      setSettings(s);
      setRows(r.list || []);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveSettings = async (patch) => {
    try {
      const data = await api('/seerah-admin/settings', { method: 'PUT', body: patch });
      setSettings(data);
      showToast(data.message || 'Saved.');
      return true;
    } catch (err) {
      showToast(err.message, true);
      return false;
    }
  };

  const act = async (row, action) => {
    let note = '';
    if (action === 'reject' || action === 'revoke') {
      const input = window.prompt(
        action === 'reject'
          ? `Why are you rejecting ${row.certName}? (they will see this)`
          : `Why are you revoking ${row.certName}'s certificate? (they will see this)`,
        action === 'reject' ? 'We could not find you in our attendance list. Please check your phone number and details.' : ''
      );
      if (input === null) return;
      note = input;
    }
    try {
      const data = await api(`/seerah-admin/requests/${row._id}`, { method: 'PATCH', body: { action, note } });
      showToast(data.message);
      load();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const approveSelected = async () => {
    if (!selected.size) return;
    if (!window.confirm(`Approve ${selected.size} certificate${selected.size === 1 ? '' : 's'}?`)) return;
    setBusy(true);
    try {
      const data = await api('/seerah-admin/requests/bulk-approve', { method: 'POST', body: { ids: [...selected] } });
      showToast(data.message);
      setSelected(new Set());
      load();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, revoked: 0, all: rows.length };
    rows.forEach((r) => { c[r.status] += 1; });
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (typeFilter !== 'all' && r.attendeeType !== typeFilter) return false;
      const cs = r.check?.status;
      if (checkFilter === 'verified' && cs !== 'verified') return false;
      if (checkFilter === 'check' && cs !== 'unclear' && cs !== 'close') return false;
      if (checkFilter === 'not_found' && cs !== 'not_found') return false;
      if (q && ![r.certName, r.phone, r.studentId, r.email, r.department].some((v) => String(v || '').toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, statusFilter, typeFilter, checkFilter, query]);

  const visiblePending = visible.filter((r) => r.status === 'pending');
  const toggle = (id) => setSelected((cur) => {
    const next = new Set(cur);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  if (loading && !settings) return <p>Loading…</p>;
  if (!settings) return null;

  return (
    <div className="admin-table-wrap cert-admin">
      <SettingsBar settings={settings} onChange={saveSettings} />

      <div className="cert-admin-panels">
        <button type="button" className={`tab-btn${panel === 'style' ? ' active' : ''}`} onClick={() => setPanel(panel === 'style' ? '' : 'style')}>
          Name position on certificate
        </button>
        <button type="button" className={`tab-btn${panel === 'roster' ? ' active' : ''}`} onClick={() => setPanel(panel === 'roster' ? '' : 'roster')}>
          Phone list (booth / WhatsApp)
        </button>
      </div>

      {panel === 'style' ? (
        <div className="cert-admin-box">
          <p className="admin-help">Move and resize the name for <strong>all</strong> certificates. Approved people see the change right away.</p>
          <CertificateNameEditor
            mode="shared"
            sharedStyle={settings.nameStyle}
            name={rows.reduce((longest, r) => (r.certName.length > longest.length ? r.certName : longest), '')}
            busy={busy}
            onSave={async (patch) => {
              setBusy(true);
              if (await saveSettings(patch)) setPanel('');
              setBusy(false);
            }}
            onCancel={() => setPanel('')}
          />
        </div>
      ) : null}

      {panel === 'roster' ? <div className="cert-admin-box"><RosterPanel /></div> : null}

      <p className="admin-help">
        People request a certificate after signing in. Their phone number is checked against the booth list, the WhatsApp group and website registrations.
        <strong> Nothing is approved automatically.</strong> You decide.
      </p>

      <div className="sirah-filter-row">
        {[
          ['pending', `Pending (${counts.pending})`],
          ['approved', `Approved (${counts.approved})`],
          ['rejected', `Rejected (${counts.rejected})`],
          ['revoked', `Revoked (${counts.revoked})`],
          ['all', `All (${counts.all})`]
        ].map(([id, label]) => (
          <button key={id} type="button" className={`tab-btn${statusFilter === id ? ' active' : ''}`} onClick={() => { setStatusFilter(id); setSelected(new Set()); }}>
            {label}
          </button>
        ))}
      </div>

      <div className="cert-admin-filters">
        <select className="form-control" value={checkFilter} onChange={(e) => setCheckFilter(e.target.value)}>
          <option value="all">Any phone check</option>
          <option value="verified">Phone verified</option>
          <option value="check">Needs a check (unclear / close)</option>
          <option value="not_found">Phone not found</option>
        </select>
        <select className="form-control" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">Students and guests</option>
          <option value="student">Students</option>
          <option value="guest">Guests / guardians</option>
        </select>
        <div className="input-with-icon">
          <Search className="input-icon" />
          <input className="form-control" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, ID" />
        </div>
      </div>

      <div className="cert-admin-bulk">
        <button
          type="button"
          className="btn btn-sm btn-outline"
          disabled={!visiblePending.length}
          onClick={() => setSelected(new Set(visiblePending.filter((r) => r.check?.status === 'verified').map((r) => r._id)))}
        >
          Select all phone-verified
        </button>
        <button type="button" className="btn btn-sm btn-outline" disabled={!visiblePending.length} onClick={() => setSelected(new Set(visiblePending.map((r) => r._id)))}>
          Select all pending shown
        </button>
        {selected.size ? <button type="button" className="btn btn-sm btn-outline" onClick={() => setSelected(new Set())}>Clear</button> : null}
        <button type="button" className="btn btn-sm btn-emerald" disabled={!selected.size || busy} onClick={approveSelected}>
          Approve selected ({selected.size})
        </button>
        <button type="button" className="btn btn-sm btn-outline" disabled={!visible.length} onClick={() => downloadCsv(visible)}>
          <Download /> CSV
        </button>
      </div>

      {!visible.length ? <p className="admin-meta">No requests in this list.</p> : null}

      {visible.map((row) => {
        const badge = CHECK_BADGE[row.check?.status] || CHECK_BADGE.not_found;
        const isGuest = row.attendeeType === 'guest';
        return (
          <div key={row._id} className={`admin-row cert-row${selected.has(row._id) ? ' selected' : ''}`}>
            {row.status === 'pending' ? (
              <input type="checkbox" className="cert-row-check" checked={selected.has(row._id)} onChange={() => toggle(row._id)} aria-label={`Select ${row.certName}`} />
            ) : null}
            <div className="cert-row-main">
              <div className="admin-row-title">
                <strong>{row.certName}</strong>
                <span className="admin-badge">{isGuest ? 'Guest' : 'Student'}</span>
                <span className={`admin-badge admin-badge-${row.status === 'revoked' ? 'rejected' : row.status}`}>{row.status}</span>
                <span className={`admin-badge ${badge.cls}`}>{badge.label}</span>
              </div>
              <div className="admin-meta">
                {isGuest
                  ? `Guest${row.guestNote ? ` · came with: ${row.guestNote}` : ''}`
                  : `${row.university} · ID ${row.studentId} · ${row.department} · Batch ${row.batch}`}
              </div>
              <div className="admin-meta">
                Phone <strong>{row.phone}</strong> · registered: {VIA_LABEL[row.registeredVia]} · {row.email}
                {row.submitCount > 1 ? ` · sent ${row.submitCount} times` : ''}
              </div>
              <PhoneCheck row={row} />
              {row.reviewNote ? <div className="admin-meta">Note to user: {row.reviewNote}</div> : null}
              {editing === row._id ? (
                <div className="cert-admin-box" style={{ marginTop: 12 }}>
                  <CertificateNameEditor
                    mode="person"
                    sharedStyle={settings.nameStyle}
                    personStyle={row.nameStyle}
                    name={row.certName}
                    busy={busy}
                    onCancel={() => setEditing(null)}
                    onSave={async (patch) => {
                      setBusy(true);
                      try {
                        const data = await api(`/seerah-admin/requests/${row._id}/name`, { method: 'PATCH', body: patch });
                        showToast(data.message);
                        setEditing(null);
                        load();
                      } catch (err) {
                        showToast(err.message, true);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </div>
              ) : null}
            </div>
            <div className="admin-actions">
              {row.status !== 'approved' ? (
                <button type="button" className="btn btn-sm btn-emerald" onClick={() => act(row, 'approve')}>Approve</button>
              ) : null}
              {row.status === 'pending' ? (
                <button type="button" className="btn btn-sm btn-outline" onClick={() => act(row, 'reject')}>Reject</button>
              ) : null}
              {row.status === 'approved' ? (
                <button type="button" className="btn btn-sm btn-outline" onClick={() => act(row, 'revoke')}>Revoke</button>
              ) : null}
              {row.status === 'rejected' || row.status === 'revoked' ? (
                <button type="button" className="btn btn-sm btn-outline" onClick={() => act(row, 'reopen')}>Back to pending</button>
              ) : null}
              <button type="button" className="btn btn-sm btn-outline" onClick={() => setEditing(editing === row._id ? null : row._id)}>
                {editing === row._id ? 'Close preview' : 'Preview / adjust name'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
