"use client";
import { ArrowUpRight, AlertTriangle, TrendingUp, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageResponse } from '@/components/ai-elements/message';
import { api } from '@/lib/browser-api';
import { money, shortDate, type Activity, type Proposal, type Workspace } from '@/lib/domain';

export function EvidenceList({activities,onOpen}:{activities:Activity[];onOpen:(id:string,tab?:string)=>void}){
  return <ul className="evidence-list">{activities.map(activity=><li key={activity.id}>
    <div className="eyebrow">{activity.kind} · {shortDate(activity.occurredAt)}</div><p>{activity.summary}</p>
    <button className="text-link" onClick={()=>onOpen(activity.dealId,'activities')}>Open source activity <ArrowUpRight aria-hidden="true" size={13}/></button>
  </li>)}</ul>;
}
export function ActionCard({proposal,account,onChanged}:{proposal:Proposal;account:string;onChanged:()=>Promise<void>}){
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [outcome,setOutcome]=useState<string|null>(null);
  const status=outcome??proposal.status;const expired=new Date(proposal.expiresAt).valueOf()<Date.now();
  async function decide(decision:'approve'|'reject'){
    setBusy(true);setError('');
    try{const result=await api<{status:string;taskId:string|null}>('/api/actions',{proposalId:proposal.id,decision});setOutcome(result.status);await onChanged();}
    catch(e){setError(e instanceof Error?e.message:'The action did not complete.');}finally{setBusy(false);}
  }
  return <section className="action-card" aria-label="Task approval">
    <div className="eyebrow"><ShieldCheck aria-hidden="true" size={15}/> {status==='pending'?'Your decision':'Action result'}</div>
    <h3>{status==='approved'?'Follow-up task created':status==='rejected'?'Proposal rejected':'Create this follow-up task?'}</h3>
    <p className="action-title">{proposal.title}</p>
    <dl className="action-facts"><div><dt>Account</dt><dd>{account}</dd></div><div><dt>Due</dt><dd>{shortDate(proposal.dueDate)}</dd></div></dl>
    {status==='pending'?<><p className="muted small">Creates one internal task and one activity entry. No email will be sent. {expired?'This proposal has expired. Prepare a new one.':'Nothing changes until you approve.'}</p>
      <div className="button-row"><Button size="lg" disabled={busy||expired} onClick={()=>void decide('approve')}>{busy?'Saving…':'Approve & create task'}<ArrowRight aria-hidden="true" size={15}/></Button><Button variant="ghost" disabled={busy} onClick={()=>void decide('reject')}>Reject</Button></div></>:
      <p role="status" className="result-line"><Check aria-hidden="true" size={16}/>{status==='approved'?'Saved to the CRM. Verify it in Explore → Tasks.':'No task was created.'}</p>}
    {error&&<p role="alert" className="error-inline">{error}</p>}
  </section>;
}
export function WorkspaceView({workspace,onAsk,onOpen,onChanged,busy}:{workspace:Workspace;onAsk:(prompt:string)=>void;onOpen:(id:string,tab?:string)=>void;onChanged:()=>Promise<void>;busy:boolean}){
  const {spec,scope}=workspace;
  return <section className="workspace-result" aria-label={`${spec.type} workspace`}>
    <div className="section-heading"><div><p className="eyebrow">{spec.type} workspace</p><h2>{spec.title}</h2></div><span className="quiet-tag">Source-backed view</span></div>
    <div className="interpretation"><span className="eyebrow">Interpretation, not a confirmed outcome</span><MessageResponse components={{a:({children})=><span>{children}</span>,img:()=>null}}>{spec.summary}</MessageResponse></div>
    <p className="scope-line">Retrieved {scope.retrievedDeals} of {scope.totalDeals} deals · {scope.retrievedActivities} activities{scope.oldestActivity&&scope.newestActivity?` · ${shortDate(scope.oldestActivity)}–${shortDate(scope.newestActivity)}`:''} · Snapshot {new Date(scope.retrievedAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</p>
    {spec.items.length===0&&<div className="empty-state"><h3>No matching situations</h3><p>The result is empty, not the CRM. Broaden the request or inspect all records in Explore.</p></div>}
    {spec.type==='comparison'?<div className="table-wrap"><table><caption className="sr-only">Compare the retrieved deals</caption><thead><tr><th scope="col">Account</th><th scope="col">Value</th><th scope="col">Stage</th><th scope="col">Close date</th><th scope="col">Evidence</th></tr></thead><tbody>{workspace.records.map(record=><tr key={record.deal.id}><th scope="row"><button className="text-link" onClick={()=>onOpen(record.deal.id)}>{record.customer.name}<ArrowUpRight aria-hidden="true" size={13}/></button></th><td className="number">{money(record.deal.value)}</td><td>{record.deal.stage}</td><td>{shortDate(record.deal.closeDate)}</td><td><details><summary>{record.evidence.length} sources</summary><EvidenceList activities={record.evidence} onOpen={onOpen}/></details></td></tr>)}</tbody></table></div>:null}
    {spec.type==='comparison'?<div className="comparison-notes">{spec.items.map((item,index)=><div key={item.dealId}><h3>{workspace.records[index].customer.name}</h3><p>{item.interpretation}</p></div>)}</div>:<div className={spec.type==='focus'?'situation-grid':'investigation-grid'}>{spec.items.map((item,index)=>{
      const record=workspace.records[index];return <article className={`situation-card emphasis-${item.emphasis}`} key={item.dealId}>
        <div className="card-top"><span className={`status-label ${item.emphasis}`}>{item.emphasis==='risk'?<AlertTriangle aria-hidden="true" size={15}/>:item.emphasis==='opportunity'?<TrendingUp aria-hidden="true" size={15}/>:<span className="status-dot"/>}{item.emphasis==='risk'?'Potential blocker':item.emphasis==='opportunity'?'Momentum signal':item.emphasis==='watch'?'Worth checking':'Account context'}</span><span className="number">{money(record.deal.value)}</span></div>
        <h3>{record.customer.name}</h3><p className="muted small">{record.deal.stage} · Target close {shortDate(record.deal.closeDate)}</p>
        <p>{item.interpretation}</p>
        <details open={spec.type==='investigation'}><summary>{record.evidence.length} supporting {record.evidence.length===1?'source':'sources'}</summary><EvidenceList activities={record.evidence} onOpen={onOpen}/></details>
        <div className="card-actions">{spec.type==='focus'?<Button variant="outline" disabled={busy} onClick={()=>onAsk(`What happened with ${record.customer.name}?`)}>Investigate<ArrowRight aria-hidden="true" size={15}/></Button>:!workspace.proposal?<Button disabled={busy} onClick={()=>onAsk(`Prepare a follow-up task for ${record.customer.name}.`)}>Prepare follow-up<ArrowRight aria-hidden="true" size={15}/></Button>:null}<button className="text-link" onClick={()=>onOpen(record.deal.id)}>Open record<ArrowUpRight aria-hidden="true" size={13}/></button></div>
      </article>;
    })}{spec.type==='investigation'&&workspace.records[0]&&<aside className="timeline"><p className="eyebrow">Recorded history</p><h3>How we got here</h3><ol>{workspace.records[0].timeline.map(activity=><li key={activity.id}><time dateTime={activity.occurredAt}>{shortDate(activity.occurredAt)}</time><p>{activity.summary}</p></li>)}</ol></aside>}</div>}
    {workspace.proposal&&<ActionCard key={workspace.proposal.id} proposal={workspace.proposal} account={workspace.records.find(r=>r.deal.id===workspace.proposal?.dealId)?.customer.name??workspace.proposal.dealId} onChanged={onChanged}/>}
  </section>;
}
