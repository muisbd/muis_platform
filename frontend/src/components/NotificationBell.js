'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { api } from '../lib/api.js';

function timeAgo(value) {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(value).toLocaleDateString();
}

export default function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);
  const [unread, setUnread] = useState(0);
  const box = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await api('/notifications');
      setList(data.list || []);
      setUnread(data.unread || 0);
    } catch {
      /* the bell simply stays empty */
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 120000);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [load, pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && unread) {
      setUnread(0);
      try {
        await api('/notifications/read', { method: 'POST', body: {} });
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="notif-bell" ref={box}>
      <button type="button" className="notif-bell-btn" aria-label={`Notifications${unread ? ` (${unread} new)` : ''}`} onClick={toggle}>
        <Bell />
        {unread ? <span className="notif-bell-count">{unread > 9 ? '9+' : unread}</span> : null}
      </button>
      {open ? (
        <div className="notif-menu">
          <div className="notif-menu-head">Notifications</div>
          {!list.length ? <p className="notif-empty">No notifications yet.</p> : null}
          {list.map((item) => (
            <button
              key={item._id}
              type="button"
              className={`notif-item${item.read ? '' : ' unread'}`}
              onClick={() => {
                setOpen(false);
                if (item.link) router.push(item.link);
              }}
            >
              <strong>{item.title}</strong>
              {item.body ? <span>{item.body}</span> : null}
              <em>{timeAgo(item.createdAt)}</em>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
