const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db.js');
const { emitToAdmin } = require('../socket');

const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalRevenue
       FROM transactions WHERE status = 'Paid'`
    );
    const [[{ pendingAppointments }]] = await pool.query(
      `SELECT COUNT(*) AS pendingAppointments
       FROM appointments WHERE status = 'Pending'`
    );
    const [[{ activeDoctors }]] = await pool.query(
      `SELECT COUNT(*) AS activeDoctors
       FROM users WHERE role = 'Doctor'`
    );
    const [[{ lowStockProducts }]] = await pool.query(
  `SELECT COUNT(*) AS lowStockProducts FROM products WHERE stock <= 10`
    );

    res.json({ totalRevenue, pendingAppointments, activeDoctors, lowStockProducts });
  } catch (err) {
    console.error('Admin summary error:', err);
    res.status(500).json({ error: 'Failed to load summary' });
  }
});
// GET all users
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, phone, specialty, status, is_verified, created_at AS joined
       FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// CREATE user
router.post('/users', async (req, res) => {
  const { name, email, role, phone, specialty, status, password } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  if (!password) return res.status(400).json({ error: 'A temporary password is required so this user can log in' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, role, phone, specialty, status, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, role || 'Customer', phone || null, specialty || null, status || 'Active', hashed]
    );
    res.status(201).json({ id: result.insertId, name, email, role, phone, specialty, status });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// UPDATE user
router.put('/users/:id', async (req, res) => {
  const { name, email, role, phone, specialty, status } = req.body;
  try {
    await pool.query(
      `UPDATE users SET name = ?, email = ?, role = ?, phone = ?, specialty = ?, status = ?
       WHERE id = ?`,
      [name, email, role, phone, specialty, status, req.params.id]
    );
    res.json({ id: req.params.id, name, email, role, phone, specialty, status });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user
router.delete('/users/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM users WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
// GET all products
router.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, description, price, image, category AS cat, brand, stock
       FROM products ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// CREATE product
router.post('/products', async (req, res) => {
  const { name, cat, brand, price, stock, image, description } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });
  try {
    const [result] = await pool.query(
      `INSERT INTO products (name, category, brand, price, stock, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, cat, brand || null, price, stock || 0, image || null, description || null]
    );
    res.status(201).json({ id: result.insertId, name, cat, brand, price, stock, image, description });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// UPDATE product
router.put('/products/:id', async (req, res) => {
  const { name, cat, brand, price, stock, image, description } = req.body;
  try {
    await pool.query(
      `UPDATE products SET name = ?, category = ?, brand = ?, price = ?, stock = ?, image = ?, description = ?
       WHERE id = ?`,
      [name, cat, brand || null, price, stock, image, description, req.params.id]
    );
    res.json({ id: req.params.id, name, cat, brand, price, stock, image, description });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/products/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM products WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});
// GET all banners
router.get('/banners', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, banner_key AS bannerKey, page, type, sort_order AS sortOrder,
              tag, title, description, price, original_price AS originalPrice,
              cta_text AS ctaText, image, alt
       FROM banners ORDER BY page, type, sort_order, banner_key`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get banners error:', err);
    res.status(500).json({ error: 'Failed to load banners' });
  }
});

// CREATE a new promo-card banner (an admin-added "section") on a page.
// Hero slots are fixed one-per-page and are never created this way.
router.post('/banners', async (req, res) => {
  const { page, tag, title, description, price, originalPrice, ctaText, image, alt } = req.body;
  if (!page || !title) return res.status(400).json({ error: 'Page and title are required' });
  try {
    const bannerKey = `${page}_custom_${Date.now()}`;
    const [[{ maxOrder }]] = await pool.query(
      `SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM banners WHERE page = ? AND type = 'offer'`,
      [page]
    );
    await pool.query(
      `INSERT INTO banners (banner_key, page, type, sort_order, tag, title, description, price, original_price, cta_text, image, alt)
       VALUES (?, ?, 'offer', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bannerKey, page, maxOrder + 1, tag || null, title, description || null, price || null, originalPrice || null, ctaText || null, image || null, alt || null]
    );
    res.status(201).json({ bannerKey, page, type: 'offer', sortOrder: maxOrder + 1, tag, title, description, price, originalPrice, ctaText, image, alt });
  } catch (err) {
    console.error('Create banner error:', err);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

// UPDATE a banner slot (slots are seeded by migration, never created/deleted via API)
router.put('/banners/:key', async (req, res) => {
  const { tag, title, description, price, originalPrice, ctaText, image, alt } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE banners SET tag = ?, title = ?, description = ?, price = ?,
              original_price = ?, cta_text = ?, image = ?, alt = ?
       WHERE banner_key = ?`,
      [tag || null, title || null, description || null, price || null,
       originalPrice || null, ctaText || null, image || null, alt || null, req.params.key]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Unknown banner slot' });
    res.json({ bannerKey: req.params.key, tag, title, description, price, originalPrice, ctaText, image, alt });
  } catch (err) {
    console.error('Update banner error:', err);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// DELETE an admin-added promo-card banner. Fixed hero slots refuse deletion
// since every page expects exactly one hero to render.
router.delete('/banners/:key', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT type FROM banners WHERE banner_key = ?', [req.params.key]);
    if (!row) return res.status(404).json({ error: 'Unknown banner slot' });
    if (row.type === 'hero') return res.status(400).json({ error: 'Hero banners cannot be deleted, only edited' });
    await pool.query('DELETE FROM banners WHERE banner_key = ?', [req.params.key]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete banner error:', err);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

// GET all appointments (with doctor name via join)
router.get('/appointments', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.pet_name AS petName, a.owner_name AS ownerName, a.service,
              DATE_FORMAT(a.appt_date, '%Y-%m-%d') AS date, a.appt_time AS time,
              a.status, u.name AS doctor
       FROM appointments a
       LEFT JOIN users u ON a.doctor_id = u.id
       ORDER BY a.appt_date, a.appt_time`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'Failed to load appointments' });
  }
});

// UPDATE status only
router.patch('/appointments/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query(`UPDATE appointments SET status = ? WHERE id = ?`, [status, req.params.id]);
    emitToAdmin('appointment:statusChanged', { id: req.params.id, status });
    res.json({ id: req.params.id, status });
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// DELETE appointment
router.delete('/appointments/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM appointments WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete appointment error:', err);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});
// GET all transactions (with customer name + derived type/reference)
router.get('/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.id,
              DATE_FORMAT(t.created_at, '%Y-%m-%d') AS date,
              u.name AS customer,
              CASE
                WHEN t.order_id IS NOT NULL THEN 'Product'
                WHEN t.appointment_id IS NOT NULL THEN 'Appointment'
                ELSE 'Other'
              END AS type,
              CASE
                WHEN t.order_id IS NOT NULL THEN CONCAT('ORD-', t.order_id)
                WHEN t.appointment_id IS NOT NULL THEN CONCAT('A-', t.appointment_id)
                ELSE ''
              END AS reference,
              t.payment_method AS method,
              t.amount,
              t.status
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Failed to load transactions' });
  }
});
// GET analytics — aggregated data for the Overview/Analytics charts.
// Everything here is derived from `transactions` (now that payments.js
// actually writes to it) plus `appointments` and `order_items`, so the
// numbers reflect real paid revenue rather than just "orders placed".
router.get('/analytics', async (req, res) => {
  try {
    // Revenue for each of the last 14 days (fills in zero for days with
    // no transactions, so the chart doesn't have gaps).
    const [revenueRows] = await pool.query(
      `SELECT DATE(created_at) AS day, SUM(amount) AS revenue
       FROM transactions
       WHERE status = 'Paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY DATE(created_at)
       ORDER BY day`
    );
    const revenueByDay = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const match = revenueRows.find(r => {
        const rDay = r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day);
        return rDay === key;
      });
      revenueByDay.push({ date: key, revenue: match ? Number(match.revenue) : 0 });
    }

    // Revenue split by service, for paid appointments only.
    const [revenueByService] = await pool.query(
      `SELECT service, SUM(amount) AS revenue, COUNT(*) AS bookings
       FROM appointments
       WHERE payment_status = 'paid'
       GROUP BY service
       ORDER BY revenue DESC`
    );

    // Appointment funnel — how many are pending vs confirmed vs completed etc.
    const [appointmentsByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM appointments GROUP BY status`
    );

    // Best-selling products by revenue, only counting paid orders.
    const [topProducts] = await pool.query(
      `SELECT oi.product_name AS name,
              SUM(oi.quantity) AS unitsSold,
              SUM(oi.quantity * oi.price) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.payment_status = 'paid'
       GROUP BY oi.product_name
       ORDER BY revenue DESC
       LIMIT 5`
    );

    // Revenue split by how customers paid — useful for deciding which
    // payment gateway to prioritise supporting/promoting.
    const [revenueByMethod] = await pool.query(
      `SELECT COALESCE(payment_method, 'unknown') AS method, SUM(amount) AS revenue
       FROM transactions
       WHERE status = 'Paid'
       GROUP BY payment_method`
    );

    // Busiest doctors by appointment count.
    const [appointmentsByDoctor] = await pool.query(
      `SELECT u.name AS doctor, COUNT(*) AS appointments
       FROM appointments a
       JOIN users u ON u.id = a.doctor_id
       GROUP BY u.name
       ORDER BY appointments DESC`
    );

    res.json({
      revenueByDay,
      revenueByService: revenueByService.map(r => ({ ...r, revenue: Number(r.revenue) })),
      appointmentsByStatus,
      topProducts: topProducts.map(p => ({ ...p, revenue: Number(p.revenue) })),
      revenueByMethod: revenueByMethod.map(r => ({ ...r, revenue: Number(r.revenue) })),
      appointmentsByDoctor,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

module.exports = router;