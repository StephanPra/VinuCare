import { useState, useEffect } from 'react';
import AdminUsers from './AdminUsers';
import AdminProducts from './AdminProducts';
import AdminAppointments from './AdminAppointments';
import AdminTransactions from './AdminTransactions';
import AdminAnalytics from './AdminAnalytics';
import AdminBanners from './AdminBanners';
import AdminScheduling from './AdminScheduling';
import AdminAuditLog from './AdminAuditLog';
import AdminHolidays from './AdminHolidays';
import AdminMessages from './AdminMessages';
import StaffSettings from '../../components/StaffSettings';
import { getAdminSocket } from '../../lib/adminSocket';
import { ChartIcon, TrendIcon, UserIcon, BoxIcon, CalendarIcon, CardIcon, ImageIcon, ChatIcon, SettingsIcon } from '../../components/ui/Icons';
import '../../styles/admin.css';
import vinuLogo from '../../assets/logo/vinucare-logo.png';
import { API_BASE_URL } from '../../config/api';

const API_BASE = API_BASE_URL;

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <ChartIcon size={17} /> },
  { id: 'analytics', label: 'Analytics', icon: <TrendIcon size={17} /> },
  { id: 'users', label: 'Users & Doctors', icon: <UserIcon size={17} /> },
  { id: 'products', label: 'Products', icon: <BoxIcon size={17} /> },
  { id: 'banners', label: 'Banners', icon: <ImageIcon size={17} /> },
  { id: 'appointments', label: 'Appointments', icon: <CalendarIcon size={17} /> },
  { id: 'scheduling', label: 'Doctor Scheduling', icon: <CalendarIcon size={17} /> },
  { id: 'holidays', label: 'Holidays', icon: <CalendarIcon size={17} /> },
  { id: 'transactions', label: 'Transactions', icon: <CardIcon size={17} /> },
  { id: 'auditlog', label: 'Audit Log', icon: <TrendIcon size={17} /> },
  { id: 'messages', label: 'Messages', icon: <ChatIcon size={17} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon size={17} /> },
];

// Turns a raw socket event into a one-line, human-readable feed entry.
function describeEvent(event, payload) {
  switch (event) {
    case 'appointment:new':
      return `New booking — ${payload.petName} (${payload.ownerName}) for ${payload.service}`;
    case 'appointment:statusChanged':
      return `Appointment #${payload.id} marked ${payload.status}`;
    case 'order:new':
      return `New order #${payload.id} — ${payload.itemCount} item(s), Rs. ${Number(payload.total).toLocaleString('en-LK')}`;
    case 'payment:completed':
      return `Payment received — Rs. ${payload.amount.toLocaleString('en-LK')} via ${payload.method}`;
    case 'message:new':
      return `New message from ${payload.staffName} (${payload.staffRole})`;
    default:
      return event;
  }
}

function money(n) {
  return 'Rs. ' + Number(n).toLocaleString('en-LK');
}

export default function AdminDashboard({ onNavigate, adminName = 'Admin', user, setUser }) {
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveFeed, setLiveFeed] = useState([]);
  const [lowStockJump, setLowStockJump] = useState(false);

  const loadSummary = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/admin/summary`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then(data => setSummary(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab !== 'overview') return;
    loadSummary();
  }, [tab]);

  // Live connection lives for the whole dashboard session (not just the
  // Overview tab) so the feed keeps building history even while you're
  // on another tab, and re-pulls the summary stats whenever something
  // that would change them happens — no manual refresh needed.
  useEffect(() => {
    const socket = getAdminSocket();

    const handleEvent = (event) => (payload) => {
      setLiveFeed((prev) => [
        { id: `${event}-${Date.now()}`, text: describeEvent(event, payload), time: new Date() },
        ...prev,
      ].slice(0, 20));
      loadSummary();
    };

    const handlers = {
      'appointment:new': handleEvent('appointment:new'),
      'appointment:statusChanged': handleEvent('appointment:statusChanged'),
      'order:new': handleEvent('order:new'),
      'payment:completed': handleEvent('payment:completed'),
      'message:new': handleEvent('message:new'),
    };

    Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn));
    return () => {
      Object.entries(handlers).forEach(([event, fn]) => socket.off(event, fn));
    };
  }, []);

  return (
    <div id="page-admin">
      <aside className="admin-sidebar">
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={vinuLogo} alt="" style={{ width: 22, height: 22, borderRadius: 6, display: 'block' }} /> VinuCare <span className="admin-brand-badge">ADMIN</span>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`admin-nav-btn ${tab === item.id ? 'active' : ''}`}
              onClick={() => { setLowStockJump(false); setTab(item.id); }}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          Signed in as<br /><strong style={{ color: '#fff' }}>{adminName}</strong>
          <button className="admin-exit-btn" onClick={() => onNavigate && onNavigate('home')}>
            ← Back to site
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'overview' && (
          <>
            <div className="admin-topbar">
              <div>
                <h1>Dashboard Overview</h1>
                <p>A quick snapshot of what's happening across VinuCare today.</p>
              </div>
            </div>

            {loading && <p>Loading summary…</p>}
            {error && <p style={{ color: 'red' }}>Failed to load summary: {error}</p>}

            {!loading && !error && summary && (
              <div className="admin-stat-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Total Revenue</div>
                  <div className="admin-stat-value">{money(summary.totalRevenue)}</div>
                  <div className="admin-stat-sub up">From paid transactions</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Pending Appointments</div>
                  <div className="admin-stat-value">{summary.pendingAppointments}</div>
                  <div className="admin-stat-sub">Awaiting confirmation</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Active Doctors</div>
                  <div className="admin-stat-value">{summary.activeDoctors}</div>
                  <div className="admin-stat-sub">Currently on roster</div>
                </div>
                <div
                  className="admin-stat-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setLowStockJump(true); setTab('products'); }}
                >
                  <div className="admin-stat-label">Low Stock Items</div>
                  <div className="admin-stat-value">{summary.lowStockProducts}</div>
                  <div className="admin-stat-sub down">10 units or fewer — click to restock</div>
                </div>
                <div
                  className="admin-stat-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { setLowStockJump(false); setTab('messages'); }}
                >
                  <div className="admin-stat-label">Unread Messages</div>
                  <div className="admin-stat-value">{summary.unreadMessages}</div>
                  <div className={`admin-stat-sub ${summary.unreadMessages > 0 ? 'down' : ''}`}>From doctors & nurses</div>
                </div>
              </div>
            )}

            <div className="admin-panel">
              <div className="admin-panel-head">
                <h2>Quick actions</h2>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="admin-btn admin-btn-primary" onClick={() => { setLowStockJump(false); setTab('users'); }}>+ Add Doctor / User</button>
                <button className="admin-btn admin-btn-outline" onClick={() => { setLowStockJump(false); setTab('products'); }}>+ Add Product</button>
                <button className="admin-btn admin-btn-outline" onClick={() => { setLowStockJump(false); setTab('appointments'); }}>Review Appointments</button>
                <button className="admin-btn admin-btn-outline" onClick={() => { setLowStockJump(false); setTab('transactions'); }}>View Transactions</button>
                <button className="admin-btn admin-btn-outline" onClick={() => { setLowStockJump(false); setTab('messages'); }}>View Messages</button>
                <button className="admin-btn admin-btn-outline" onClick={() => { setLowStockJump(false); setTab('scheduling'); }}>Doctor Scheduling</button>
                <button className="admin-btn admin-btn-outline" onClick={() => { setLowStockJump(false); setTab('holidays'); }}>Manage Holidays</button>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-head">
                <h2>Live activity <span className="admin-live-indicator" /></h2>
              </div>
              {liveFeed.length === 0 ? (
                <p style={{ color: 'var(--admin-muted)' }}>
                  Waiting for activity — new bookings, orders, and payments will appear here in real time.
                </p>
              ) : (
                <ul className="admin-live-feed">
                  {liveFeed.map((entry) => (
                    <li key={entry.id}>
                      <span>{entry.text}</span>
                      <time>{entry.time.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}</time>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {tab === 'analytics' && <AdminAnalytics />}
        {tab === 'users' && <AdminUsers />}
        {tab === 'products' && <AdminProducts initialLowStockOnly={lowStockJump} />}
        {tab === 'banners' && <AdminBanners />}
        {tab === 'appointments' && <AdminAppointments />}
        {tab === 'scheduling' && <AdminScheduling />}
        {tab === 'holidays' && <AdminHolidays />}
        {tab === 'transactions' && <AdminTransactions />}
        {tab === 'auditlog' && <AdminAuditLog />}
        {tab === 'messages' && <AdminMessages user={user} />}
        {tab === 'settings' && <StaffSettings user={user} setUser={setUser} />}
      </main>
    </div>
  );
}