import {afterAll,describe,expect,it} from 'vitest';
import {randomUUID} from 'node:crypto';
import {PostgresStore} from '../src/lib/db/postgres-store';
import {draftProposal,summaryOf} from '../src/lib/domain';
const url=process.env.TEST_DATABASE_URL;
const store=url?new PostgresStore(url):null;
afterAll(async()=>{await store?.close();});
describe.skipIf(!store)('PostgreSQL integration (requires TEST_DATABASE_URL)',()=>{
  it('reads the seeded schema through Drizzle',async()=>{expect(summaryOf(await store!.snapshot(randomUUID())).deals).toBe(12);});
  it('atomically approves concurrently without duplicate task/activity',async()=>{
    const session=randomUUID();const p=draftProposal(session,{dealId:'deal-acme',title:'PG integration task',note:'Fixture',dueDate:'2026-09-12'},null);await store!.saveProposal(p);
    const result=await Promise.all([store!.approve(p.id,session),store!.approve(p.id,session)]);expect(result[0].id).toBe(result[1].id);
    const snapshot=await store!.snapshot(session);expect(snapshot.tasks).toHaveLength(1);expect(snapshot.activities.filter(a=>a.sessionId===session)).toHaveLength(1);
  });
  it('does not allow another session to approve or read a proposal',async()=>{const p=draftProposal(randomUUID(),{dealId:'deal-nova',title:'Private draft',note:'Fixture',dueDate:'2026-09-12'},null);await store!.saveProposal(p);expect(await store!.getProposal(p.id,'other')).toBeNull();await expect(store!.approve(p.id,'other')).rejects.toThrow('not available');});
});
