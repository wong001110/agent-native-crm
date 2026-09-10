import { describe,it,expect } from 'vitest';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createStore,snapshot,summarize } from '../src/lib/db/store';
import { tasks } from '../src/lib/db/schema';
describe('deterministic source of record',()=>{
  it('has accurate totals and source relationships',async()=>{
    const store=await createStore({memory:true,now:'2026-09-11T01:00:00.000Z'});
    try {
      const data=await snapshot(store);
      expect(summarize(data)).toMatchObject({customers:8,deals:8,activeDeals:7,pipeline:405000,openTasks:1});
      expect(data.deals.every(d=>data.customers.some(c=>c.id===d.customerId))).toBe(true);
      expect(data.activities.every(a=>data.deals.some(d=>d.id===a.dealId))).toBe(true);
      expect(data.asOf).toBe('2026-09-11T01:00:00.000Z');
    }finally{await store.close();}
  });
  it('persists records across process-style reopening without reseeding',async()=>{
    const dir=await mkdtemp(path.join(tmpdir(),'agent-crm-'));
    try {
      const first=await createStore({dataDir:dir});
      await first.db.insert(tasks).values({id:'persist-test',dealId:'acme',title:'Persistence check',dueDate:'2026-09-12',status:'open',createdAt:new Date().toISOString()});
      await first.close();
      const second=await createStore({dataDir:dir});
      try {const data=await snapshot(second);expect(data.tasks.some(t=>t.id==='persist-test')).toBe(true);expect(data.deals).toHaveLength(8);}
      finally{await second.close();}
    }finally{await rm(dir,{recursive:true,force:true});}
  });
});
