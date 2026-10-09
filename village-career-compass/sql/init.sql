CREATE TABLE IF NOT EXISTS mentors (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  role      VARCHAR(255) NOT NULL,
  company   VARCHAR(255) NOT NULL,
  expertise VARCHAR(255) NOT NULL,
  bio       TEXT,
  image     TEXT,
  email     VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS applications (
  id          SERIAL PRIMARY KEY,
  "fullName"  VARCHAR(255) NOT NULL,
  phone       VARCHAR(50),
  email       VARCHAR(255),
  village     VARCHAR(255),
  district    VARCHAR(255),
  program     VARCHAR(255),
  education   VARCHAR(255),
  essay1      TEXT,
  essay2      TEXT,
  essay3      TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Repair tables left over from older versions (lowercase column names)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'applications' AND column_name = 'createdat')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'applications' AND column_name = 'createdAt') THEN
    ALTER TABLE applications RENAME COLUMN createdat TO "createdAt";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'applications' AND column_name = 'fullname')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'applications' AND column_name = 'fullName') THEN
    ALTER TABLE applications RENAME COLUMN fullname TO "fullName";
  END IF;
END $$;

-- Add any column that an older table is missing
ALTER TABLE applications ADD COLUMN IF NOT EXISTS "fullName"  VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS phone       VARCHAR(50);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS email       VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS village     VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS district    VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS program     VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS education   VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS essay1      TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS essay2      TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS essay3      TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE mentors ADD COLUMN IF NOT EXISTS bio   TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- The apply form treats email as optional
ALTER TABLE applications ALTER COLUMN email DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_created ON applications ("createdAt" DESC);

-- ---------- Users (login / signup) ----------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(50),
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'student',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login    TIMESTAMP
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone      VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role       VARCHAR(20) NOT NULL DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));

-- Link applications to the logged-in student (optional - guests can still apply)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications (user_id);

-- ---------- Saved quiz results (one row per attempt, per logged-in student) ----------
CREATE TABLE IF NOT EXISTS quiz_results (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   VARCHAR(30) NOT NULL,
  scores     JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results (user_id, created_at DESC);
