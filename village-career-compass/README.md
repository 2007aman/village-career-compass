# Village Career Compass

Career guidance platform for rural students.
Stack: Node.js + Express 5 - PostgreSQL (`pg`) - Gemini AI - Nodemailer - Tailwind (CDN)

## Quick start
1. Create a PostgreSQL database: `createdb -U postgres village_career_compass` (or use pgAdmin)
2. `cp .env.example .env` (on Windows: copy the file and rename it to `.env`) and fill in:
   - `PGUSER`, `PGPASSWORD`, `PGDATABASE` (keep `DB_SSL=false` locally) - or `DATABASE_URL` for a hosted DB
   - `JWT_SECRET` (required, 32+ chars):
     `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   - `GEMINI_API_KEY`, `ADMIN_API_KEY` (+ SMTP settings if you want emails)
3. `npm install`
4. `npm start`, then open **http://localhost:5000** (do NOT use VS Code Live Server)

Tables are created automatically on start (`sql/init.sql`, safe to re-run).

## What is in the project
| Page | Purpose | Login needed? |
|---|---|---|
| index.html | Home | No |
| careers.html | 26 career paths with photos, roadmaps, YouTube channels | No |
| quiz.html | 5-question aptitude quiz (result saved if logged in) | No |
| scholarships.html | Scholarships + training centers, search, tabs | No |
| mentors.html | Mentor list; AI chat and mentor registration | **Yes** |
| apply.html | Scholarship / training application (prefilled from account) | **Yes** |
| login.html / signup.html | Accounts | - |
| dashboard.html | My Account: profile, saved quiz result, my applications | **Yes** |
| admin.html | All applications (needs ADMIN_API_KEY) | Admin key |

## API
| Method | Route | Auth |
|---|---|---|
| GET | /api/health | - |
| GET | /api/mentors | - |
| POST | /api/mentors | login |
| POST | /api/applications | login |
| POST | /api/chat | login |
| POST | /api/auth/signup, /api/auth/login, /api/auth/logout | - |
| GET | /api/auth/me | - (returns `user: null` for guests) |
| GET | /api/me/applications, /api/me/quiz | login |
| POST | /api/quiz/result | login |
| GET | /api/admin/applications | x-admin-key header |

## Security notes
- Passwords: bcrypt. Sessions: signed JWT in an httpOnly, SameSite=Lax cookie (7 days; `Secure` automatically on HTTPS).
- Login: max 10 failed attempts / 15 min / IP. Rate limits on all write endpoints.
- Keep backend files (server.js, config/, controllers/, .env ...) OUTSIDE `public/`.
- Behind a proxy / on a host, set `NODE_ENV=production`; for local PostgreSQL keep `DB_SSL=false`.
- The pages load Tailwind from its CDN (console shows a "not for production" notice). For a bigger launch, switch to a Tailwind build.
