const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'vcc_token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = (req) => ({
  httpOnly: true,          // not readable from JavaScript (protects against XSS token theft)
  sameSite: 'lax',         // blocks cross-site request forgery for POSTs
  secure: !!req.secure,    // automatically true behind HTTPS (trust proxy is enabled)
  path: '/',
});

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(req, res, user) {
  res.cookie(COOKIE_NAME, signToken(user), { ...cookieOptions(req), maxAge: MAX_AGE_MS });
}

function clearAuthCookie(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions(req));
}

// Sets req.user when a valid cookie is present; never blocks the request.
function optionalAuth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: Number(payload.sub), role: payload.role };
    } catch (_) { /* expired or invalid -> treated as logged out */ }
  }
  next();
}

function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Please log in first' });
    next();
  });
}

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie, optionalAuth, requireAuth };
