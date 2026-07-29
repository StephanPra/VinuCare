const express = require('express');
const db = require('../db');
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const { emitToAdmin, emitToUser } = require('../socket');

const router = express.Router();

// A Doctor/Nurse's own DM thread with Admin.
router.get('/mine', auth, requireRole('Doctor', 'Nurse'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, sender_id AS senderId, sender_name AS senderName, sender_role AS senderRole,
              body, created_at AS createdAt
       FROM messages WHERE staff_id = ? ORDER BY created_at ASC`,
      [req.user.id]
    );
    await db.query(
      `UPDATE messages SET read_by_staff_at = NOW()
       WHERE staff_id = ? AND sender_role = 'Admin' AND read_by_staff_at IS NULL`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get my messages error:', err);
    res.status(500).json({ message: 'Failed to load messages' });
  }
});

router.post('/mine', auth, requireRole('Doctor', 'Nurse'), async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ message: 'Message body is required' });
  try {
    const [result] = await db.query(
      `INSERT INTO messages (staff_id, sender_id, sender_name, sender_role, body)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, req.user.id, req.user.name, req.user.role, body.trim()]
    );
    const message = {
      id: result.insertId,
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: req.user.role,
      body: body.trim(),
      createdAt: new Date(),
    };
    emitToAdmin('message:new', { staffId: req.user.id, staffName: req.user.name, staffRole: req.user.role, ...message });
    res.status(201).json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Admin's inbox — one row per Doctor/Nurse, with a preview of the latest
// message and how many are unread, so Admin can see who needs a reply
// without opening every thread. Staff with no messages yet still show up
// (Admin may want to start the conversation).
router.get('/admin/threads', auth, requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.role,
              (SELECT body FROM messages m WHERE m.staff_id = u.id ORDER BY m.created_at DESC LIMIT 1) AS lastMessage,
              (SELECT created_at FROM messages m WHERE m.staff_id = u.id ORDER BY m.created_at DESC LIMIT 1) AS lastMessageAt,
              (SELECT COUNT(*) FROM messages m WHERE m.staff_id = u.id AND m.sender_role != 'Admin' AND m.read_by_admin_at IS NULL) AS unreadCount
       FROM users u
       WHERE u.role IN ('Doctor', 'Nurse')
       ORDER BY lastMessageAt IS NULL, lastMessageAt DESC, u.name`
    );
    res.json(rows);
  } catch (err) {
    console.error('Get message threads error:', err);
    res.status(500).json({ message: 'Failed to load message threads' });
  }
});

router.get('/admin/threads/:staffId', auth, requireRole('Admin'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, sender_id AS senderId, sender_name AS senderName, sender_role AS senderRole,
              body, created_at AS createdAt
       FROM messages WHERE staff_id = ? ORDER BY created_at ASC`,
      [req.params.staffId]
    );
    await db.query(
      `UPDATE messages SET read_by_admin_at = NOW()
       WHERE staff_id = ? AND sender_role != 'Admin' AND read_by_admin_at IS NULL`,
      [req.params.staffId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get thread error:', err);
    res.status(500).json({ message: 'Failed to load thread' });
  }
});

router.post('/admin/threads/:staffId', auth, requireRole('Admin'), async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ message: 'Message body is required' });
  try {
    const [result] = await db.query(
      `INSERT INTO messages (staff_id, sender_id, sender_name, sender_role, body)
       VALUES (?, ?, ?, 'Admin', ?)`,
      [req.params.staffId, req.user.id, req.user.name, body.trim()]
    );
    const message = {
      id: result.insertId,
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: 'Admin',
      body: body.trim(),
      createdAt: new Date(),
    };
    emitToUser(req.params.staffId, 'message:new', message);
    res.status(201).json(message);
  } catch (err) {
    console.error('Send admin reply error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = router;
