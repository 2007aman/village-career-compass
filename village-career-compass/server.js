require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const { pool, initDb } = require('./config/db');
const mentors = require('./controllers/mentorsController');
const applications = require('./controllers/applicationsController');
const { chat } = require('./controllers/chatController');
const auth = require('./controllers/authController');
const account = require('./controllers/accountController');
const { optionalAuth, requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

app.set('trust proxy', 1); // behind Nginx / Render / Railway etc. so rate limiting sees real IPs
app.disable('x-powered-by');

// CSP is off because the pages load Tailwind/Feather from CDNs and use inline scripts.
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : true,
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(optionalAuth);

const limiter = (windowMs, max) => rateLimit({
  windowMs, max, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again shortly.' },
});

// ---- API ----
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));

app.use('/api', limiter(15 * 60 * 1000, 1000)); // general per-IP ceiling (shared mobile IPs are common)
app.get('/api/mentors', mentors.getMentors);
app.post('/api/mentors', requireAuth, limiter(60 * 60 * 1000, 10), mentors.addMentor);
app.post('/api/applications', requireAuth, limiter(60 * 60 * 1000, 15), applications.createApplication);

// ---- Auth ----
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10, skipSuccessfulRequests: true, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many failed login attempts. Please try again in 15 minutes.' },
});
app.post('/api/auth/signup', limiter(60 * 60 * 1000, 20), auth.signup);
app.post('/api/auth/login', loginLimiter, auth.login);
app.post('/api/auth/logout', auth.logout);
app.get('/api/auth/me', auth.me);

// ---- My account ----
app.get('/api/me/applications', requireAuth, account.myApplications);
app.get('/api/me/quiz', requireAuth, account.myQuiz);
app.post('/api/quiz/result', requireAuth, limiter(60 * 60 * 1000, 60), account.saveQuizResult);
app.post('/api/chat', requireAuth, limiter(60 * 1000, 15), chat);
app.get('/api/admin/applications', applications.requireAdmin, applications.listApplications);

// Unknown API routes -> JSON 404 (never the HTML page)
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// ---- Frontend ----
app.use(express.static(PUBLIC_DIR, { maxAge: '1h' }));

// Express v5-safe SPA catch-all (no '*' / path-to-regexp pattern involved)
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'), (err) => err && next(err));
});

// ---- Error handler ----
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ success: false, message: 'Payload too large' });
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ success: false, message: 'Invalid JSON' });
  console.error('[server] unhandled:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ---- Boot ----
async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('[auth] JWT_SECRET is missing or too short (min 32 chars). Generate one with:\n  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
    process.exit(1);
  }
  try {
    await initDb();
  } catch (err) {
    console.error('[db] init failed:', err.message);
    process.exit(1);
  }
  const server = app.listen(PORT, () => console.log(`Village Career Compass running on port ${PORT}`));
  server.keepAliveTimeout = 65000; // above typical load-balancer idle timeouts
  server.headersTimeout = 66000;

  const shutdown = (sig) => {
    console.log(`${sig} received, shutting down...`);
    server.close(async () => { await pool.end().catch(() => {}); process.exit(0); });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (r) => console.error('[unhandledRejection]', r));
start();
