import 'server-only';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { AppError } from '@/lib/config';
const globals = globalThis as typeof globalThis & { crmPool?: Pool };
export function getPool() {
  if (!process.env.DATABASE_URL) throw new AppError('DATABASE_CONFIG', 'Configure DATABASE_URL and run npm run db:migrate. Explore does not require an LLM, but does require its database.', 503);
  return globals.crmPool ??= new Pool({ connectionString:process.env.DATABASE_URL, max:5, connectionTimeoutMillis:5000, idleTimeoutMillis:30000, statement_timeout:10000 });
}
export function getDb() { return drizzle(getPool(), { schema }); }
