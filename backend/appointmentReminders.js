// Sends a reminder email the day before each confirmed appointment.
// No external cron dependency — a plain hourly interval is more than
// precise enough for a once-a-day reminder, and one less thing to
// configure on a host like Railway.
const db = require('./db');
const { sendAppointmentReminderEmail } = require('./utils/mailer');

async function runReminderSweep() {
  try {
    // Three conditions in the WHERE, each guarding against a different
    // false positive: status='Confirmed' skips Pending/Cancelled bookings;
    // reminder_sent_at IS NULL stops the same appointment being emailed
    // again on the next hourly pass once it succeeds; appt_date matching
    // "tomorrow" (CURDATE() + 1 day) is what makes this a day-before
    // reminder rather than a same-day one.
    const [rows] = await db.query(
      `SELECT a.id, a.pet_name AS petName, a.service,
              DATE_FORMAT(a.appt_date, '%Y-%m-%d') AS apptDate, a.appt_time AS apptTime,
              u.email, u.name AS ownerName
       FROM appointments a
       JOIN users u ON a.user_id = u.id
       WHERE a.status = 'Confirmed'
         AND a.reminder_sent_at IS NULL
         AND a.appt_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)`
    );

    for (const appt of rows) {
      if (!appt.email) continue;
      try {
        await sendAppointmentReminderEmail(appt.email, appt.ownerName || 'there', appt);
        await db.query('UPDATE appointments SET reminder_sent_at = NOW() WHERE id = ?', [appt.id]);
      } catch (err) {
        // One failed email shouldn't stop the rest of the sweep, and
        // reminder_sent_at is only set on success so a transient failure
        // gets retried on the next hourly pass instead of being skipped.
        console.error(`Failed to send appointment reminder (id ${appt.id}):`, err);
      }
    }
  } catch (err) {
    console.error('Appointment reminder sweep failed:', err);
  }
}

function startReminderScheduler() {
  runReminderSweep();
  setInterval(runReminderSweep, 60 * 60 * 1000);
}

module.exports = { startReminderScheduler };
