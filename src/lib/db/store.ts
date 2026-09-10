import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as localDrizzle } from 'drizzle-orm/pglite';
import { drizzle as postgresDrizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { asc, desc, eq, sql } from 'drizzle-orm';
import * as schema from './schema';
import { seedData } from './seed';

export type Database = ReturnType<typeof localDrizzle<typeof schema>> | ReturnType<typeof postgresDrizzle<typeof schema>>;
export type Store = { db: Database; kind: 'pglite' | 'postgres'; close: () => Promise<void> };
export async function createStore(options: { memory?: boolean; dataDir?: string; url?: string; initialize?: boolean; now?: string } = {}): Promise<Store> {
  if (options.url) {
    const pool = new Pool({ connectionString: options.url, max: 3, connectionTimeoutMillis: 10000 });
    const store: Store = { db: postgresDrizzle(pool, { schema }), kind:'postgres', close:()=>pool.end() };
    if (options.initialize) await initialize(store, options.now);
    return store;
  }
  const client = options.memory ? new PGlite() : new PGlite(options.dataDir ?? '.data/crm');
  await client.waitReady;
  const store: Store = { db:localDrizzle(client, { schema }), kind:'pglite', close:()=>client.close() };
  await initialize(store, options.now);
  return store;
}
async function initialize(store: Store, now?: string) {
  const ddl = await readFile(path.join(process.cwd(), 'drizzle/0000_initial.sql'), 'utf8');
  await store.db.execute(sql.raw(ddl));
  const existing = await store.db.select().from(schema.metadata).where(eq(schema.metadata.id,'seed-v1'));
  if (existing.length) return;
  const seed = seedData(now);
  await store.db.transaction(async tx => {
    await tx.insert(schema.customers).values(seed.customers).onConflictDoNothing();
    await tx.insert(schema.deals).values(seed.deals).onConflictDoNothing();
    await tx.insert(schema.activities).values(seed.activities).onConflictDoNothing();
    await tx.insert(schema.tasks).values(seed.tasks).onConflictDoNothing();
    await tx.insert(schema.metadata).values({id:'seed-v1',value:seed.asOf}).onConflictDoNothing();
  });
}
const globals = globalThis as typeof globalThis & { crmStore?: Promise<Store> };
export function getStore() {
  if (!globals.crmStore) {
    if (process.env.VERCEL && !process.env.DATABASE_URL) throw new Error('External DATABASE_URL is required on serverless; local files are not durable there.');
    globals.crmStore = createStore({ url:process.env.DATABASE_URL || undefined, dataDir:process.env.PGLITE_DATA_DIR || '.data/crm' }).catch(error => { globals.crmStore=undefined; throw error; });
  }
  return globals.crmStore;
}
export async function snapshot(store: Store): Promise<schema.Snapshot> {
  const [customers,deals,activities,tasks,meta] = await Promise.all([
    store.db.select().from(schema.customers).orderBy(asc(schema.customers.name)),
    store.db.select().from(schema.deals).orderBy(desc(schema.deals.value)),
    store.db.select().from(schema.activities).orderBy(desc(schema.activities.occurredAt)),
    store.db.select().from(schema.tasks).orderBy(desc(schema.tasks.createdAt)),
    store.db.select().from(schema.metadata).where(eq(schema.metadata.id,'seed-v1')),
  ]);
  return {customers,deals,activities,tasks,asOf:meta[0]?.value ?? new Date().toISOString(),retrievedAt:new Date().toISOString()};
}
export function summarize(data: schema.Snapshot) {
  const active = data.deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  return { customers:data.customers.length, deals:data.deals.length, activeDeals:active.length, pipeline:active.reduce((sum,d)=>sum+d.value,0), openTasks:data.tasks.filter(t=>t.status==='open').length, asOf:data.asOf, retrievedAt:data.retrievedAt };
}
