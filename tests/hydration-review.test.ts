import {describe,it,expect} from 'vitest';
import {observedContext} from '../src/lib/agent/tools';
import {hydrateWorkspace} from '../src/lib/agent/hydrate';
import {seedSnapshot} from '../src/lib/seed';
import {draftProposal} from '../src/lib/domain';
import type {WorkspacePlan} from '../src/lib/contracts';
function fixture(){
  const snapshot=seedSnapshot(),ctx=observedContext(snapshot);
  snapshot.deals.forEach(d=>ctx.deals.set(d.id,d));
  snapshot.customers.forEach(c=>ctx.customers.set(c.id,c));
  snapshot.activities.forEach(a=>ctx.activities.set(a.id,a));
  const evidence=snapshot.activities.find(a=>a.dealId==='deal-acme')!;
  const plan:WorkspacePlan={type:'investigation',title:'ACME',summary:'Source review',proposalId:null,items:[{dealId:'deal-acme',signal:'attention',interpretation:'A follow-up may help.',evidenceIds:[evidence.id]}]};
  return {ctx,plan,evidence};
}
describe('fresh reviewer grounding regressions',()=>{
  it('rejects duplicate evidence rather than repeating source rows',()=>{
    const {ctx,plan,evidence}=fixture();plan.items[0].evidenceIds=[evidence.id,evidence.id];
    expect(()=>hydrateWorkspace(plan,ctx,'review-run','mock')).toThrow('duplicate evidence');
  });
  it('rejects a prepared action for a different displayed account',()=>{
    const {ctx,plan}=fixture();const p=draftProposal('review-session',{dealId:'deal-nova',title:'Follow up Nova',note:'Draft',dueDate:'2026-09-12'},'review-run');
    ctx.proposals.set(p.id,p);plan.proposalId=p.id;
    expect(()=>hydrateWorkspace(plan,ctx,'review-run','mock')).toThrow('not in the displayed workspace');
  });
  it('rejects an action in an empty workspace',()=>{
    const {ctx}=fixture();const p=draftProposal('review-session',{dealId:'deal-acme',title:'Follow up ACME',note:'Draft',dueDate:'2026-09-12'},'review-run');ctx.proposals.set(p.id,p);
    expect(()=>hydrateWorkspace({type:'focus',title:'Empty',summary:'',items:[],proposalId:p.id},ctx,'review-run','mock')).toThrow('not in the displayed workspace');
  });
  it('keeps an exact proposal when its target and evidence are present',()=>{
    const {ctx,plan,evidence}=fixture();const p=draftProposal('review-session',{dealId:'deal-acme',title:'Follow up ACME',note:'Draft',dueDate:'2026-09-12'},'review-run');ctx.proposals.set(p.id,p);plan.proposalId=p.id;
    const result=hydrateWorkspace(plan,ctx,'review-run','mock');
    expect(result.proposal?.draft).toEqual(p.draft);expect(result.items[0].evidence.map(a=>a.id)).toEqual([evidence.id]);expect(result.proposal).not.toHaveProperty('sessionId');
  });
});
