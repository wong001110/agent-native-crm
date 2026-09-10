import {MockLanguageModelV3} from 'ai/test';
import type {WorkspacePlan} from '../contracts';
import type {Observed} from './tools';
/** Scripted demonstration provider. Never used as a fallback for a failed live call. */
export function createDemoModel(prompt:string,contextDealIds:string[],ctx:Observed){
  let step=0;let selected:string[]=[];let kind:WorkspacePlan['type']='focus';let unsupported=false;
  const query=prompt.toLowerCase();
  const wantsTask=/(task|任務|任务)/i.test(query)&&/(create|prepare|add|建立|创建|創建|準備|准备)/i.test(query);
  const wantsCompare=/(compar|比較|比较|對比|对比)/i.test(query);
  const wantsFocus=/(focus|priorit|attention|today|pipeline|今天|重點|重点|優先|优先)/i.test(query);
  function response(content:({type:'text';text:string}|{type:'tool-call';toolCallId:string;toolName:string;input:string})[],calls=false){return {content,finishReason:{unified:calls?'tool-calls' as const:'stop' as const,raw:undefined},usage:{inputTokens:{total:0,noCache:0,cacheRead:undefined,cacheWrite:undefined},outputTokens:{total:0,text:0,reasoning:undefined}},warnings:[]};}
  const call=(toolName:string,input:object,index=0)=>({type:'tool-call' as const,toolCallId:`demo-${step}-${index}`,toolName,input:JSON.stringify(input)});
  return new MockLanguageModelV3({provider:'scripted-demo',modelId:'scripted-demo-not-an-llm',doGenerate:async()=>{
    step++;
    if(step===1)return response([call('get_crm_summary',{}),call('list_deals',{},1)],true);
    if(step===2){
      selected=[...ctx.deals.values()].filter(d=>query.includes(d.customerId)).map(d=>d.id);
      if(!selected.length&&contextDealIds.length)selected=contextDealIds.filter(id=>ctx.deals.has(id));
      if(wantsCompare){kind='comparison';if(selected.length<2)unsupported=true;}
      else if(wantsTask||selected.length===1){kind='investigation';if(!selected.length)unsupported=true;selected=selected.slice(0,1);}
      else if(wantsFocus){selected=['deal-acme','deal-nova','deal-atlas'].filter(id=>ctx.deals.has(id));}
      else unsupported=true;
      selected=selected.slice(0,kind==='comparison'?4:3);
      if(!unsupported&&selected.length)return response(selected.map((dealId,i)=>call('get_account_context',{dealId},i)),true);
    }
    if(step===3&&wantsTask&&!unsupported&&selected.length){const dueDate=new Date(Date.now()+86400000).toISOString().slice(0,10);return response([call('prepare_task',{dealId:selected[0],title:'Follow up on outstanding questions',note:'Review the recorded account context and clarify the next step with the account owner.',dueDate})],true);}
    if(unsupported){return response([{type:'text',text:JSON.stringify({workspace:{type:'focus',title:'Try a supported demo request',summary:'Scripted mode supports today’s priorities, an account investigation, comparing named accounts, and preparing a follow-up task for a selected account. Use Explore for the full dataset. Live mode is required to evaluate open-ended understanding.',items:[],proposalId:null}})}]);}
    const items=selected.map(dealId=>{
      const signal=dealId==='deal-acme'?'attention' as const:dealId==='deal-nova'?'opportunity' as const:dealId==='deal-atlas'?'watch' as const:'neutral' as const;
      const interpretation=dealId==='deal-acme'?'Unanswered security questions may be slowing the proposal. Clarify the blocker before another generic follow-up.':dealId==='deal-nova'?'Confirmed budget and a new procurement contact suggest a useful opening for next-step alignment.':dealId==='deal-atlas'?'The decision date is approaching, but budget ownership is not yet recorded.':'Review the latest recorded context before choosing a next step.';
      return {dealId,signal,interpretation,evidenceIds:[...ctx.activities.values()].filter(a=>a.dealId===dealId).slice(0,3).map(a=>a.id)};
    });
    const first=selected[0]?ctx.deals.get(selected[0]):undefined;
    const name=first?ctx.customers.get(first.customerId)?.name??'Account':'Account';
    const workspace={type:kind,title:kind==='focus'?'Three conversations worth moving forward':kind==='comparison'?'Compare the context, not just the value':`${name} — the context behind the signal`,summary:wantsTask?'A follow-up task is prepared. Review the exact details before approving; no task has been created yet.':kind==='focus'?'Two accounts have clear next steps. One needs a closer look. The remaining records are still available in Explore.':'This interpretation is based on the retrieved activity below. Source facts remain separate from the suggestion.',items,proposalId:[...ctx.proposals.keys()][0]??null};
    return response([{type:'text',text:JSON.stringify({workspace})}]);
  }});
}
