import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  // Explicit, developer-friendly error will be thrown when query is called
  console.warn('[KL-ERP] DATABASE_URL not set — database requests will fail. See DATABASE.md for setup.')
}

let pool: Pool

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for some Vercel/Supabase setups
    }
  })
} else {
  // In development, use a global variable so the pool isn't re-created on every hot reload
  if (!(global as any).postgres) {
    (global as any).postgres = new Pool({ connectionString })
  }
  pool = (global as any).postgres
}

export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error(
      '[KL-ERP] DATABASE_URL is not configured. Create a PostgreSQL database and set the DATABASE_URL environment variable. See DATABASE.md for instructions.'
    )
  }

  const client = await pool.connect()
  try {
    const res = await client.query(text, params)
    return res
  } finally {
    client.release()
  }
}

export default pool
