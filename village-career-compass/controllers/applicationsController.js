const crypto = require('crypto');
const { pool } = require('../config/db');
const { sendApplicationConfirmation } = require('../utils/sendEmail');
const { clean, isEmail } = require('../utils/helpers');

async function createApplication(req, res) {
  const b = req.body || {};
  const data = {
    fullName: clean(b.fullName),
    phone: clean(b.phone, 50),
    email: clean(b.email),
    village: clean(b.village),
    district: clean(b.district),
    program: clean(b.program),
    education: clean(b.education),
    essay1: clean(b.essay1, 3000),
    essay2: clean(b.essay2, 3000),
    essay3: clean(b.essay3, 3000),
  };

  if (!data.fullName || !data.phone || !data.program) {
    return res.status(400).json({ success: false, message: 'fullName, phone and program are required' });
  }
  if (data.email && !isEmail(data.email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO applications
        ("fullName", phone, email, village, district, program, education, essay1, essay2, essay3, user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [data.fullName, data.phone, data.email || null, data.village, data.district,
       data.program, data.education, data.essay1, data.essay2, data.essay3, (req.user && req.user.id) || null]
    );
    if (data.email) sendApplicationConfirmation(data.email, data.fullName, data.program); // non-blocking
    res.status(201).json({ success: true, applicationId: rows[0].id });
  } catch (err) {
    console.error('[applications] insert failed:', err.message);
    res.status(500).json({ success: false, message: 'Could not save application. Please try again.' });
  }
}

// Used by admin.html
function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return res.status(503).json({ success: false, message: 'Admin access not configured' });
  const given = String(req.get('x-admin-key') || '');
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ success: false, message: 'Unauthorized' });
  next();
}

async function listApplications(req, res) {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  try {
    const { rows } = await pool.query(
      'SELECT * FROM applications ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2', [limit, offset]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[applications] list failed:', err.message);
    res.status(500).json({ success: false, message: 'Could not load applications' });
  }
}

module.exports = { createApplication, requireAdmin, listApplications };
