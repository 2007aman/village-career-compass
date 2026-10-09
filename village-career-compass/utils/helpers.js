// Trim + length-limit any user-supplied value to a string.
function clean(value, max = 255) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmail = (v) => EMAIL_RE.test(v);

function withTimeout(promise, ms) {
  let t;
  const timeout = new Promise((_, reject) => { t = setTimeout(() => reject(new Error('timeout')), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

module.exports = { clean, isEmail, withTimeout };
