import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {customerSchema,dealSchema,activitySchema,taskSchema,proposalSchema,type AgentRun,type Proposal} from './contracts';
import {AppError,assertProposal,taskFromProposal} from './domain';
import {seedSnapshot} from './seed';
import type {Store} from './store';
const diskSchema=z.object({version:z.literal(1),customers:z.array(customerSchema),deals:z.array(dealSchema),activities:z.array(activitySchema),tasks:z.array(taskSchema),proposals:z.array(proposalSchema),runs:z.array(z.custom<AgentRun>(v=>typeof v==='object'&&v!==null&&'id' in v&&'sessionId' in v))});
type Disk=z.infer<typeof diskSchema>;
const locks=new Map<string,Promise<unknown>>();
/** Single-process, file-backed demonstration adapter. Not a serverless database. */
export class DemoStore implements Store {
  private path:string;
  constructor(path='.data/crm.json'){this.path=resolve(path);}
  private async access<T>(write:boolean,fn:(data:Disk)=>T|Promise<T>):Promise<T>{
    const prior=locks.get(this.path)??Promise.resolve();
    const operation=prior.catch(()=>{}).then(async()=>{
      let data:Disk;
      try{data=diskSchema.parse(JSON.parse(await readFile(this.path,'utf8')));}
      catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')data={version:1,...seedSnapshot(),runs:[],proposals:[]};else throw new AppError('STORE_CORRUPT','Demo storage could not be read. Restore a backup; it was not silently reset.',500);}
      const result=await fn(data);
      if(write){await mkdir(dirname(this.path),{recursive:true});const tmp=`${this.path}.${randomUUID()}.tmp`;await writeFile(tmp,JSON.stringify(data),{mode:0o600});await rename(tmp,this.path);}
      return structuredClone(result);
    });
    locks.set(this.path,operation);
    try{return await operation;}finally{if(locks.get(this.path)===operation)locks.delete(this.path);}
  }
  snapshot(sessionId:string){return this.access(false,d=>({customers:d.customers,deals:d.deals,activities:d.activities.filter(a=>!a.sessionId||a.sessionId===sessionId),tasks:d.tasks.filter(t=>t.sessionId===sessionId)}));}
  saveRun(run:AgentRun){return this.access(true,d=>{const i=d.runs.findIndex(r=>r.id===run.id&&r.sessionId===run.sessionId);if(i>=0)d.runs[i]=run;else {if(d.runs.filter(r=>r.sessionId===run.sessionId).length>=100)throw new AppError('RUN_LIMIT','This demo session reached its 100-run limit.',429);d.runs.push(run);}});}
  getRun(id:string,sessionId:string){return this.access(false,d=>d.runs.find(r=>r.id===id&&r.sessionId===sessionId)??null);}
  listRuns(sessionId:string){return this.access(false,d=>d.runs.filter(r=>r.sessionId===sessionId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,20));}
  saveProposal(p:Proposal){return this.access(true,d=>{if(!d.deals.some(x=>x.id===p.draft.dealId))throw new AppError('NOT_FOUND','The deal does not exist.',404);if(d.proposals.some(x=>x.id===p.id))throw new AppError('CONFLICT','Proposal already exists.',409);d.proposals.push(p);});}
  getProposal(id:string,sessionId:string){return this.access(false,d=>d.proposals.find(p=>p.id===id&&p.sessionId===sessionId)??null);}
  approve(id:string,sessionId:string){return this.access(true,d=>{
    const p=assertProposal(d.proposals.find(x=>x.id===id),sessionId);
    if(p.status==='approved'){const old=d.tasks.find(t=>t.proposalId===p.id);if(!old)throw new AppError('INTEGRITY','The action receipt is missing. Contact the operator.',500);return old;}
    if(!d.deals.some(x=>x.id===p.draft.dealId))throw new AppError('NOT_FOUND','The deal no longer exists.',409);
    const task=taskFromProposal(p);d.tasks.push(task);p.status='approved';p.taskId=task.id;
    d.activities.push({id:`act-${task.id}`,dealId:task.dealId,at:task.createdAt,kind:'task',text:`Follow-up task created: ${task.title}`,sessionId});
    return task;
  });}
  reject(id:string,sessionId:string){return this.access(true,d=>{const p=d.proposals.find(x=>x.id===id&&x.sessionId===sessionId);if(!p)throw new AppError('NOT_FOUND','This action is not available.',404);if(p.status==='approved')throw new AppError('ALREADY_APPROVED','This action already completed.',409);p.status='rejected';return p;});}
}
