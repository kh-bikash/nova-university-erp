# Quick Start: Upstash + Attendance Queue

## 30-second Setup

1. **Sign up for Upstash (free)**
   - Visit: https://upstash.com
   - Create account (free tier: 10GB storage, perfect for dev/small scale)
   - Click "Create Database" → choose "Redis"
   - Copy the connection URL (looks like: `redis://default:PASSWORD@HOSTNAME:PORT`)

2. **Add to `.env.local`**
   ```
   REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_HOSTNAME:YOUR_PORT
   DATABASE_URL=postgresql://user:password@localhost:5432/university_erp
   JWT_SECRET=your-secret-key
   ```

3. **Run the app**
   ```powershell
   npm install
   npm run dev
   ```

4. **Run the worker (new terminal)**
   ```powershell
   npm run worker:attendance
   ```

5. **Test**
   - Log in as faculty at http://localhost:3000/login
   - Go to http://localhost:3000/faculty/attendance-marking
   - Select a course, mark attendance, click "Submit Attendance"
   - Check worker terminal — you should see "Attendance job <id> completed"
   - Verify in DB: `SELECT * FROM attendance WHERE attendance_date = TODAY()`

## Why Upstash?

- **No local setup**: Works from Windows, Mac, Linux instantly
- **Serverless**: Auto-scales, no VM to manage
- **Free tier**: Enough for dev + small production
- **Global**: Connect from anywhere (Vercel, Netlify, your server)
- **Durable**: Jobs persist across worker restarts

## Scaling to Production

1. Deploy Next app to Vercel/Netlify with `REDIS_URL` env var
2. Deploy worker to a separate compute (Render.com, Railway, your server) with same `REDIS_URL`
3. Worker will process jobs queued by the app — runs 24/7
4. Multiple workers can run in parallel (each processes jobs independently)
5. Monitor job queue in Upstash dashboard or add BullBoard UI later

## Troubleshooting

**Worker not connecting?**
- Check `REDIS_URL` format: `redis://default:PASSWORD@HOST:PORT`
- Verify no typos in password or hostname (copy-paste from Upstash console)

**Jobs queued but not processing?**
- Ensure worker is running (`npm run worker:attendance` in a separate terminal)
- Check worker logs for errors

**Need to scale further?**
- Run multiple worker instances (each reads from the same queue)
- Use BullBoard for monitoring (I can add this if needed)
- Upgrade Upstash tier as needed (pay-as-you-go pricing)
