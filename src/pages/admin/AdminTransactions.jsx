import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';

const API_BASE = `${API_BASE_URL}/api/admin/transactions`;
const STATUS_OPTIONS = ['Paid', 'Pending', 'Failed', 'Refunded'];
const TYPE_OPTIONS = ['Appointment', 'Product'];

function badgeClass(status) {
  return 'admin-badge badge-' + status.toLowerCase();
}
function money(n) {
  return 'Rs. ' + Number(n).toLocaleString('en-LK');
}

export default function AdminTransactions() {
  // Transactions are a financial record, so this view is read-only by
  // design — no edit/delete here. If you need to correct a mistaken
  // charge, that should go through a proper refund flow on the backend
  // rather than editing the row directly.
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError('Failed to load transactions: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = transactions.filter(t => {
    const matchesQuery = (t.customer + t.reference + t.id).toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesQuery && matchesStatus && matchesType;
  });

  const totalShown = filtered.filter(t => t.status === 'Paid').reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Transaction History</h1>
          <p>Payments made through the website for appointments and shop orders.</p>
        </div>
      </div>

      <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 20 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Paid (filtered view)</div>
          <div className="admin-stat-value">{money(totalShown)}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Transactions shown</div>
          <div className="admin-stat-value">{filtered.length}</div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <input
            className="admin-search"
            placeholder="Search by customer or reference…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="admin-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All types</option>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading && <div className="admin-empty">Loading transactions…</div>}
        {error && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div>}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className="admin-cell-main">T-{t.id}</div>
                      <div className="admin-cell-sub">{t.date}</div>
                    </td>
                    <td>{t.customer || '—'}</td>
                    <td>{t.type}</td>
                    <td>{t.reference}</td>
                    <td>{t.method}</td>
                    <td>{money(t.amount)}</td>
                    <td><span className={badgeClass(t.status)}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="admin-empty">No transactions match that search.</div>}
          </div>
        )}
      </div>
    </>
  );
}