import { useState, useEffect } from 'react';
import { useUIFeedback } from '../../context/UIFeedbackContext';

const API_BASE = 'http://localhost:5000/api/admin/appointments';
const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

function badgeClass(status) {
  return 'admin-badge badge-' + status.toLowerCase();
}

export default function AdminAppointments() {
  const { confirm, success, error: notifyError } = useUIFeedback();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Failed to load appointments: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = appointments.filter(a => {
    const matchesQuery = (a.petName + a.ownerName + a.service).toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  async function updateStatus(id, status) {
    const prev = appointments;
    setAppointments(cur => cur.map(a => (a.id === id ? { ...a, status } : a)));
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Server responded ' + res.status);
    } catch (err) {
      console.error('Failed to update status:', err);
      notifyError('Failed to update status: ' + err.message);
      setAppointments(prev); // revert on failure
    }
  }

  async function handleDelete(id) {
    const ok = await confirm({
      title: 'Remove appointment?',
      message: 'Remove this appointment record? This cannot be undone.',
      confirmLabel: 'Remove',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setAppointments(prev => prev.filter(a => a.id !== id));
      success('Appointment removed.');
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      notifyError('Failed to delete appointment: ' + err.message);
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Appointments</h1>
          <p>Confirm, reassign, or cancel bookings coming in from the appointments page.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <input
            className="admin-search"
            placeholder="Search by pet, owner, or service…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading && <div className="admin-empty">Loading appointments…</div>}
        {error && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div>}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pet / Owner</th>
                  <th>Service</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="admin-cell-main">🐾 {a.petName}</div>
                      <div className="admin-cell-sub">{a.ownerName}</div>
                    </td>
                    <td>{a.service}</td>
                    <td>{a.doctor || '—'}</td>
                    <td>{a.date}<div className="admin-cell-sub">{a.time}</div></td>
                    <td><span className={badgeClass(a.status)}>{a.status}</span></td>
                    <td>
                      <div className="admin-table-actions">
                        <select
                          className="admin-select"
                          value={a.status}
                          onChange={e => updateStatus(a.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(a.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="admin-empty">No appointments match that search.</div>}
          </div>
        )}
      </div>
    </>
  );
}