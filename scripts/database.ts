// Run with: NODE_OPTIONS=--conditions=react-server npm run db:setup
import { createStore, snapshot, summarize } from '../src/lib/db/store';
const store = await createStore({url:process.env.DATABASE_URL || undefined, dataDir:process.env.PGLITE_DATA_DIR || '.data/crm',initialize:true});
try { console.log('Seeded synthetic CRM:', summarize(await snapshot(store))); } finally { await store.close(); }
