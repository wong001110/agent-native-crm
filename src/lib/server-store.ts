import 'server-only';
import {DemoStore} from './demo-store';
import {PostgresStore} from './db/postgres-store';
import {AppError} from './domain';
import type {Store} from './store';
const globalStore=globalThis as unknown as {crmStore?:Store};
export function getStore():Store {
  if(globalStore.crmStore)return globalStore.crmStore;
  const mode=process.env.DB_MODE??'demo';
  if(mode==='postgres'){
    if(!process.env.DATABASE_URL)throw new AppError('CONFIG','DATABASE_URL is required for PostgreSQL mode.',503);
    globalStore.crmStore=new PostgresStore(process.env.DATABASE_URL);
  }else if(mode==='demo'){
    if(process.env.VERCEL)throw new AppError('CONFIG','File-backed demo storage is local only. Configure PostgreSQL before deploying.',503);
    globalStore.crmStore=new DemoStore(process.env.DEMO_DATA_FILE);
  }else throw new AppError('CONFIG','DB_MODE must be demo or postgres.',503);
  return globalStore.crmStore;
}
