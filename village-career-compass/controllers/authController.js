const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { setAuthCookie, clearAuthCookie } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/sendEmail');
const { clean, isEmail } = require('../utils/helpers');

const BCRYPT_ROUNDS = 10;
// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password-1', BCRYPT_ROUNDS);

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, createdAt: u.created_at || null });

function validatePassword(pw) {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (pw.length > 72) return 'Password must be 72 characters or fewer';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must contain at least one letter and one number';
  return null;
}

async function signup(req, res) {
  const b = req.body || {};
  const name = clean(b.name, 100);
  const email = clean(b.email, 255).toLowerCase();
  const phone = clean(b.phone, 50);
  const password = typeof b.password === 'string' ? b.password : '';

  if (name.length < 2) return res.status(400).json({ success: false, message: 'Please enter your full name' });
  if (!isEmail(email)) return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) return res.status(400).json({ success: false, message: 'Please enter a valid phone number' });
  const pwError = validatePassword(password);
  if (pwError) return res.status(400).json({ success: false, message: pwError });

  try {
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone, role`,
      [name, email, phone || null, hash]
    );
    const user = rows[0];
    setAuthCookie(req, res, user);
    sendWelcomeEmail(user.email, user.name); // non-blocking
    res.status(201).json({ success: true, user: publicUser(user) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }
    console.error('[auth] signup failed:', err.message);
    res.status(500).json({ success: false, message: 'Could not create your account. Please try again.' });
  }
}

async function login(req, res) {
  const b = req.body || {};
  const email = clean(b.email, 255).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';
  if (!email || !password) return res.status(400).json({ success: false, message: 'Please enter your email and password' });

  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, role, password_hash FROM users WHERE LOWER(email) = $1 LIMIT 1', [email]
    );
    const user = rows[0];
    const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]).catch(() => {});
    setAuthCookie(req, res, user);
    res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    console.error('[auth] login failed:', err.message);
    res.status(500).json({ success: false, message: 'Could not log you in. Please try again.' });
  }
}

function logout(req, res) {
  clearAuthCookie(req, res);
  res.json({ success: true });
}

// Always 200 so the navbar can check login state on every page without console errors.
async function me(req, res) {
  if (!req.user) return res.json({ success: true, user: null });
  try {
    const { rows } = await pool.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) { clearAuthCookie(req, res); return res.json({ success: true, user: null }); }
    res.json({ success: true, user: publicUser(rows[0]) });
  } catch (err) {
    console.error('[auth] me failed:', err.message);
    res.json({ success: true, user: null });
  }
}

module.exports = { signup, login, logout, me };
