Attendance queue & worker

Overview
- We use Redis + BullMQ to offload attendance writes to background workers.
- The API endpoint `/api/attendance/mark` now enqueues a job; a separate worker processes the job and performs DB upserts.

Prerequisites
- Postgres: `DATABASE_URL` must be set as usual.
- Redis: **Recommended scalable option: Use Upstash (serverless Redis)**
  - Sign up free at https://upstash.com
  - Create a database (Redis is auto-provisioned instantly)
  - Copy your connection string: `redis://default:<password>@<host>:<port>`
  - Add to `.env.local`: `REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT`
  - Alternative: use local Redis at `redis://127.0.0.1:6379` (default if `REDIS_URL` not set)

Run the dev server
```
npm run dev
```

Run the attendance worker (separate terminal)
```
# requires ts-node installed (devDependency). If you don't have it:
npm install -D ts-node

# Run the worker (this uses ts-node ESM loader to run TypeScript directly)
npm run worker:attendance
```

Local Redis Alternative (Development Only)
If you prefer to run Redis locally instead of Upstash:
- **Option 1: WSL2 + Ubuntu**
  ```powershell
  wsl --install
  # Inside WSL Ubuntu shell:
  sudo apt update && sudo apt install redis-server -y
  sudo service redis-server start
  redis-cli ping   # should reply PONG
  ```
  Then set `REDIS_URL=redis://127.0.0.1:6379` in `.env.local` or leave blank (defaults to localhost).

- **Option 2: Docker Desktop** (requires Docker Desktop installed and running)
  ```powershell
  docker run -p 6379:6379 -d redis:7
  ```
  Verify: `redis-cli ping` (if redis-cli is installed locally).

Troubleshooting
- **Worker not processing jobs?** Ensure `REDIS_URL` is set and Redis is reachable (Upstash or local).
- **Connection timeout?** If using Upstash, double-check the Redis URL format. If local Redis, verify Redis is running.
- **Jobs not showing in DB?** Verify `DATABASE_URL` is correct and the `attendance` table exists (run schema from `scripts/01-create-tables.sql`).

Notessh Setup (Recommended for Production)
1. Go to https://upstash.com and sign up (free tier available).
2. Create a Redis database — you get a managed Redis instance instantly.
3. Copy the connection URL (format: `redis://default:PASSWORD@HOST:PORT`).
4. Add to `.env.local`:
   ```
   REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT
   ```
5. Deploy the Next app to Vercel, Netlify, or your cloud platform.
6. Add the same `REDIS_URL` to your deployment's environment variables.
7. Run the worker on a separate compute instance (e.g., Render, Railway, or your server):
   ```
   npm install
   npm run worker:attendance
   ```
   The worker will connect to the same Upstash Redis and process jobs globally.

Notes
- Worker is implemented in `workers/attendance-worker.ts` and uses `lib/db.ts` for DB operations.
- Jobs are queued on the `attendance` queue (BullMQ) — monitor with BullBoard or Arena if desired.
- BullMQ + Upstash is a proven pattern for serverless & edge deployments — scales horizontally without managing Redis yourself.
