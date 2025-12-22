# Database setup (KL University ERP)

## Environment

- Set `DATABASE_URL` environment variable pointing to your PostgreSQL instance, for example:

  ```text
  postgresql://user:password@localhost:5432/kl_erp_db
  ```

## Create tables

Run the SQL script that defines the schema:

```powershell
psql "${env:DATABASE_URL}" -f scripts/01-create-tables.sql
```

Or connect to your DB and run the SQL file using your preferred client.

## Run the app

Install dependencies and start dev server:

```powershell
npm install
npm run dev
```

If the dev server reports a stale `.next/dev/lock`, stop any other `next dev` process and remove the lock file:

```powershell
# Find process using port 3000
netstat -aon | findstr :3000

# Stop process (replace PID accordingly)
Stop-Process -Id <PID> -Force

# Remove stale lock and restart
Remove-Item -Path .next\dev\lock -Force -ErrorAction SilentlyContinue
npm run dev
```

## Notes
- The project uses the `pg` package and `lib/db.ts` exposes a `query` function backed by a `Pool`.
- The students API endpoints are available at:
  - `GET /api/students` — list students
  - `POST /api/students` — create student
  - `GET /api/students/:id` — get student
  - `PUT /api/students/:id` — update student
  - `DELETE /api/students/:id` — delete student

Make sure your database has the `students` table (created by `scripts/01-create-tables.sql`).
