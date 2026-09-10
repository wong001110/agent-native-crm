import { z } from 'zod';

export const stageSchema = z.enum(['Discovery', 'Qualified', 'Proposal', 'Negotiation']);
export const customerSchema = z.object({id:z.string(),name:z.string(),industry:z.string(),contact:z.string(),email:z.string()});
export const dealSchema = z.object({id:z.string(),customerId:z.string(),name:z.string(),value:z.number().int().nonnegative(),stage:stageSchema,owner:z.string(),closeDate:z.iso.date()});
export const activitySchema = z.object({id:z.string(),dealId:z.string(),at:z.iso.datetime(),kind:z.enum(['email','meeting','note','task']),text:z.string(),sessionId:z.string().nullable()});
export const taskDraftSchema = z.object({dealId:z.string().min(1).max(80),title:z.string().trim().min(3).max(140),note:z.string().trim().max(800),dueDate:z.iso.date()}).strict();
export const taskSchema = taskDraftSchema.extend({id:z.string(),sessionId:z.string(),proposalId:z.string(),createdAt:z.string(),status:z.literal('open')});
export const proposalSchema = z.object({id:z.string(),sessionId:z.string(),runId:z.string().nullable(),draft:taskDraftSchema,status:z.enum(['pending','approved','rejected']),createdAt:z.string(),expiresAt:z.string(),taskId:z.string().nullable()});
export const toolEventSchema = z.object({id:z.string(),tool:z.string(),status:z.enum(['running','succeeded','failed']),at:z.string(),detail:z.string()});
const itemPlan = z.object({dealId:z.string(),signal:z.enum(['attention','opportunity','watch','neutral']),interpretation:z.string().min(1).max(500),evidenceIds:z.array(z.string()).max(8)}).strict();
const common = {title:z.string().min(1).max(100),summary:z.string().max(700),proposalId:z.string().nullable()};
export const workspacePlanSchema = z.object({workspace:z.discriminatedUnion('type',[
  z.object({...common,type:z.literal('focus'),items:z.array(itemPlan).max(5)}).strict(),
  z.object({...common,type:z.literal('investigation'),items:z.array(itemPlan).length(1)}).strict(),
  z.object({...common,type:z.literal('comparison'),items:z.array(itemPlan).min(2).max(4)}).strict(),
])}).strict();
export type Customer=z.infer<typeof customerSchema>;
export type Deal=z.infer<typeof dealSchema>;
export type Activity=z.infer<typeof activitySchema>;
export type TaskDraft=z.infer<typeof taskDraftSchema>;
export type Task=z.infer<typeof taskSchema>;
export type Proposal=z.infer<typeof proposalSchema>;
export type ToolEvent=z.infer<typeof toolEventSchema>;
export type WorkspacePlan=z.infer<typeof workspacePlanSchema>['workspace'];
export type PublicProposal=Omit<Proposal,'sessionId'>;
export type Snapshot={customers:Customer[];deals:Deal[];activities:Activity[];tasks:Task[]};
export type Summary={deals:number;customers:number;pipelineValue:number;tasks:number;byStage:Record<string,number>};
export type WorkspaceItem={deal:Deal;customer:Customer;signal:z.infer<typeof itemPlan>['signal'];interpretation:string;evidence:Activity[];timeline:Activity[]};
export type Workspace={runId:string;type:WorkspacePlan['type'];title:string;summary:string;items:WorkspaceItem[];proposal:PublicProposal|null;scope:{totalDeals:number;examinedDeals:number;detailedDeals:number;activityWindow:string;checkedAt:string};mode:'mock'|'live'};
export type AgentRun={id:string;sessionId:string;prompt:string;mode:'mock'|'live';model:string;status:'running'|'succeeded'|'failed'|'cancelled';createdAt:string;finishedAt:string|null;workspace:Workspace|null;events:ToolEvent[];error:string|null;usage:{inputTokens:number;outputTokens:number}|null};
export type PublicRun=Omit<AgentRun,'sessionId'>;
export type AgentEvent={type:'started';runId:string;mode:'mock'|'live'}|{type:'tool';event:ToolEvent}|{type:'workspace';workspace:Workspace}|{type:'error';message:string;runId?:string};
export const requestSchema=z.object({prompt:z.string().trim().min(1).max(1200),contextDealIds:z.array(z.string().max(80)).max(4).default([])}).strict();
export const actionRequestSchema=z.discriminatedUnion('intent',[
  z.object({intent:z.literal('prepare'),draft:taskDraftSchema}).strict(),
  z.object({intent:z.literal('approve'),proposalId:z.string().uuid()}).strict(),
  z.object({intent:z.literal('reject'),proposalId:z.string().uuid()}).strict(),
]);
export function publicProposal(p:Proposal):PublicProposal { const {sessionId:_,...safe}=p; return safe; }
export function publicRun(r:AgentRun):PublicRun { const {sessionId:_,...safe}=r; return safe; }
