'use client';
import Link from 'next/link';
import {ArrowUpRight,ArrowRight,Target,GitCompareArrows,Search,CheckCircle2,Database} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useCrm} from './crm-provider';
import {Prose} from './prose';
import {money,dateLabel} from '@/lib/format';
import {useLanguage} from './language-provider';
export function Today(){
  const {data,run,busy}=useCrm();const {locale,t}=useLanguage();if(!data)return null;
  const latestFocus=data.runs.find(r=>r.status==='succeeded'&&r.workspace?.type==='focus'&&r.workspace.items.length);
  const focusPrompt=locale==='zh'?'我今天应该优先处理什么？':'What should I focus on today?';
  const acmePrompt=locale==='zh'?'为什么 ACME 需要关注？':'Why ACME?';
  const comparisonPrompt=locale==='zh'?'请比较 ACME 和 Nova。':'Compare ACME and Nova';
  return <>
    <section className="page-heading"><div className="eyebrow">{t('todayEyebrow')}</div><h1>{t('todayTitle')}</h1><p>{t('todayIntro')}</p></section>
    <section className="metric-strip" aria-label="CRM overview"><div><span>{t('activeDeals')}</span><strong>{data.summary.deals}</strong></div><div><span>{t('pipelineValue')}</span><strong>{money(data.summary.pipelineValue,locale)}</strong></div><div><span>{t('customers')}</span><strong>{data.summary.customers}</strong></div><div><span>{t('followUpTasks')}</span><strong>{data.summary.tasks}</strong></div><Link href="/explore" className="metric-link">{t('exploreRecords')} <ArrowUpRight size={16}/></Link></section>
    {latestFocus?.workspace?<section className="saved-focus" aria-label={t('latestFocus')}><div className="section-heading"><div><h2>{t('latestFocus')}</h2><p>{t('savedAnalysis',{date:dateLabel(latestFocus.createdAt,locale),mode:latestFocus.mode==='mock'?t('scriptedDemo'):t('liveModel')})}</p></div><Link href={`/workspace?run=${latestFocus.id}`}>{t('openSaved')} <ArrowUpRight size={14}/></Link></div><div className="saved-focus-grid">{latestFocus.workspace.items.map(item=><article key={item.deal.id}><strong>{item.customer.name}</strong><span>{money(item.deal.value,locale)} · {item.deal.stage}</span><Prose>{item.interpretation}</Prose><Link href={`/explore?deal=${item.deal.id}`}>{t('inspectSource')} <ArrowUpRight size={12}/></Link></article>)}</div></section>:null}
    <section className="start-section"><div className="section-heading"><div><h2>{t('needsAttention')}</h2><p>{t('startingPoint')}</p></div><span className="small-label">{t('readApprove')}</span></div>
      <div className="starter-grid">
        <article className="starter-card featured"><div className="starter-icon"><Target size={22}/></div><span className="eyebrow">{t('prioritize')}</span><h3>{t('focusCard')}</h3><p>{t('focusCardCopy')}</p><Button disabled={busy} onClick={()=>void run(focusPrompt)}>{t('reviewPriorities')} <ArrowRight size={16}/></Button><span className="card-footnote">{t('readOnly')}</span></article>
        <article className="starter-card"><div className="starter-icon"><Search size={22}/></div><span className="eyebrow">{t('understand')}</span><h3>{t('understandCard')}</h3><p>{t('understandCopy')}</p><Button variant="outline" disabled={busy} onClick={()=>void run(acmePrompt)}>{t('investigateAcme')} <ArrowUpRight size={16}/></Button></article>
        <article className="starter-card"><div className="starter-icon"><GitCompareArrows size={22}/></div><span className="eyebrow">{t('compare')}</span><h3>{t('compareCard')}</h3><p>{t('compareCopy')}</p><Button variant="outline" disabled={busy} onClick={()=>void run(comparisonPrompt)}>{t('compareAccounts')} <ArrowUpRight size={16}/></Button></article>
      </div>
    </section>
    <section className="bottom-grid"><div className="activity-panel"><div className="section-heading"><h2>{t('recentWorkspaces')}</h2><span className="small-label">{t('browserSession')}</span></div>{data.runs.length?data.runs.slice(0,5).map(run=><Link className="history-row" key={run.id} href={`/workspace?run=${run.id}`}><CheckCircle2 size={17}/><div><strong>{run.prompt}</strong><span>{run.mode==='mock'?t('scriptedDemo'):t('liveModel')} · {run.status} · {dateLabel(run.createdAt,locale)}</span></div><ArrowUpRight size={16}/></Link>):<div className="empty-inline"><p>{t('noAnalysis')}</p><span>{t('firstRequest')}</span></div>}</div>
    <aside className="data-note"><Database size={22}/><h2>{t('smallerInterface')}</h2><p>{t('dataNote',{deals:data.summary.deals})}</p><Link href="/explore">{t('openData')} <ArrowRight size={14}/></Link><span>{t('sampleData',{date:dateLabel(data.datasetAsOf,locale)})}</span></aside></section>
  </>;
}
