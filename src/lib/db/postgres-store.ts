import postgres from 'postgres';
import {drizzle} from 'drizzle-orm/postgres-js';
import {and,desc,eq,isNull,or} from 'drizzle-orm';
import {activitySchema,dealSchema,taskSchema,type AgentRun,type Proposal} from '../contracts';
import {AppError,assertProposal,taskFromProposal} from '../domain';
import type {Store} from '../store';
import * as tables from './schema';
export class PostgresStore implements Store {
  readonly client:ReturnType<typeof postgres>;
  readonly db;
  constructor(url:string){this.client=postgres(url,{max:5,idle_timeout:20,connect_timeout:10,prepare:false});this.db=drizzle(this.client);}
  async close(){await this.client.end();}
  async snapshot(sessionId:string){
    const [customers,deals,activities,tasks]=await Promise.all([this.db.select().from(tables.customers),this.db.select().from(tables.deals),this.db.select().from(tables.activities).where(or(isNull(tables.activities.sessionId),eq(tables.activities.sessionId,sessionId))),this.db.select().from(tables.tasks).where(eq(tables.tasks.sessionId,sessionId))]);
    return {customers,deals:deals.map(d=>dealSchema.parse(d)),activities:activities.map(a=>activitySchema.parse(a)),tasks:tasks.map(t=>taskSchema.parse(t))};
  }
  async saveRun(run:AgentRun){await this.db.insert(tables.runs).values({id:run.id,sessionId:run.sessionId,createdAt:run.createdAt,payload:run}).onConflictDoUpdate({target:tables.runs.id,set:{payload:run},setWhere:eq(tables.runs.sessionId,run.sessionId)});}
  async getRun(id:string,sessionId:string){const [row]=await this.db.select().from(tables.runs).where(and(eq(tables.runs.id,id),eq(tables.runs.sessionId,sessionId)));return row?.payload??null;}
  async listRuns(sessionId:string){return (await this.db.select().from(tables.runs).where(eq(tables.runs.sessionId,sessionId)).orderBy(desc(tables.runs.createdAt)).limit(20)).map(r=>r.payload);}
  async saveProposal(p:Proposal){const [d]=await this.db.select({id:tables.deals.id}).from(tables.deals).where(eq(tables.deals.id,p.draft.dealId));if(!d)throw new AppError('NOT_FOUND','The deal does not exist.',404);await this.db.insert(tables.proposals).values({id:p.id,sessionId:p.sessionId,payload:p});}
  async getProposal(id:string,sessionId:string){const [r]=await this.db.select().from(tables.proposals).where(and(eq(tables.proposals.id,id),eq(tables.proposals.sessionId,sessionId)));return r?.payload??null;}
  async approve(id:string,sessionId:string){return this.db.transaction(async tx=>{
    const [row]=await tx.select().from(tables.proposals).where(and(eq(tables.proposals.id,id),eq(tables.proposals.sessionId,sessionId))).for('update');
    const p=assertProposal(row?.payload,sessionId);
    if(p.status==='approved'){const [task]=await tx.select().from(tables.tasks).where(eq(tables.tasks.proposalId,id));if(!task)throw new AppError('INTEGRITY','The action receipt is missing.',500);return taskSchema.parse(task);}
    const [deal]=await tx.select().from(tables.deals).where(eq(tables.deals.id,p.draft.dealId));if(!deal)throw new AppError('NOT_FOUND','The deal no longer exists.',409);
    const task=taskFromProposal(p);await tx.insert(tables.tasks).values(task);
    await tx.insert(tables.activities).values({id:`act-${task.id}`,dealId:task.dealId,at:task.createdAt,kind:'task',text:`Follow-up task created: ${task.title}`,sessionId});
    await tx.update(tables.proposals).set({payload:{...p,status:'approved',taskId:task.id}}).where(eq(tables.proposals.id,id));
    return task;
  });}
  async reject(id:string,sessionId:string){return this.db.transaction(async tx=>{
    const [row]=await tx.select().from(tables.proposals).where(and(eq(tables.proposals.id,id),eq(tables.proposals.sessionId,sessionId))).for('update');
    if(!row)throw new AppError('NOT_FOUND','This action is not available.',404);if(row.payload.status==='approved')throw new AppError('ALREADY_APPROVED','This action already completed.',409);
    const p:Proposal={...row.payload,status:'rejected'};await tx.update(tables.proposals).set({payload:p}).where(eq(tables.proposals.id,id));return p;
  });}
}
