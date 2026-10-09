const { pool, seedMentorsIfEmpty, DEFAULT_MENTORS } = require('../config/db');
const { sendMentorWelcomeEmail } = require('../utils/sendEmail');
const { clean, isEmail } = require('../utils/helpers');

const CACHE_TTL_MS = 30000;
let cache = { data: null, at: 0 };

async function getMentors(req, res) {
  try {
    if (cache.data && Date.now() - cache.at < CACHE_TTL_MS) {
      return res.json({ success: true, data: cache.data });
    }
    let { rows } = await pool.query('SELECT id, name, role, company, expertise, bio, image FROM mentors ORDER BY id ASC');
    if (rows.length === 0) {
      await seedMentorsIfEmpty();
      ({ rows } = await pool.query('SELECT id, name, role, company, expertise, bio, image FROM mentors ORDER BY id ASC'));
    }
    cache = { data: rows, at: Date.now() };
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[mentors] get failed:', err.message);
    // Last-resort fallback so the page never shows empty
    res.json({ success: true, data: DEFAULT_MENTORS.map((m, i) => ({ id: -(i + 1), ...m })), fallback: true });
  }
}

async function addMentor(req, res) {
  const b = req.body || {};
  const name = clean(b.name), role = clean(b.role), company = clean(b.company), expertise = clean(b.expertise);
  const bio = clean(b.bio, 1000);
  const image = clean(b.image, 500) || null;
  const email = clean(b.email);

  if (!name || !role || !company || !expertise) {
    return res.status(400).json({ success: false, message: 'name, role, company and expertise are required' });
  }
  if (email && !isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO mentors (name, role, company, expertise, bio, image, email)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, name, role, company, expertise, bio, image`,
      [name, role, company, expertise, bio, image, email || null]
    );
    cache = { data: null, at: 0 };
    if (email) sendMentorWelcomeEmail(email, name); // fire-and-forget, never throws
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[mentors] add failed:', err.message);
    res.status(500).json({ success: false, message: 'Could not save mentor' });
  }
}

module.exports = { getMentors, addMentor };
