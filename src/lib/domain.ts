export const stages = ['Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'] as const;
export type Stage = (typeof stages)[number];
export type Customer = { id: string; name: string; domain: string; industry: string; owner: string };
export type Deal = { id: string; customerId: string; name: string; value: number; stage: Stage; closeDate: string; updatedAt: string };
export type Activity = { id: string; dealId: string; kind: string; summary: string; occurredAt: string };
export type Task = { id: string; dealId: string; title: string; dueDate: string; status: string; createdAt: string };
export type CrmData = { customers: Customer[]; deals: Deal[]; activities: Activity[]; tasks: Task[] };
export type Summary = { activeDeals: number; totalDeals: number; pipelineValue: number; customers: number; openTasks: number; updatedAt: string };
export type ToolEvent = { tool: string; status: 'running' | 'completed' | 'failed'; message: string; at: string };
export type Insight = { dealId: string; interpretation: string; evidenceIds: string[]; emphasis: 'risk' | 'opportunity' | 'watch' | 'neutral' };
export type WorkspaceSpec = { type: 'focus' | 'investigation' | 'comparison'; title: string; summary: string; items: Insight[]; action?: { type: 'create_task'; dealId: string; title: string; dueDate: string } };
export type Proposal = { id: string; dealId: string; title: string; dueDate: string; status: string; expiresAt: string; taskId: string | null };
export type Workspace = { spec: WorkspaceSpec; records: { deal: Deal; customer: Customer; evidence: Activity[]; timeline: Activity[] }[]; scope: { retrievedDeals: number; totalDeals: number; retrievedActivities: number; retrievedAt: string; oldestActivity: string | null; newestActivity: string | null }; proposal: Proposal | null };
export type Run = { id: string; prompt: string; mode: 'mock' | 'live'; status: string; createdAt: string; toolEvents: ToolEvent[]; workspace: Workspace | null };
export type AppState = { data: CrmData; summary: Summary; runs: Run[]; mode: 'mock' | 'live'; model: string; protected: boolean };
export type AgentEvent = { type: 'run'; runId: string; mode: 'mock' | 'live' } | { type: 'progress'; event: ToolEvent } | { type: 'result'; run: Run } | { type: 'error'; message: string };
export function summarize(data: CrmData): Summary {
  const active = data.deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  return { activeDeals: active.length, totalDeals: data.deals.length, pipelineValue: active.reduce((n,d)=>n+d.value,0), customers:data.customers.length, openTasks:data.tasks.filter(t=>t.status==='open').length, updatedAt:new Date().toISOString() };
}
export const money = (value: number) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits:0 }).format(value);
export const shortDate = (value: string) => new Intl.DateTimeFormat('en-GB', { day:'numeric', month:'short', timeZone:'Asia/Kuala_Lumpur' }).format(new Date(value));
