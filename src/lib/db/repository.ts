import 'server-only';
import { randomUUID } from 'node:crypto';
import { and, eq, desc, sql, count, gte } from 'drizzle-orm';
import { getDb } from './client';
import * as t from './schema';
import { summarize, type CrmData, type Run } from '@/lib/domain';
import { AppError } from '@/lib/config';
const day = 86400000;
export async function createWorkspace() {
  const id=randomUUID(); const now=Date.now();
  const at=(days:number)=>new Date(now+days*day).toISOString();
  const date=(days:number)=>at(days).slice(0,10);
  const seeds = [
    ['acme','ACME Industries','acme.example','Manufacturing',82000,'Proposal',18],
    ['nova','Nova Labs','nova.example','Technology',65000,'Negotiation',9],
    ['delta','Delta Logistics','delta.example','Logistics',41000,'Discovery',35],
    ['atlas','Atlas Health','atlas.example','Healthcare',96000,'Proposal',24],
    ['cedar','Cedar & Co.','cedar.example','Retail',32000,'Discovery',40],
    ['orbit','Orbit Studio','orbit.example','Design',28000,'Negotiation',14],
    ['haven','Haven Energy','haven.example','Energy',74000,'Won',-4],
    ['field','Fieldwork','field.example','Services',19000,'Lost',-10],
  ] as const;
  await getDb().transaction(async tx=> {
    await tx.insert(t.workspaces).values({id});
    await tx.insert(t.customers).values(seeds.map(([key,name,domain,industry])=>({workspaceId:id,id:key,name,domain,industry,owner:'Alex Morgan'})));
    await tx.insert(t.deals).values(seeds.map(([key,name,,,value,stage,close])=>({workspaceId:id,id:key,customerId:key,name:`${name} · Platform rollout`,value,stage,closeDate:date(close),updatedAt:at(-1)})));
    const events:[string,string,string,string,number][]=[
      ['acme-meeting','acme','meeting','Procurement confirmed budget; technical approval remains outstanding.',-14],
      ['acme-proposal','acme','document','Proposal shared with the buying committee.',-11],
      ['acme-security','acme','email','Security team requested answers to three questions. No answer has been recorded.',-8],
      ['acme-view','acme','document','Procurement opened the proposal again. This is not a confirmation of purchase.',-1],
      ['nova-budget','nova','meeting','Buyer confirmed the proposed budget and asked about implementation dates.',-3],
      ['nova-procurement','nova','email','Procurement joined the conversation and requested a closing checklist.',-1],
      ['nova-next','nova','note','Account owner noted that a next-step meeting would help clarify the remaining approvals.',0],
      ['delta-call','delta','call','Discovery call completed; buyer is still defining requirements.',-4],
      ['atlas-legal','atlas','email','Legal review scheduled for next week. No blocker reported.',-2],
      ['cedar-discovery','cedar','meeting','Initial needs discussion; budget has not been confirmed.',-5],
      ['orbit-scope','orbit','note','Scope agreed in principle; buyer is reviewing the implementation plan.',-2],
      ['haven-won','haven','note','Signed agreement recorded. Opportunity marked Won.',-4],
      ['field-lost','field','note','Buyer postponed the project. Opportunity marked Lost.',-10],
    ];
    await tx.insert(t.activities).values(events.map(([key,dealId,kind,summary,ago])=>({workspaceId:id,id:key,dealId,kind,summary,occurredAt:at(ago)})));
    await tx.insert(t.tasks).values({id:randomUUID(),workspaceId:id,dealId:'atlas',title:'Prepare for the scheduled legal review',dueDate:date(5),status:'open'});
  });
  return id;
}
export async function loadData(workspaceId:string):Promise<CrmData> {
  const db=getDb();
  const [customers,deals,activities,tasks]=await Promise.all([
    db.select().from(t.customers).where(eq(t.customers.workspaceId,workspaceId)).orderBy(t.customers.name),
    db.select().from(t.deals).where(eq(t.deals.workspaceId,workspaceId)).orderBy(t.deals.id),
    db.select().from(t.activities).where(eq(t.activities.workspaceId,workspaceId)).orderBy(desc(t.activities.occurredAt)),
    db.select().from(t.tasks).where(eq(t.tasks.workspaceId,workspaceId)).orderBy(desc(t.tasks.createdAt)),
  ]);
  return {customers,deals,activities,tasks};
}
export async function getRecentRuns(workspaceId:string):Promise<Run[]> {
  const rows=await getDb().select().from(t.runs).where(eq(t.runs.workspaceId,workspaceId)).orderBy(desc(t.runs.createdAt)).limit(12);
  return Promise.all(rows.map(row=>hydrateRun(row,workspaceId)));
}
export async function getRun(workspaceId:string,id:string) {
  const [run]=await getDb().select().from(t.runs).where(and(eq(t.runs.workspaceId,workspaceId),eq(t.runs.id,id)));
  if (!run) throw new AppError('NOT_FOUND','Run not found in this workspace.',404);
  return hydrateRun(run,workspaceId);
}
async function hydrateRun(run:Run,workspaceId:string):Promise<Run>{
  if(!run.workspace?.proposal)return run;
  const [proposal]=await getDb().select().from(t.proposals).where(and(eq(t.proposals.workspaceId,workspaceId),eq(t.proposals.id,run.workspace.proposal.id)));
  return {...run,workspace:{...run.workspace,proposal:proposal??null}};
}
export async function beginRun(workspaceId:string,prompt:string,mode:'mock'|'live'):Promise<Run> {
  return getDb().transaction(async tx=> {
    // A short global admission lock makes rate-limit checks atomic across sessions.
    await tx.execute(sql`select pg_advisory_xact_lock(792416)`);
    const since=new Date(Date.now()-60000).toISOString();
    const [{n}]=await tx.select({n:count()}).from(t.runs).where(and(eq(t.runs.workspaceId,workspaceId),gte(t.runs.createdAt,since)));
    const [{n:globalN}]=await tx.select({n:count()}).from(t.runs).where(gte(t.runs.createdAt,since));
    if(n>=8 || globalN>=60) throw new AppError('RATE_LIMIT','The demo run budget has been reached. Try again in a minute.',429);
    const [run]=await tx.insert(t.runs).values({id:randomUUID(),workspaceId,prompt,mode,status:'running'}).returning();
    return run;
  });
}
export async function getAppData(workspaceId:string) {
  const [data,runs]=await Promise.all([loadData(workspaceId),getRecentRuns(workspaceId)]);
  return {data,summary:summarize(data),runs};
}
