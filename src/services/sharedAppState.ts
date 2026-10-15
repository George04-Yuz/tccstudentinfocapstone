import { neon } from '@neondatabase/serverless';

export interface SharedAppState {
  students: unknown[];
  courses: unknown[];
  instructors: unknown[];
  grades: unknown[];
  attendanceRecords: unknown[];
  auditLogs: unknown[];
  notifications: unknown[];
  newsList: unknown[];
  permissions: Record<string, unknown>;
}

let schemaReady: Promise<void> | null = null;

function getDatabase() {
  const connectionString = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) throw new Error('Set DATABASE_URL_POOLED or DATABASE_URL in the Vercel environment.');
  return neon(connectionString);
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getDatabase();
      await sql`
        CREATE TABLE IF NOT EXISTS tcc_app_state (
          state_id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

export async function readSharedAppState(): Promise<{ state: SharedAppState; updatedAt: string } | null> {
  await ensureSchema();
  const sql = getDatabase();
  const rows = await sql`
    SELECT payload, updated_at
    FROM tcc_app_state
    WHERE state_id = 'main'
    LIMIT 1
  `;
  if (!rows.length) return null;
  return {
    state: rows[0].payload as SharedAppState,
    updatedAt: new Date(rows[0].updated_at as string).toISOString(),
  };
}

export async function writeSharedAppState(state: SharedAppState): Promise<string> {
  await ensureSchema();
  const sql = getDatabase();
  const rows = await sql`
    INSERT INTO tcc_app_state (state_id, payload, updated_at)
    VALUES ('main', ${JSON.stringify(state)}::jsonb, NOW())
    ON CONFLICT (state_id)
    DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    RETURNING updated_at
  `;
  return new Date(rows[0].updated_at as string).toISOString();
}