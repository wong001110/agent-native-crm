import 'server-only';
import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { getDb } from './db/client';
import * as t from './db/schema';
import { AppError } from './config';
import { actionInput } from './workspace';
import type { Proposal } from './domain';
export async function proposeTask(workspaceId:string,input:unknown,runId:string|null=null):Promise<Proposal> {
  const parsed=actionInput.safeParse(input); if(!parsed.success)throw new AppError('VALIDATION','Task proposal has invalid fields.');
  const value=parsed.data; const today=new Date().toISOString().slice(0,10);
  if(value.dueDate<today || value.dueDate>new Date(Date.now()+366*86400000).toISOString().slice(0,10))throw new AppError('DATE','Choose a due date from today through the next year.');
  const [deal]=await getDb().select().from(t.deals).where(and(eq(t.deals.workspaceId,workspaceId),eq(t.deals.id,value.dealId)));
  if(!deal)throw new AppError('NOT_FOUND','Deal not found in this workspace.',404);
  const [proposal]=await getDb().insert(t.proposals).values({id:randomUUID(),workspaceId,runId,...value,dealVersion:deal.updatedAt,expiresAt:new Date(Date.now()+30*60000).toISOString()}).returning();
  return proposal;
}
export async function decideProposal(workspaceId:string,proposalId:string,decision:'approve'|'reject') {
  return getDb().transaction(async tx=> {
    const [p]=await tx.select().from(t.proposals).where(and(eq(t.proposals.workspaceId,workspaceId),eq(t.proposals.id,proposalId))).for('update');
    if(!p)throw new AppError('NOT_FOUND','Proposal not found in this workspace.',404);
    if(p.status==='approved') { if(decision==='reject')throw new AppError('CONFLICT','This task was already created; rejection is not an undo.',409);return {status:'approved',taskId:p.taskId,replayed:true}; }
    if(p.status==='rejected') { if(decision==='approve')throw new AppError('CONFLICT','A rejected proposal cannot be approved.',409);return {status:'rejected',taskId:null,replayed:true}; }
    if(decision==='reject') {await tx.update(t.proposals).set({status:'rejected'}).where(eq(t.proposals.id,p.id));return {status:'rejected',taskId:null,replayed:false};}
    if(new Date(p.expiresAt).valueOf()<Date.now())throw new AppError('EXPIRED','This proposal expired. Prepare a fresh proposal before approving.',409);
    const [deal]=await tx.select().from(t.deals).where(and(eq(t.deals.workspaceId,workspaceId),eq(t.deals.id,p.dealId)));
    if(!deal || new Date(deal.updatedAt).valueOf()!==new Date(p.dealVersion).valueOf())throw new AppError('STALE','The deal changed after this proposal. Review a fresh proposal.',409);
    if(p.runId) {const [run]=await tx.select().from(t.runs).where(and(eq(t.runs.id,p.runId),eq(t.runs.workspaceId,workspaceId)));if(run?.status!=='completed')throw new AppError('RUN','The originating agent run has not completed successfully.',409);}
    const taskId=randomUUID();
    await tx.insert(t.tasks).values({id:taskId,workspaceId,dealId:p.dealId,proposalId:p.id,title:p.title,dueDate:p.dueDate,status:'open'});
    await tx.insert(t.activities).values({workspaceId,id:`task-${taskId}`,dealId:p.dealId,kind:'task',summary:`Follow-up task created after human approval: ${p.title}`,occurredAt:new Date().toISOString()});
    await tx.update(t.proposals).set({status:'approved',taskId}).where(eq(t.proposals.id,p.id));
    return {status:'approved',taskId,replayed:false};
  });
}
