import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
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
const METHOD_LABELS = { payhere: 'PayHere', cod: 'Cash on Delivery', unknown: 'Other' };

function money(n) {
  return 'Rs. ' + Number(n || 0).toLocaleString('en-LK');
}

function shortDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-LK', { day: 'numeric', month: 'short' });
}

// Shared look for every chart on this page — glass tooltip card, muted
// axis text, no tick marks — so Recharts' defaults (black text, hairline
// axes, plain white tooltip box) don't clash with the frosted admin theme
// used everywhere else in the dashboard.
const tooltipProps = {
  contentStyle: {
    background: 'var(--admin-card)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid var(--admin-border)',
    borderRadius: 12,
    boxShadow: '0 12px 32px rgba(55,48,163,0.16)',
    fontSize: 13,
    padding: '10px 14px',
  },
  labelStyle: { color: 'var(--admin-muted)', fontWeight: 700, marginBottom: 4 },
  itemStyle: { color: 'var(--admin-ink)' },
};
const axisTick = { fill: 'var(--admin-muted)', fontSize: 12 };
const axisLine = { stroke: 'var(--admin-border)' };

function ChartCard({ title, dotColor, badge, children }) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2><span className="admin-chart-dot" style={{ background: dotColor }} />{title}</h2>
        {badge}
      </div>
      {children}
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pulse, setPulse] = useState(false);

  const loadAnalytics = useCallback(() => {
    fetch(`${API_BASE}/api/admin/analytics`, { credentials: 'include' })
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

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Analytics {pulse && <span className="admin-live-dot" title="Live update received" />}</h1>
          <p>Revenue and booking trends, updating live as payments and bookings come in.</p>
        </div>
      </div>

      {loading && <div className="admin-empty">Loading analytics…</div>}
      {error && <div className="admin-empty" style={{ color: 'var(--admin-rose-text)' }}>Failed to load analytics: {error}</div>}

      {!loading && !error && data && (() => {
        const totalRevenue14d = data.revenueByDay.reduce((sum, d) => sum + d.revenue, 0);
        const avgDailyRevenue = totalRevenue14d / 14;
        const totalAppointments = data.appointmentsByStatus.reduce((sum, s) => sum + s.count, 0);
        const completedCount = data.appointmentsByStatus.find((s) => s.status === 'Completed')?.count || 0;
        const completionRate = totalAppointments ? Math.round((completedCount / totalAppointments) * 100) : 0;
        const methodData = (data.revenueByMethod || []).map((m) => ({
          ...m,
          label: METHOD_LABELS[m.method] || m.method,
        }));

        return (
          <>
            <div className="admin-stat-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-label">Total Revenue</div>
                <div className="admin-stat-value">{money(totalRevenue14d)}</div>
                <div className="admin-stat-sub up">Last 14 days</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Avg Daily Revenue</div>
                <div className="admin-stat-value">{money(avgDailyRevenue)}</div>
                <div className="admin-stat-sub">Per day, last 14 days</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Total Appointments</div>
                <div className="admin-stat-value">{totalAppointments}</div>
                <div className="admin-stat-sub">All-time bookings</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">Completion Rate</div>
                <div className="admin-stat-value">{completionRate}%</div>
                <div className={`admin-stat-sub ${completionRate >= 50 ? 'up' : 'down'}`}>{completedCount} completed</div>
              </div>
            </div>

            <ChartCard
              title="Revenue — last 14 days"
              dotColor="var(--admin-indigo)"
              badge={<span className="admin-analytics-total">{money(totalRevenue14d)} total</span>}
            >
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.revenueByDay}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--admin-indigo)" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="var(--admin-indigo)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--admin-border)" />
                  <XAxis dataKey="date" tickFormatter={shortDate} tick={axisTick} axisLine={axisLine} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip {...tooltipProps} formatter={(v) => money(v)} labelFormatter={shortDate} cursor={{ stroke: 'var(--admin-indigo)', strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--admin-indigo)" strokeWidth={2.5} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="admin-analytics-grid">
              <ChartCard title="Revenue by service" dotColor="var(--admin-teal)">
                {data.revenueByService.length === 0 ? (
                  <div className="admin-empty">No paid appointments yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.revenueByService} layout="vertical" margin={{ left: 24 }}>
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--admin-border)" />
                      <XAxis type="number" tick={axisTick} axisLine={axisLine} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <YAxis type="category" dataKey="service" tick={{ ...axisTick, fontSize: 11 }} axisLine={axisLine} tickLine={false} width={140} />
                      <Tooltip {...tooltipProps} formatter={(v) => money(v)} cursor={{ fill: 'rgba(15,118,110,0.08)' }} />
                      <Bar dataKey="revenue" fill="var(--admin-teal)" radius={[0, 6, 6, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Appointments by status" dotColor="var(--admin-indigo)">
                {data.appointmentsByStatus.length === 0 ? (
                  <div className="admin-empty">No appointments yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={data.appointmentsByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="46%"
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={2}
                      >
                        {data.appointmentsByStatus.map((entry, i) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_COLORS[entry.status] || PIE_FALLBACK_COLORS[i % PIE_FALLBACK_COLORS.length]}
                            stroke="var(--white)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipProps} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span style={{ color: 'var(--admin-ink)', fontSize: 12 }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Top products" dotColor="var(--admin-gold)">
                {data.topProducts.length === 0 ? (
                  <div className="admin-empty">No paid orders yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.topProducts}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--admin-border)" />
                      <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 10 }} axisLine={axisLine} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip {...tooltipProps} formatter={(v) => money(v)} cursor={{ fill: 'rgba(180,83,9,0.08)' }} />
                      <Bar dataKey="revenue" fill="var(--admin-gold)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Appointments by doctor" dotColor="var(--admin-indigo)">
                {data.appointmentsByDoctor.length === 0 ? (
                  <div className="admin-empty">No doctor-assigned appointments yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.appointmentsByDoctor}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--admin-border)" />
                      <XAxis dataKey="doctor" tick={{ ...axisTick, fontSize: 11 }} axisLine={axisLine} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip {...tooltipProps} cursor={{ fill: 'rgba(55,48,163,0.08)' }} />
                      <Bar dataKey="appointments" fill="var(--admin-indigo)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Revenue by payment method" dotColor="var(--admin-rose)">
                {methodData.length === 0 ? (
                  <div className="admin-empty">No paid transactions yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={methodData} layout="vertical" margin={{ left: 12 }}>
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--admin-border)" />
                      <XAxis type="number" tick={axisTick} axisLine={axisLine} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <YAxis type="category" dataKey="label" tick={axisTick} axisLine={axisLine} tickLine={false} width={110} />
                      <Tooltip {...tooltipProps} formatter={(v) => money(v)} cursor={{ fill: 'rgba(185,28,28,0.08)' }} />
                      <Bar dataKey="revenue" fill="var(--admin-rose)" radius={[0, 6, 6, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>
          </>
        );
      })()}
    </>
  );
}
