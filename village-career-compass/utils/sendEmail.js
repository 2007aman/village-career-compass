const nodemailer = require('nodemailer');

let transporter; // undefined = not initialised, null = not configured

function getTransporter() {
  if (transporter !== undefined) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[mail] SMTP not configured - emails will be skipped');
    return (transporter = null);
  }
  const port = parseInt(SMTP_PORT, 10) || 587;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });
  return transporter;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Never throws - safe to call without await.
async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t || !to) return false;
  try {
    await t.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, html });
    return true;
  } catch (err) {
    console.error('[mail] send failed:', err.message);
    return false;
  }
}

const wrap = (body) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #fed7aa;border-radius:12px">
<h2 style="color:#f97316;margin-top:0">Village Career Compass</h2>${body}
<p style="color:#888;font-size:12px;margin-top:24px">Guiding rural youth towards brighter careers.</p></div>`;

function sendMentorWelcomeEmail(email, name) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Village Career Compass, Mentor!',
    html: wrap(`<p>Namaste ${esc(name)},</p><p>Thank you for joining as a mentor. Your journey will inspire students from rural India.</p><p>Students can now chat with your AI persona and find guidance.</p>`),
  });
}

function sendApplicationConfirmation(email, fullName, program) {
  return sendEmail({
    to: email,
    subject: 'We received your application',
    html: wrap(`<p>Namaste ${esc(fullName)},</p><p>We have received your application for <b>${esc(program)}</b>.</p><p>Our team will review it and contact you on your registered phone number or email.</p>`),
  });
}

function sendWelcomeEmail(email, name) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Village Career Compass!',
    html: wrap(`<p>Namaste ${esc(name)},</p><p>Your account has been created. You can now explore careers, take the aptitude quiz, find scholarships and apply.</p><p>All the best for your journey!</p>`),
  });
}

module.exports = { sendEmail, sendMentorWelcomeEmail, sendApplicationConfirmation, sendWelcomeEmail };
