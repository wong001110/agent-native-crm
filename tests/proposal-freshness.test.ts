import { afterAll,beforeAll,expect,test } from 'vitest';
import { eq,and } from 'drizzle-orm';
import { createWorkspace,loadData } from '@/lib/db/repository';
import { getDb,getPool } from '@/lib/db/client';
import { workspaces,deals,proposals } from '@/lib/db/schema';
import { proposeTask } from '@/lib/actions';
let workspaceId:string;
beforeAll(async()=>{workspaceId=await createWorkspace();});
afterAll(async()=>{await getDb().delete(workspaces).where(eq(workspaces.id,workspaceId));await getPool().end();});
test('P4-R1-C3: context changed before proposal creation is rejected, not rebound to a new version',async()=>{
  const old=(await loadData(workspaceId)).deals.find(d=>d.id==='acme')!.updatedAt;
  await getDb().update(deals).set({updatedAt:new Date().toISOString()}).where(and(eq(deals.workspaceId,workspaceId),eq(deals.id,'acme')));
  await expect(proposeTask(workspaceId,{dealId:'acme',title:'Fresh context required',dueDate:new Date(Date.now()+86400000).toISOString().slice(0,10)},null,old)).rejects.toMatchObject({code:'STALE'});
  expect(await getDb().select().from(proposals).where(eq(proposals.workspaceId,workspaceId))).toHaveLength(0);
});
