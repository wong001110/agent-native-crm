import {readFile} from 'node:fs/promises';
import {sql} from 'drizzle-orm';
import {PostgresStore} from '../src/lib/db/postgres-store';
import {seedSnapshot} from '../src/lib/seed';
import * as tables from '../src/lib/db/schema';
const url=process.env.DATABASE_URL;
if(!url)throw new Error('Set DATABASE_URL before running db:setup. No database was changed.');
const store=new PostgresStore(url);
try{
  const migration=await readFile(new URL('../drizzle/0000_initial.sql',import.meta.url),'utf8');
  await store.client.begin(async tx=>{await tx.unsafe(migration);});
  await store.db.transaction(async tx=>{
    await tx.execute(sql`SELECT pg_advisory_xact_lock(498122)`);
    const existing=await tx.select({id:tables.customers.id}).from(tables.customers).limit(1);
    if(existing.length){console.log('Schema exists; existing CRM data preserved.');return;}
    const seed=seedSnapshot();
    await tx.insert(tables.customers).values(seed.customers);
    await tx.insert(tables.deals).values(seed.deals);
    await tx.insert(tables.activities).values(seed.activities);
    console.log('Seeded 12 fictional customers and deals.');
  });
}finally{await store.close();}
