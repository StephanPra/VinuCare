import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { getAdminSocket } from '../../lib/adminSocket';
import { API_BASE_URL } from '../../config/api';

const API_BASE = API_BASE_URL;

const STATUS_COLORS = {
  Pending: '#B45309',
  Confirmed: '#3730A3',
  Completed: '#0F766E',
  Cancelled: '#B91C1C',
};
const PIE_FALLBACK_COLORS = ['#3730A3', '#0F766E', '#B45309', '#B91C1C', '#7C3AED'];

function money(n) {
  return 'Rs. ' + Number(n || 0).toLocaleString('en-LK');
}

function shortDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-LK', { day: 'numeric', month: 'short' });
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pulse, setPulse] = useState(false);

  const loadAnalytics = useCallback(() => {
    fetch(`${API_BASE}/api/admin/analytics`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Re-pull the analytics whenever something happens that would change
  // the numbers — a payment coming in, a new appointment, or a new order.
  // This is what makes the dashboard feel "live" rather than a snapshot
  // that's stale the moment you load the page.
  useEffect(() => {
    const socket = getAdminSocket();
    const refresh = () => {
      loadAnalytics();
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
    };
    socket.on('payment:completed', refresh);
    socket.on('appointment:new', refresh);
    socket.on('appointment:statusChanged', refresh);
    socket.on('order:new', refresh);
    return () => {
      socket.off('payment:completed', refresh);
      socket.off('appointment:new', refresh);
      socket.off('appointment:statusChanged', refresh);
      socket.off('order:new', refresh);
    };
  }, [loadAnalytics]);

  if (loading) return <p>Loading analytics…</p>;
  if (error) return <p style={{ color: 'red' }}>Failed to load analytics: {error}</p>;
  if (!data) return null;

  const totalRevenue14d = data.revenueByDay.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Analytics {pulse && <span className="admin-live-dot" title="Live update received" />}</h1>
          <p>Revenue and booking trends, updating live as payments and bookings come in.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>Revenue — last 14 days</h2>
          <span className="admin-analytics-total">{money(totalRevenue14d)} total</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.revenueByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
            <XAxis dataKey="date" tickFormatter={shortDate} fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              formatter={(v) => money(v)}
              labelFormatter={shortDate}
            />
            <Line type="monotone" dataKey="revenue" stroke="var(--admin-indigo)" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="admin-analytics-grid">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Revenue by service</h2>
          </div>
          {data.revenueByService.length === 0 ? (
            <p style={{ color: 'var(--admin-muted)' }}>No paid appointments yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.revenueByService} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis type="number" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis type="category" dataKey="service" fontSize={11} width={140} />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="revenue" fill="var(--admin-teal)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Appointments by status</h2>
          </div>
          {data.appointmentsByStatus.length === 0 ? (
            <p style={{ color: 'var(--admin-muted)' }}>No appointments yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.appointmentsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {data.appointmentsByStatus.map((entry, i) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || PIE_FALLBACK_COLORS[i % PIE_FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Top products</h2>
          </div>
          {data.topProducts.length === 0 ? (
            <p style={{ color: 'var(--admin-muted)' }}>No paid orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis dataKey="name" fontSize={10} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="revenue" fill="var(--admin-gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Appointments by doctor</h2>
          </div>
          {data.appointmentsByDoctor.length === 0 ? (
            <p style={{ color: 'var(--admin-muted)' }}>No doctor-assigned appointments yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.appointmentsByDoctor}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis dataKey="doctor" fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="appointments" fill="var(--admin-indigo)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}