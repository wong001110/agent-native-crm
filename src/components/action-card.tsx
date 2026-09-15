'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Check,ShieldCheck,CalendarDays} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useCrm,jsonRequest} from './crm-provider';
import {Prose} from './prose';
import {dateLabel} from '@/lib/format';
import type {PublicProposal} from '@/lib/contracts';
import {useLanguage} from './language-provider';
export function ActionCard({proposal,onChange}:{proposal:PublicProposal;onChange?:(p:PublicProposal)=>void}){
  const {data,refresh,updateProposal}=useCrm();const {locale,t}=useLanguage();const [pending,setPending]=useState(false),[error,setError]=useState<string|null>(null);
  const deal=data?.snapshot.deals.find(d=>d.id===proposal.draft.dealId),customer=data?.snapshot.customers.find(c=>c.id===deal?.customerId);
  async function decide(intent:'approve'|'reject'){if(pending)return;setPending(true);setError(null);try{const result=await jsonRequest<{proposal:PublicProposal}>('/api/actions',{intent,proposalId:proposal.id});updateProposal(result.proposal);onChange?.(result.proposal);await refresh();}catch(error){setError(error instanceof Error?error.message:t('actionFailed'));}finally{setPending(false);}}
  return <section className="action-card" aria-label={t('proposedTask')}><div className="action-label"><ShieldCheck size={17}/>{proposal.status==='approved'?t('approvedSaved'):proposal.status==='rejected'?t('rejected'):t('approvalRequired')}</div><h3>{proposal.draft.title}</h3><p className="action-account">{customer?.name??proposal.draft.dealId} · {deal?.name??t('followUpTask')}</p><Prose>{proposal.draft.note}</Prose><div className="action-date"><CalendarDays size={16}/> {t('due',{date:dateLabel(proposal.draft.dueDate,locale)})}</div>
    {proposal.status==='pending'?<><p className="small-label">{t('approvalCopy')}</p><div className="action-buttons"><Button disabled={pending} onClick={()=>void decide('approve')}>{pending?t('processing'):t('approveCreate')}</Button><Button variant="ghost" disabled={pending} onClick={()=>void decide('reject')}>{t('reject')}</Button></div></>:proposal.status==='approved'?<div className="success-receipt" role="status"><Check size={17}/><span>{t('taskStored')} <Link href="/explore?tab=tasks">{t('viewExplore')}</Link></span></div>:<p role="status">{t('proposalRejected')}</p>}
    {error?<p className="inline-error" role="alert">{error}</p>:null}
  </section>;
}
