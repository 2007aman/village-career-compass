const { pool } = require('../config/db');

const CATEGORIES = ['technical', 'creative', 'business', 'education', 'agriculture'];

// GET /api/me/applications
async function myApplications(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, program, education, village, district, "createdAt"
         FROM applications WHERE user_id = $1 ORDER BY "createdAt" DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[account] applications failed:', err.message);
    res.status(500).json({ success: false, message: 'Could not load your applications' });
  }
}

// POST /api/quiz/result  { category, scores }
async function saveQuizResult(req, res) {
  const b = req.body || {};
  if (!CATEGORIES.includes(b.category)) {
    return res.status(400).json({ success: false, message: 'Invalid quiz category' });
  }
  const scores = {};
  CATEGORIES.forEach((c) => {
    const n = Number(b.scores && b.scores[c]);
    scores[c] = Number.isFinite(n) ? Math.max(0, Math.min(20, Math.round(n))) : 0;
  });
  try {
    await pool.query(
      'INSERT INTO quiz_results (user_id, category, scores) VALUES ($1, $2, $3)',
      [req.user.id, b.category, JSON.stringify(scores)]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('[account] save quiz failed:', err.message);
    res.status(500).json({ success: false, message: 'Could not save your result' });
  }
}

// GET /api/me/quiz  -> latest result or null
async function myQuiz(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT category, scores, created_at FROM quiz_results WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 1',
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (err) {
    console.error('[account] get quiz failed:', err.message);
    res.status(500).json({ success: false, message: 'Could not load your quiz result' });
  }
}

module.exports = { myApplications, saveQuizResult, myQuiz };
