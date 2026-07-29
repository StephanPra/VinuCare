import { useState, useEffect } from 'react';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { API_BASE_URL } from '../../config/api';

const API_BASE = `${API_BASE_URL}/api/admin/products`;

// Nurse-facing stock intake — deliberately narrower than AdminProducts:
// no name/price/description editing, just visibility into stock levels
// and a way to record shipments coming in. Enforced server-side too
// (PUT/POST/DELETE /products are Admin-only; this only ever calls the
// stock-only PATCH endpoint).
export default function NurseProducts() {
  const { success, error: notifyError } = useUIFeedback();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [qtyById, setQtyById] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setProducts(await res.json());
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  async function addStock(id) {
    const delta = Number(qtyById[id]);
    if (!delta) return;
    try {
      const res = await fetch(`${API_BASE}/${id}/stock`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const updated = await res.json();
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, stock: updated.stock } : p)));
      setQtyById(prev => ({ ...prev, [id]: '' }));
      success('Stock updated.');
    } catch (err) {
      console.error('Failed to update stock:', err);
      notifyError('Failed to update stock: ' + err.message);
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Stock Intake</h1>
          <p>Receive shipments and adjust stock levels. For name, price, or description changes, ask an admin.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <input
            className="admin-search"
            placeholder="Search products…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {loading && <div className="admin-empty">Loading products…</div>}
        {error && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div>}

        {!loading && !error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Stock</th>
                  <th>Receive stock</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-cell-main">
                        {p.image ? <img className="admin-thumb" src={p.image} alt={p.name} /> : <div className="admin-thumb" />}
                        {p.name}
                      </div>
                    </td>
                    <td>{p.cat}</td>
                    <td>{p.brand || '—'}</td>
                    <td>
                      {p.stock}
                      {p.stock <= 10 && <span className="admin-badge badge-suspended" style={{ marginLeft: 8 }}>Low</span>}
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <input
                          type="number"
                          className="admin-select"
                          style={{ width: 70 }}
                          placeholder="Qty"
                          value={qtyById[p.id] || ''}
                          onChange={e => setQtyById(prev => ({ ...prev, [p.id]: e.target.value }))}
                        />
                        <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => addStock(p.id)}>Add Stock</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="admin-empty">No products match that search.</div>}
          </div>
        )}
      </div>
    </>
  );
}
