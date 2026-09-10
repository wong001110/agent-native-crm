import 'server-only';
import { createCrmTools } from './tools';
import { newObservations, hydrateWorkspace } from '@/lib/workspace';
import { AppError } from '@/lib/config';
import type { Insight, Run, ToolEvent, WorkspaceSpec, Deal, Activity } from '@/lib/domain';

/** Explicit fixture driver, NOT an LLM. The live adapter never calls this module. */
export async function runFixture(args:{workspaceId:string;prompt:string;totalDeals:number;previous?:Run;signal:AbortSignal;emit:(event:ToolEvent)=>void}){
  const seen=newObservations();const {handlers}=createCrmTools(args.workspaceId,seen,args.emit,args.signal);
  const text=args.prompt.toLowerCase();
  const supported=/focus|attention|priorit|today|why|happen|investigat|compare|follow.?up|task|deal|客戶|比較|跟進|關注|為什麼/;
  if(!supported.test(text))throw new AppError('FIXTURE_LIMIT','Fixture mode supports the example CRM questions, not general conversation. Use Live mode for real model interpretation.',422);
  await handlers.list_deals({});
  const named=[...seen.deals.values()].filter(d=>text.includes(d.id));
  const previousId=args.previous?.workspace?.spec.items[0]?.dealId;
  const makeInsight=(deal:Deal):Insight=>{
    const activities=[...seen.activities.values()].filter(a=>a.dealId===deal.id);
    const security=activities.find(a=>/security.*no answer/i.test(a.summary));
    const budget=activities.find(a=>/buyer confirmed.*budget/i.test(a.summary));
    const procurement=activities.find(a=>/procurement joined/i.test(a.summary));
    const chosen:Activity[]=security?[security]:budget&&procurement?[budget,procurement]:activities.slice(0,2);
    return {dealId:deal.id,emphasis:security?'risk':budget&&procurement?'opportunity':'neutral',evidenceIds:chosen.map(a=>a.id),interpretation:security?'The recorded security questions may be slowing technical approval. A focused follow-up could clarify the blocker.':budget&&procurement?'Budget confirmation and procurement involvement suggest useful momentum. Clarify the remaining approvals before assuming a close.':'Review the recorded activity and confirm the next step with the account owner. The available evidence does not establish a new blocker.'};
  };
  let spec:WorkspaceSpec;
  if(/compare|比較/.test(text)){
    const ids=named.length>=2?named.slice(0,4).map(d=>d.id):['acme','nova'];
    for(const dealId of ids)await handlers.get_account_context({dealId});
    spec={type:'comparison',title:'A clearer view of the differences',summary:'Fixture interpretation. Values and activities below come directly from the CRM. Compare evidence, not a synthetic confidence score.',items:ids.map(id=>makeInsight(seen.deals.get(id)!))};
  }else if(/why|happen|investigat|follow.?up|task|為什麼|跟進/.test(text)){
    const dealId=named[0]?.id??previousId;
    if(!dealId)throw new AppError('FIXTURE_CONTEXT','Choose a deal first, for example “What happened with ACME?”.',422);
    await handlers.get_account_context({dealId});
    const deal=seen.deals.get(dealId)!;
    spec={type:'investigation',title:`${seen.customers.get(deal.customerId)!.name} — what changed`,summary:'Fixture interpretation based on the retrieved account record and its activity history. Open the evidence to verify the source.',items:[makeInsight(deal)]};
    if(/follow.?up|task|跟進/.test(text))spec.action={type:'create_task',dealId,title:`Follow up on ${seen.customers.get(deal.customerId)!.name}: clarify next steps`,dueDate:new Date(Date.now()+86400000).toISOString().slice(0,10)};
  }else{
    const amount=text.match(/(?:over|above|more than)\s*(?:rm\s*)?([\d,]+)(k)?/);
    const minValue=amount?Number(amount[1].replaceAll(',',''))*(amount[2]?1000:1):0;
    const active=[...seen.deals.values()].filter(d=>!['Won','Lost'].includes(d.stage)&&d.value>=minValue);
    await handlers.get_recent_activities({dealIds:active.map(d=>d.id),days:30});
    const items=active.map(makeInsight);const priority=items.filter(i=>i.emphasis!=='neutral');
    spec={type:'focus',title:active.length?'Your next useful moves':'No matching deals',summary:active.length?'Fixture interpretation. Start with the signals that deserve a closer look. Nothing has been changed.':'No active deals match that value filter. The rest of your CRM is still available in Explore.',items:amount?items:priority.length?priority:items.slice(0,3)};
  }
  args.signal.throwIfAborted();
  return hydrateWorkspace(spec,seen,args.totalDeals);
}
