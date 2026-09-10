import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { loadData } from '@/lib/db/repository';
import { summarize, stages, type CrmData, type ToolEvent } from '@/lib/domain';
import { AppError } from '@/lib/config';
import type { Observations } from '@/lib/workspace';

const customerSchema=z.object({id:z.string(),name:z.string(),domain:z.string(),industry:z.string(),owner:z.string()});
const dealSchema=z.object({id:z.string(),customerId:z.string(),name:z.string(),value:z.number().int().nonnegative(),stage:z.enum(stages),closeDate:z.string(),updatedAt:z.string()});
const activitySchema=z.object({id:z.string(),dealId:z.string(),kind:z.string(),summary:z.string(),occurredAt:z.string()});
const taskSchema=z.object({id:z.string(),dealId:z.string(),title:z.string(),dueDate:z.string(),status:z.string(),createdAt:z.string()});
const dataSchema=z.object({customers:z.array(customerSchema),deals:z.array(dealSchema),activities:z.array(activitySchema),tasks:z.array(taskSchema)});
const idSchema=z.string().min(1).max(80);
export const listInput=z.object({activeOnly:z.boolean().optional(),minValue:z.number().min(0).max(1000000000).optional(),stage:z.enum(stages).optional()}).strict();
export const activitiesInput=z.object({dealIds:z.array(idSchema).max(8).optional(),days:z.number().int().min(1).max(365).optional()}).strict();

/** All tools resolve inside one server-authenticated workspace. No arbitrary SQL or network access. */
export function createCrmTools(workspaceId:string,seen:Observations,emit:(event:ToolEvent)=>void,signal?:AbortSignal){
  let calls=0;
  const read=async(name:string,fn:(data:CrmData)=>unknown)=>{
    signal?.throwIfAborted();
    if(++calls>18) throw new AppError('TOOL_BUDGET','This run reached its tool budget. Try a narrower request.',429);
    emit({tool:name,status:'running',message:'Reading source records',at:new Date().toISOString()});
    try {
      const data=dataSchema.parse(await loadData(workspaceId));
      signal?.throwIfAborted();
      const result=fn(data);
      emit({tool:name,status:'completed',message:'Source records retrieved',at:new Date().toISOString()});
      return result;
    } catch(error){
      emit({tool:name,status:'failed',message:'Source query did not complete',at:new Date().toISOString()});
      throw error;
    }
  };
  const rememberDeals=(data:CrmData,ids:string[])=>{
    data.deals.filter(d=>ids.includes(d.id)).forEach(d=>seen.deals.set(d.id,d));
    data.customers.filter(c=>data.deals.some(d=>ids.includes(d.id)&&d.customerId===c.id)).forEach(c=>seen.customers.set(c.id,c));
  };
  const handlers={
    get_crm_summary:async()=>read('get_crm_summary',data=>summarize(data)),
    list_deals:async(raw:z.infer<typeof listInput>)=>{
      const input=listInput.parse(raw);
      return read('list_deals',data=>{
        const matches=data.deals.filter(d=>(!input.activeOnly||!['Won','Lost'].includes(d.stage))&&d.value>=(input.minValue??0)&&(!input.stage||d.stage===input.stage));
        const deals=matches.slice(0,8);rememberDeals(data,deals.map(d=>d.id));
        return {deals,customers:data.customers.filter(c=>deals.some(d=>d.customerId===c.id)),totalMatching:matches.length,totalDeals:data.deals.length,truncated:matches.length>deals.length};
      });
    },
    get_deal:async(raw:{dealId:string})=>{
      const {dealId}=z.object({dealId:idSchema}).strict().parse(raw);
      return read('get_deal',data=>{
        const deal=data.deals.find(d=>d.id===dealId);if(!deal)throw new AppError('NOT_FOUND','Deal not found in this workspace.',404);
        rememberDeals(data,[dealId]);return {deal,customer:data.customers.find(c=>c.id===deal.customerId)};
      });
    },
    get_account_context:async(raw:{dealId:string})=>{
      const {dealId}=z.object({dealId:idSchema}).strict().parse(raw);
      return read('get_account_context',data=>{
        const deal=data.deals.find(d=>d.id===dealId);if(!deal)throw new AppError('NOT_FOUND','Deal not found in this workspace.',404);
        rememberDeals(data,[dealId]);
        const activities=data.activities.filter(a=>a.dealId===dealId).slice(0,50);activities.forEach(a=>seen.activities.set(a.id,a));
        return {deal,customer:data.customers.find(c=>c.id===deal.customerId),activities,tasks:data.tasks.filter(t=>t.dealId===dealId).slice(0,50),activitiesTruncated:data.activities.filter(a=>a.dealId===dealId).length>50};
      });
    },
    get_recent_activities:async(raw:z.infer<typeof activitiesInput>)=>{
      const input=activitiesInput.parse(raw);const since=new Date(Date.now()-(input.days??30)*86400000).toISOString();
      return read('get_recent_activities',data=>{
        if(input.dealIds?.some(id=>!data.deals.some(d=>d.id===id)))throw new AppError('NOT_FOUND','A requested deal was not found in this workspace.',404);
        const matches=data.activities.filter(a=>(!input.dealIds||input.dealIds.includes(a.dealId))&&a.occurredAt>=since);
        const activities=matches.slice(0,100);activities.forEach(a=>seen.activities.set(a.id,a));
        return {activities,totalMatching:matches.length,truncated:matches.length>activities.length,since,until:new Date().toISOString()};
      });
    },
  };
  return {handlers,tools:{
    get_crm_summary:tool({description:'Read exact CRM counts and active pipeline value. This does not retrieve deal evidence.',inputSchema:z.object({}).strict(),execute:handlers.get_crm_summary}),
    list_deals:tool({description:'Find up to eight deals and their customers; optional active/value/stage filters. Use returned IDs, never guess IDs.',inputSchema:listInput,execute:handlers.list_deals}),
    get_deal:tool({description:'Read one exact deal and customer by a known ID.',inputSchema:z.object({dealId:idSchema}).strict(),execute:handlers.get_deal}),
    get_account_context:tool({description:'Read one known deal with its customer, recorded activities and open/completed tasks. Useful for investigation and follow-up planning.',inputSchema:z.object({dealId:idSchema}).strict(),execute:handlers.get_account_context}),
    get_recent_activities:tool({description:'Read source activities for known deal IDs, optionally within the last N days. Evidence IDs from here may support interpretations.',inputSchema:activitiesInput,execute:handlers.get_recent_activities}),
  }};
}
export type CrmToolHandlers=ReturnType<typeof createCrmTools>['handlers'];
