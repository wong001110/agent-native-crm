import {publicProposal,type Workspace,type WorkspacePlan} from '../contracts';
import {AppError} from '../domain';
import type {Observed} from './tools';
export function hydrateWorkspace(plan:WorkspacePlan,ctx:Observed,runId:string,mode:'mock'|'live'):Workspace {
  if(new Set(plan.items.map(i=>i.dealId)).size!==plan.items.length)throw new AppError('INVALID_OUTPUT','The agent returned duplicate records. Retry this request.',422);
  const items=plan.items.map(item=>{
    if(new Set(item.evidenceIds).size!==item.evidenceIds.length)throw new AppError('INVALID_OUTPUT','The agent returned duplicate evidence references. Retry this request.',422);
    const deal=ctx.deals.get(item.dealId);if(!deal)throw new AppError('INVALID_OUTPUT','The agent referenced a deal it did not retrieve.',422);
    const customer=ctx.customers.get(deal.customerId);if(!customer)throw new AppError('INVALID_OUTPUT','The agent did not retrieve customer context.',422);
    const evidence=item.evidenceIds.map(id=>{const a=ctx.activities.get(id);if(!a||a.dealId!==deal.id)throw new AppError('INVALID_OUTPUT','The agent cited evidence that does not belong to this record.',422);return {...a,sessionId:null};});
    if(item.signal!=='neutral'&&!evidence.length)throw new AppError('INVALID_OUTPUT','This interpretation did not include supporting evidence.',422);
    return {deal,customer,signal:item.signal,interpretation:item.interpretation,evidence,timeline:[...ctx.activities.values()].filter(a=>a.dealId===deal.id).sort((a,b)=>a.at.localeCompare(b.at)).map(a=>({...a,sessionId:null}))};
  });
  const proposal=plan.proposalId?ctx.proposals.get(plan.proposalId):null;
  if(plan.proposalId&&!proposal)throw new AppError('INVALID_OUTPUT','The agent referenced an action that was not prepared in this run.',422);
  if(proposal&&!items.some(item=>item.deal.id===proposal.draft.dealId))throw new AppError('INVALID_OUTPUT','The proposed action target is not in the displayed workspace. Retry this request.',422);
  return {runId,type:plan.type,title:plan.title,summary:plan.summary,items,proposal:proposal?publicProposal(proposal):null,scope:{totalDeals:ctx.snapshot.deals.length,examinedDeals:ctx.deals.size,detailedDeals:ctx.detailed.size,activityWindow:'Recorded sample activity; dataset as of 11 Sep 2026',checkedAt:new Date().toISOString()},mode};
}
