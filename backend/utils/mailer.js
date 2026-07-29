const nodemailer = require('nodemailer');
const path = require('path');

const LOGO_PATH = path.resolve(__dirname, '../../src/assets/logo/vinucare-logo.png');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

async function send(to, subject, html) {
  const from = process.env.EMAIL_FROM || `VinuCare <no-reply@vinucare.com>`;
  const t = getTransporter();

  if (!t) {
    console.log('\n──────────── EMAIL (SMTP not configured) ────────────');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('───────────────────────────────────────────────────\n');
    return { simulated: true };
  }

  return t.sendMail({
    from,
    to,
    subject,
    html,
    attachments: [
      // contentDisposition: 'inline' is what keeps this purely embedded
      // in the HTML body — without it, Gmail (and other clients) also
      // lists it as a separate downloadable attachment chip, with its
      // own generic "preview unavailable" icon in the inbox row.
      { filename: 'vinucare-logo.png', path: LOGO_PATH, cid: 'vinucare-logo', contentDisposition: 'inline' },
    ],
  });
}

async function sendVerificationEmail(to, name, verifyUrl) {
  const subject = 'Verify your VinuCare account';
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#faf9fd;">
    <div style="text-align:center; margin-bottom: 24px;">
      <img src="cid:vinucare-logo" alt="VinuCare" width="56" height="56" style="border-radius:14px; display:inline-block;" />
    </div>
    <h2 style="color:#2b2140; text-align:center; margin-bottom:8px;">Welcome to VinuCare, ${name}!</h2>
    <p style="color:#5c5470; text-align:center; font-size:14px; line-height:1.6;">
      Please confirm your email address to activate your account and start booking care for your pets.
    </p>
    <div style="text-align:center; margin: 28px 0;">
      <a href="${verifyUrl}" style="background:linear-gradient(135deg,#7C5CE8,#5B3FC4); color:#fff; text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:600; display:inline-block;">
        Verify My Email
      </a>
    </div>
    <p style="color:#9a93ab; text-align:center; font-size:12px; line-height:1.6;">
      This link expires in 24 hours. If the button doesn't work, copy and paste this URL into your browser:<br>
      <span style="word-break:break-all;">${verifyUrl}</span>
    </p>
    <p style="color:#c2bdd1; text-align:center; font-size:11px; margin-top:24px;">
      If you didn't create a VinuCare account, you can safely ignore this email.
    </p>
  </div>`;

  return send(to, subject, html);
}

// Google sign-ups skip the verification link entirely — Google already
// confirmed the email address — but they were getting no email at all,
// which read as broken. This is the welcome email for that path instead.
async function sendWelcomeEmail(to, name) {
  const subject = 'Welcome to VinuCare';
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#faf9fd;">
    <div style="text-align:center; margin-bottom: 24px;">
      <img src="cid:vinucare-logo" alt="VinuCare" width="56" height="56" style="border-radius:14px; display:inline-block;" />
    </div>
    <h2 style="color:#2b2140; text-align:center; margin-bottom:8px;">Welcome to VinuCare, ${name}!</h2>
    <p style="color:#5c5470; text-align:center; font-size:14px; line-height:1.6;">
      Your account is ready to go — you signed in with Google, so there's nothing
      else to confirm. You can start booking care for your pets right away.
    </p>
    <p style="color:#c2bdd1; text-align:center; font-size:11px; margin-top:24px;">
      If you didn't create a VinuCare account, you can safely ignore this email.
    </p>
  </div>`;

  return send(to, subject, html);
}

async function sendPasswordResetEmail(to, name, resetUrl) {
  const subject = 'Reset your VinuCare password';
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#faf9fd;">
    <div style="text-align:center; margin-bottom: 24px;">
      <img src="cid:vinucare-logo" alt="VinuCare" width="56" height="56" style="border-radius:14px; display:inline-block;" />
    </div>
    <h2 style="color:#2b2140; text-align:center; margin-bottom:8px;">Reset your password, ${name}</h2>
    <p style="color:#5c5470; text-align:center; font-size:14px; line-height:1.6;">
      We received a request to reset your VinuCare password. Click below to choose a new one.
    </p>
    <div style="text-align:center; margin: 28px 0;">
      <a href="${resetUrl}" style="background:linear-gradient(135deg,#7C5CE8,#5B3FC4); color:#fff; text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:600; display:inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color:#9a93ab; text-align:center; font-size:12px; line-height:1.6;">
      This link expires in 1 hour. If the button doesn't work, copy and paste this URL into your browser:<br>
      <span style="word-break:break-all;">${resetUrl}</span>
    </p>
    <p style="color:#c2bdd1; text-align:center; font-size:11px; margin-top:24px;">
      If you didn't request this, you can safely ignore this email — your password won't change.
    </p>
  </div>`;

  return send(to, subject, html);
}

// Sent when a doctor blocks off a day that already had bookings on it —
// those appointments get auto-cancelled server-side, and this is how the
// affected owner finds out and gets pointed at rebooking a new day ASAP.
async function sendAppointmentCancelledEmail(to, name, appt, rebookUrl) {
  const subject = 'Your VinuCare appointment needs to be rescheduled';
  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background:#faf9fd;">
    <div style="text-align:center; margin-bottom: 24px;">
      <img src="cid:vinucare-logo" alt="VinuCare" width="56" height="56" style="border-radius:14px; display:inline-block;" />
    </div>
    <h2 style="color:#2b2140; text-align:center; margin-bottom:8px;">Hi ${name}, we need to reschedule</h2>
    <p style="color:#5c5470; text-align:center; font-size:14px; line-height:1.6;">
      Your doctor became unavailable on <strong>${appt.date}</strong>, so your appointment for
      <strong>${appt.petName}</strong> (${appt.service} at ${appt.time}) has been cancelled.
      We're sorry for the inconvenience — please pick a new day that works for you as soon as you can.
    </p>
    <div style="text-align:center; margin: 28px 0;">
      <a href="${rebookUrl}" style="background:linear-gradient(135deg,#7C5CE8,#5B3FC4); color:#fff; text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:600; display:inline-block;">
        Choose a New Day
      </a>
    </div>
    <p style="color:#9a93ab; text-align:center; font-size:12px; line-height:1.6;">
      If the button doesn't work, copy and paste this URL into your browser:<br>
      <span style="word-break:break-all;">${rebookUrl}</span>
    </p>
  </div>`;

  return send(to, subject, html);
}

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendAppointmentCancelledEmail };