import { useState, useEffect, useRef } from 'react';
import { getAdminSocket } from '../../lib/adminSocket';
import { BellIcon } from '../ui/Icons';
import { API_BASE_URL } from '../../config/api';

const API_BASE = `${API_BASE_URL}/api/admin/error-logs`;

function formatTime(iso) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' });
}

export default function NotificationBell() {
  const [errors, setErrors] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    fetch(API_BASE, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setErrors(data);
        setUnreadCount(data.filter((e) => !e.readAt).length);
      })
      .catch(() => {});

    const socket = getAdminSocket();
    const handleNew = (entry) => {
      setErrors((prev) => [entry, ...prev].slice(0, 200));
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('error:new', handleNew);
    return () => socket.off('error:new', handleNew);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleOpen = () => {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      fetch(`${API_BASE}/mark-read`, { method: 'POST', credentials: 'include' }).catch(() => {});
      setErrors((prev) => prev.map((e) => (e.readAt ? e : { ...e, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    }
  };

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={toggleOpen}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="System error notifications"
      >
        <BellIcon size={19} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-head">System Errors</div>
          {errors.length === 0 ? (
            <div className="notif-empty">No errors — all clear.</div>
          ) : (
            <div className="notif-list">
              {errors.slice(0, 20).map((e) => (
                <div key={e.id} className={`notif-item ${!e.readAt ? 'unread' : ''}`}>
                  <div className="notif-item-msg">{e.message}</div>
                  <div className="notif-item-time">{formatTime(e.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
