# Village Career Compass

Database: **PostgreSQL** (via the `pg` package). Tables are created automatically on first start.

## Local PostgreSQL setup
1. Install PostgreSQL (https://www.postgresql.org/download/) and create a database:
   `createdb -U postgres village_career_compass`   (or create it in pgAdmin)
2. `cp .env.example .env` and set PGUSER / PGPASSWORD / PGDATABASE (keep `DB_SSL=false`), plus GEMINI_API_KEY and ADMIN_API_KEY
3. `npm install`
4. `npm start`  -> http://localhost:5000

## Hosted PostgreSQL (Supabase / Neon / Railway)
Set `DATABASE_URL` in `.env`, remove `DB_SSL=false`, and set `NODE_ENV=production`.

Admin dashboard: http://localhost:5000/admin.html (asks for ADMIN_API_KEY)
Health check: GET /api/health
