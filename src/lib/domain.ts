import {randomUUID} from 'node:crypto';
import {taskDraftSchema,type Snapshot,type Summary,type Proposal,type Task,type TaskDraft} from './contracts';
export class AppError extends Error { constructor(public code:string,message:string,public status=400){super(message);this.name='AppError';} }
export function summaryOf(s:Snapshot):Summary{return {deals:s.deals.length,customers:s.customers.length,pipelineValue:s.deals.reduce((n,d)=>n+d.value,0),tasks:s.tasks.length,byStage:s.deals.reduce<Record<string,number>>((m,d)=>({...m,[d.stage]:(m[d.stage]??0)+1}),{})};}
export function draftProposal(sessionId:string,draft:TaskDraft,runId:string|null,now=new Date()):Proposal {
  return {id:randomUUID(),sessionId,runId,draft:taskDraftSchema.parse(draft),status:'pending',createdAt:now.toISOString(),expiresAt:new Date(now.getTime()+30*60_000).toISOString(),taskId:null};
}
export function assertProposal(p:Proposal|undefined,sessionId:string,now=new Date()):Proposal {
  if(!p||p.sessionId!==sessionId) throw new AppError('NOT_FOUND','This action is not available in this session.',404);
  if(p.status==='rejected') throw new AppError('ACTION_REJECTED','This action was rejected. Prepare a new proposal.',409);
  if(p.status==='pending'&&Date.parse(p.expiresAt)<=now.getTime()) throw new AppError('ACTION_EXPIRED','This proposal expired. Prepare it again.',409);
  return p;
}
export function taskFromProposal(p:Proposal,now=new Date()):Task{return {...p.draft,id:randomUUID(),sessionId:p.sessionId,proposalId:p.id,status:'open',createdAt:now.toISOString()};}
export function safeError(error:unknown):{message:string;status:number} {
  if(error instanceof AppError)return {message:error.message,status:error.status};
  if(error instanceof Error&&['AbortError','TimeoutError'].includes(error.name))return {message:'The run stopped or timed out. Your CRM data is unchanged.',status:408};
  return {message:'The request could not be completed. Retry or use Explore. No unapproved CRM change was made.',status:500};
}
