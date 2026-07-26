const express = require('express');
const db = require('../db');
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// Maps the DB's appointment status values to the small set
// DoctorCalendar.jsx knows how to render (booked / completed / cancelled).
function toCalendarStatus(dbStatus) {
  switch (dbStatus) {
    case 'Completed':
      return 'completed';
    case 'Cancelled':
      return 'cancelled';
    case 'Pending':
    case 'Confirmed':
    default:
      return 'booked';
  }
}

// GET /api/doctor/appointments
// Returns only the appointments assigned to the logged-in doctor,
// shaped for DoctorCalendar.jsx.
router.get('/appointments', auth, requireRole('Doctor'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.pet_name AS petName, a.owner_name AS ownerName, a.service,
              DATE_FORMAT(a.appt_date, '%Y-%m-%d') AS date, a.appt_time AS time,
              a.status
       FROM appointments a
       WHERE a.doctor_id = ?
       ORDER BY a.appt_date, a.appt_time`,
      [req.user.id]
    );

    const appointments = rows.map((row) => ({
      id: String(row.id),
      date: row.date,
      time: row.time,
      patientName: row.petName,
      ownerName: row.ownerName,
      reason: row.service,
      status: toCalendarStatus(row.status),
    }));

    res.json(appointments);
  } catch (err) {
    console.error('Get doctor appointments error:', err);
    res.status(500).json({ message: 'Failed to load appointments' });
  }
});

// GET /api/doctor/unavailability
// The logged-in doctor's own list of dates they've marked unavailable.
router.get('/unavailability', auth, requireRole('Doctor'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date FROM doctor_unavailability
       WHERE doctor_id = ? ORDER BY date`,
      [req.user.id]
    );
    res.json(rows.map((r) => r.date));
  } catch (err) {
    console.error('Get doctor unavailability error:', err);
    res.status(500).json({ message: 'Failed to load unavailable dates' });
  }
});

// POST /api/doctor/unavailability { date: 'YYYY-MM-DD' }
router.post('/unavailability', auth, requireRole('Doctor'), async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ message: 'Date is required' });
  try {
    await db.query(
      `INSERT IGNORE INTO doctor_unavailability (doctor_id, date) VALUES (?, ?)`,
      [req.user.id, date]
    );
    res.status(201).json({ date });
  } catch (err) {
    console.error('Add doctor unavailability error:', err);
    res.status(500).json({ message: 'Failed to mark date unavailable' });
  }
});

// DELETE /api/doctor/unavailability/:date
router.delete('/unavailability/:date', auth, requireRole('Doctor'), async (req, res) => {
  try {
    await db.query(
      `DELETE FROM doctor_unavailability WHERE doctor_id = ? AND date = ?`,
      [req.user.id, req.params.date]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Remove doctor unavailability error:', err);
    res.status(500).json({ message: 'Failed to update availability' });
  }
});

module.exports = router;