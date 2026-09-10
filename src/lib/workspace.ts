import { z } from 'zod';
import type { Activity, Customer, Deal, Insight, Workspace, WorkspaceSpec } from './domain';
export const dateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>{const d=new Date(`${s}T00:00:00Z`);return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0,10)===s;},'Invalid date');
const insight=z.object({dealId:z.string().min(1).max(80),interpretation:z.string().min(1).max(500),evidenceIds:z.array(z.string().max(100)).max(12),emphasis:z.enum(['risk','opportunity','watch','neutral'])}).strict();
export const actionInput=z.object({dealId:z.string().min(1).max(80),title:z.string().trim().min(3).max(120),dueDate:dateSchema}).strict();
const action=actionInput.extend({type:z.literal('create_task')}).strict();
const common={title:z.string().min(1).max(100),summary:z.string().min(1).max(700),action:action.optional()};
export const workspaceSchema=z.discriminatedUnion('type',[
  z.object({...common,type:z.literal('focus'),items:z.array(insight).max(8)}).strict(),
  z.object({...common,type:z.literal('investigation'),items:z.array(insight).length(1)}).strict(),
  z.object({...common,type:z.literal('comparison'),items:z.array(insight).min(2).max(4)}).strict(),
]);
export type Observations={deals:Map<string,Deal>;customers:Map<string,Customer>;activities:Map<string,Activity>};
export function newObservations():Observations {return {deals:new Map(),customers:new Map(),activities:new Map()};}
export function hydrateWorkspace(input:WorkspaceSpec,seen:Observations,totalDeals:number):Workspace {
  const spec=workspaceSchema.parse(input); const ids=new Set<string>();
  const records=spec.items.map((item:Insight)=>{
    if(ids.has(item.dealId)) throw new Error('Duplicate record reference'); ids.add(item.dealId);
    const deal=seen.deals.get(item.dealId); if(!deal) throw new Error('Record was not retrieved by an approved tool');
    const customer=seen.customers.get(deal.customerId); if(!customer) throw new Error('Customer was not retrieved');
    if(item.emphasis!=='neutral' && item.evidenceIds.length===0) throw new Error('Interpretive emphasis requires retrieved evidence');
    const evidence=item.evidenceIds.map(id=>{const a=seen.activities.get(id);if(!a||a.dealId!==deal.id)throw new Error('Evidence was not retrieved for this deal');return a;});
    const timeline=[...seen.activities.values()].filter(a=>a.dealId===deal.id).sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt));
    return {deal,customer,evidence,timeline};
  });
  if(spec.action && !ids.has(spec.action.dealId)) throw new Error('The action target must be a displayed, retrieved deal');
  const dates=[...seen.activities.values()].map(a=>a.occurredAt).sort();
  return {spec,records,scope:{retrievedDeals:seen.deals.size,totalDeals,retrievedActivities:seen.activities.size,retrievedAt:new Date().toISOString(),oldestActivity:dates[0]??null,newestActivity:dates.at(-1)??null},proposal:null};
}
