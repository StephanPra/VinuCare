import { useState, useEffect } from 'react';
import '../../styles/auth.css';
import '../../styles/profile.css';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { API_BASE_URL } from '../../config/api';

export default function Profile({ onNavigate, setUser }) {
  const { success: notifySuccess, error: notifyError } = useUIFeedback();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const loggedIn = !!localStorage.getItem('user');

  useEffect(() => {
    if (!loggedIn) { onNavigate('login'); return; }
    fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load profile');
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
      })
      .catch(() => setLoadError('Could not load your profile. Please try again.'))
      .finally(() => setLoading(false));
  }, [loggedIn, onNavigate]);

  useEffect(() => {
    if (!loggedIn) return;
    Promise.all([
      fetch(`${API_BASE_URL}/api/appointments/my`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : [])),
      fetch(`${API_BASE_URL}/api/orders/my`, { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([appts, ords]) => {
        setAppointments(Array.isArray(appts) ? appts : []);
        setOrders(Array.isArray(ords) ? ords : []);
      })
      .catch(() => { /* history is supplementary — a failed fetch just leaves the lists empty */ })
      .finally(() => setHistoryLoading(false));
  }, [loggedIn]);

  const cancelEdit = () => {
    setName(profile.name || '');
    setPhone(profile.phone || '');
    setEditing(false);
  };

  const saveProfile = async () => {
    if (!name.trim()) { notifyError('Name is required'); return; }
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) { notifyError(data.message || 'Could not save changes'); return; }

      setProfile(data);
      setEditing(false);

      // Keep the nav/localStorage user in sync too — the name shown in
      // the nav dropdown and greeting elsewhere is read from there, not
      // re-fetched from the server.
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...stored, name: data.name };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);

      notifySuccess('Profile updated');
    } catch {
      notifyError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) { notifyError('Fill in both password fields'); return; }
    if (newPassword.length < 6) { notifyError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { notifyError('New passwords do not match'); return; }

    setSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me/password`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { notifyError(data.message || 'Could not change password'); return; }

      notifySuccess('Password changed successfully');
      setShowPasswordForm(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch {
      notifyError('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div id="page-profile" className="page active">
        <div className="profile-wrap"><p>Loading your profile…</p></div>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div id="page-profile" className="page active">
        <div className="profile-wrap"><p className="auth-api-error">{loadError || 'Profile unavailable.'}</p></div>
      </div>
    );
  }

  const initials = (profile.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Combine both payable sources (appointment fees + shop orders) into one
  // timeline. Falls back to createdAt when nothing has been paid yet, so
  // pending items still sort sensibly alongside paid ones.
  const paymentHistory = [
    ...appointments
      .filter((a) => a.amount != null)
      .map((a) => ({
        id: a.id,
        type: 'Appointment',
        label: a.service,
        amount: a.amount,
        status: a.paymentStatus,
        method: a.paymentMethod,
        date: a.paidAt || a.createdAt,
      })),
    ...orders.map((o) => ({
      id: o.id,
      type: 'Shop Order',
      label: `Order #${o.id}`,
      amount: o.total,
      status: o.paymentStatus,
      method: o.paymentMethod,
      date: o.paidAt || o.createdAt,
    })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  return (
    <div id="page-profile" className="page active">
      <div className="profile-wrap">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">{initials}</div>
            <div>
              <h1>{profile.name}</h1>
              <span className={`profile-role-badge role-${(profile.role || 'customer').toLowerCase()}`}>
                {profile.role || 'Customer'}
              </span>
            </div>
          </div>

          <div className="profile-layout">
            <div className="profile-col profile-col-left">
              <div className="profile-section">
                <div className="profile-section-head">
                  <h2>Account Information</h2>
                  {!editing && (
                    <button className="auth-link-btn" onClick={() => setEditing(true)}>Edit</button>
                  )}
                </div>

                {!editing ? (
                  <div className="profile-info-list">
                    <div className="profile-info-row"><span>Full Name</span><strong>{profile.name}</strong></div>
                    <div className="profile-info-row"><span>Email</span><strong>{profile.email}</strong></div>
                    <div className="profile-info-row"><span>Phone</span><strong>{profile.phone || '—'}</strong></div>
                    <div className="profile-info-row"><span>Role</span><strong>{profile.role || 'Customer'}</strong></div>
                    {profile.created_at && (
                      <div className="profile-info-row">
                        <span>Member Since</span>
                        <strong>{new Date(profile.created_at).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="profile-edit-form">
                    <div className="auth-field">
                      <label>Full Name</label>
                      <input className="auth-input" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="auth-field">
                      <label>Phone Number</label>
                      <input className="auth-input" placeholder="+94 77 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="auth-field">
                      <label>Email Address</label>
                      <input className="auth-input" value={profile.email} disabled />
                      <span className="profile-field-hint">Email can't be changed here — contact support if needed.</span>
                    </div>
                    <div className="profile-form-actions">
                      <button className="auth-btn-primary" onClick={saveProfile} disabled={savingProfile}>
                        {savingProfile ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button className="auth-link-btn" onClick={cancelEdit} disabled={savingProfile}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-section">
                <div className="profile-section-head">
                  <h2>Password</h2>
                  {!showPasswordForm && (
                    <button className="auth-link-btn" onClick={() => setShowPasswordForm(true)}>Change Password</button>
                  )}
                </div>

                {showPasswordForm && (
                  <div className="profile-edit-form">
                    <div className="auth-field">
                      <label>Current Password</label>
                      <input className="auth-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </div>
                    <div className="auth-field">
                      <label>New Password</label>
                      <input className="auth-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="auth-field">
                      <label>Confirm New Password</label>
                      <input className="auth-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <div className="profile-form-actions">
                      <button className="auth-btn-primary" onClick={savePassword} disabled={savingPassword}>
                        {savingPassword ? 'Updating…' : 'Update Password'}
                      </button>
                      <button
                        className="auth-link-btn"
                        disabled={savingPassword}
                        onClick={() => {
                          setShowPasswordForm(false);
                          setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button className="profile-back-btn" onClick={() => onNavigate('home')}>← Back to VinuCare</button>
            </div>

            <div className="profile-col profile-col-right">
              <div className="profile-section">
                <div className="profile-section-head">
                  <h2>Booking History</h2>
                </div>
                {historyLoading ? (
                  <p className="profile-history-empty">Loading your bookings…</p>
                ) : appointments.length === 0 ? (
                  <p className="profile-history-empty">You haven't booked an appointment yet.</p>
                ) : (
                  <div className="profile-history-list">
                    {appointments.map((a) => (
                      <div className="profile-history-item" key={a.id}>
                        <div className="profile-history-main">
                          <strong>{a.service}</strong>
                          <span className="profile-history-sub">
                            {a.petName ? `${a.petName} · ` : ''}
                            {a.doctorName ? `Dr. ${a.doctorName}` : 'No doctor preference'}
                          </span>
                          <span className="profile-history-sub">
                            {a.apptDate}{a.apptTime ? ` at ${a.apptTime}` : ''} · Ref: {a.referenceNumber}
                          </span>
                          {(a.doctorPhone || a.doctorEmail) && (
                            <span className="profile-history-sub profile-history-contact">
                              Contact Dr. {a.doctorName}:
                              {a.doctorPhone && <a href={`tel:${a.doctorPhone}`}> {a.doctorPhone}</a>}
                              {a.doctorPhone && a.doctorEmail && ' · '}
                              {a.doctorEmail && <a href={`mailto:${a.doctorEmail}`}>{a.doctorEmail}</a>}
                            </span>
                          )}
                        </div>
                        <div className="profile-history-side">
                          <span className={`profile-status-badge status-${(a.status || 'pending').toLowerCase()}`}>
                            {a.status || 'Pending'}
                          </span>
                          {a.amount != null && (
                            <span className="profile-history-amount">Rs. {Number(a.amount).toLocaleString('en-LK')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="profile-section">
                <div className="profile-section-head">
                  <h2>Payment History</h2>
                </div>
                {historyLoading ? (
                  <p className="profile-history-empty">Loading your payments…</p>
                ) : paymentHistory.length === 0 ? (
                  <p className="profile-history-empty">No payments yet.</p>
                ) : (
                  <div className="profile-history-list">
                    {paymentHistory.map((p) => (
                      <div className="profile-history-item" key={`${p.type}-${p.id}`}>
                        <div className="profile-history-main">
                          <strong>{p.label}</strong>
                          <span className="profile-history-sub">
                            {p.type} · {p.date ? new Date(p.date).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                            {p.method ? ` · ${p.method}` : ''}
                          </span>
                        </div>
                        <div className="profile-history-side">
                          <span className={`profile-status-badge status-${(p.status || 'pending').toLowerCase()}`}>
                            {p.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                          <span className="profile-history-amount">Rs. {Number(p.amount || 0).toLocaleString('en-LK')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}