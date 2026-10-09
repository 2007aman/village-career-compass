const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Works with ANY PostgreSQL server: local install, Docker, VPS, Supabase, Neon, Railway, etc.
// Use DATABASE_URL, or the standard PGHOST / PGPORT / PGUSER / PGPASSWORD / PGDATABASE variables.
const hasUrl = !!process.env.DATABASE_URL;
const hasParts = !!(process.env.PGHOST && process.env.PGDATABASE);
if (!hasUrl && !hasParts) {
  console.error('[db] No PostgreSQL config found. Set DATABASE_URL, or PGHOST + PGPORT + PGUSER + PGPASSWORD + PGDATABASE in .env');
  process.exit(1);
}

// SSL: on in production (needed for Supabase/cloud). Set DB_SSL=false for a local or same-server PostgreSQL.
const useSsl = process.env.DB_SSL
  ? process.env.DB_SSL === 'true'
  : process.env.NODE_ENV === 'production';

const pool = new Pool({
  ...(hasUrl
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST,
        port: parseInt(process.env.PGPORT, 10) || 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
      }),
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => console.error('[db] idle client error:', err.message));

const DEFAULT_MENTORS = [
  { name: 'Priya Sharma', role: 'Software Engineer', company: 'Infosys', expertise: 'IT & Programming', bio: 'From a small village in Bihar to a software career. I help students start coding with zero background.' },
  { name: 'Dr. Rajesh Kumar', role: 'Medical Officer', company: 'District Hospital', expertise: 'Medical & Healthcare', bio: 'First doctor in my family. I guide students through NEET preparation and medical careers.' },
  { name: 'Anita Devi', role: 'Agri-Business Consultant', company: 'NABARD', expertise: 'Agriculture & Agri-Business', bio: 'I help rural youth turn farming knowledge into modern agri-business careers.' },
  { name: 'Suresh Yadav', role: 'Skill Trainer', company: 'Skill India', expertise: 'Vocational Training', bio: 'I help students find the right ITI, diploma and skill courses for quick employment.' },
].map((m) => ({
  ...m,
  image: `https://ui-avatars.com/api/?background=f97316&color=fff&size=150&name=${encodeURIComponent(m.name)}`,
  email: null,
}));

async function seedMentorsIfEmpty() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(424242)'); // prevents double-seeding across instances
    const { rows } = await client.query('SELECT 1 FROM mentors LIMIT 1');
    if (rows.length === 0) {
      for (const m of DEFAULT_MENTORS) {
        await client.query(
          'INSERT INTO mentors (name, role, company, expertise, bio, image, email) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [m.name, m.role, m.company, m.expertise, m.bio, m.image, m.email]
        );
      }
      console.log('[db] seeded default mentors');
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

async function initDb() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'init.sql'), 'utf8');
  await pool.query(sql);
  await seedMentorsIfEmpty();
  console.log('[db] schema ready');
}

module.exports = { pool, initDb, seedMentorsIfEmpty, DEFAULT_MENTORS };
