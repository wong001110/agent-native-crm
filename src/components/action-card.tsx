'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Check,ShieldCheck,CalendarDays} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useCrm,jsonRequest} from './crm-provider';
import {Prose} from './prose';
import {dateLabel} from '@/lib/format';
import type {PublicProposal} from '@/lib/contracts';
export function ActionCard({proposal,onChange}:{proposal:PublicProposal;onChange?:(p:PublicProposal)=>void}){
  const {data,refresh,updateProposal}=useCrm();const [pending,setPending]=useState(false),[error,setError]=useState<string|null>(null);
  const deal=data?.snapshot.deals.find(d=>d.id===proposal.draft.dealId),customer=data?.snapshot.customers.find(c=>c.id===deal?.customerId);
  async function decide(intent:'approve'|'reject'){if(pending)return;setPending(true);setError(null);try{const result=await jsonRequest<{proposal:PublicProposal}>('/api/actions',{intent,proposalId:proposal.id});updateProposal(result.proposal);onChange?.(result.proposal);await refresh();}catch(e){setError(e instanceof Error?e.message:'The action failed.');}finally{setPending(false);}}
  return <section className="action-card" aria-label="Proposed follow-up task"><div className="action-label"><ShieldCheck size={17}/>{proposal.status==='approved'?'APPROVED AND SAVED':proposal.status==='rejected'?'REJECTED':'YOUR APPROVAL REQUIRED'}</div><h3>{proposal.draft.title}</h3><p className="action-account">{customer?.name??proposal.draft.dealId} · {deal?.name??'Follow-up task'}</p><Prose>{proposal.draft.note}</Prose><div className="action-date"><CalendarDays size={16}/> Due {dateLabel(proposal.draft.dueDate)}</div>
    {proposal.status==='pending'?<><p className="small-label">Creates one internal task. No email is sent. Proposal expires after 30 minutes.</p><div className="action-buttons"><Button disabled={pending} onClick={()=>void decide('approve')}>{pending?'Processing…':'Approve & create task'}</Button><Button variant="ghost" disabled={pending} onClick={()=>void decide('reject')}>Reject</Button></div></>:proposal.status==='approved'?<div className="success-receipt" role="status"><Check size={17}/><span>Task created and stored. <Link href="/explore?tab=tasks">View in Explore</Link></span></div>:<p role="status">Proposal rejected. No task was created.</p>}
    {error?<p className="inline-error" role="alert">{error}</p>:null}
  </section>;
}
