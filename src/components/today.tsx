'use client';
import Link from 'next/link';
import {ArrowUpRight,ArrowRight,Target,GitCompareArrows,Search,CheckCircle2,Database} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useCrm} from './crm-provider';
import {Prose} from './prose';
import {money,dateLabel} from '@/lib/format';
export function Today(){
  const {data,run,busy}=useCrm();if(!data)return null;
  const latestFocus=data.runs.find(r=>r.status==='succeeded'&&r.workspace?.type==='focus'&&r.workspace.items.length);
  return <>
    <section className="page-heading"><div className="eyebrow">A CLEARER START</div><h1>Start with what matters.</h1><p>Your CRM holds the details. Your workspace brings the next step into focus.</p></section>
    <section className="metric-strip" aria-label="CRM overview"><div><span>Active deals</span><strong>{data.summary.deals}</strong></div><div><span>Pipeline value</span><strong>{money(data.summary.pipelineValue)}</strong></div><div><span>Customers</span><strong>{data.summary.customers}</strong></div><div><span>Your follow-up tasks</span><strong>{data.summary.tasks}</strong></div><Link href="/explore" className="metric-link">Explore all records <ArrowUpRight size={16}/></Link></section>
    {latestFocus?.workspace?<section className="saved-focus" aria-label="Latest saved focus"><div className="section-heading"><div><h2>Your latest focus</h2><p>Saved analysis from {dateLabel(latestFocus.createdAt)} · {latestFocus.mode==='mock'?'Scripted demo':'Live model'} · Not a live prediction</p></div><Link href={`/workspace?run=${latestFocus.id}`}>Open saved workspace <ArrowUpRight size={14}/></Link></div><div className="saved-focus-grid">{latestFocus.workspace.items.map(item=><article key={item.deal.id}><strong>{item.customer.name}</strong><span>{money(item.deal.value)} · {item.deal.stage}</span><Prose>{item.interpretation}</Prose><Link href={`/explore?deal=${item.deal.id}`}>Inspect source record <ArrowUpRight size={12}/></Link></article>)}</div></section>:null}
    <section className="start-section"><div className="section-heading"><div><h2>What needs your attention?</h2><p>Choose a starting point, or describe your own intent below.</p></div><span className="small-label">Read first. Act with approval.</span></div>
      <div className="starter-grid">
        <article className="starter-card featured"><div className="starter-icon"><Target size={22}/></div><span className="eyebrow">01 / PRIORITIZE</span><h3>Find the conversations<br/>worth moving forward.</h3><p>Review account signals and turn a busy pipeline into a short, evidence-backed focus list.</p><Button disabled={busy} onClick={()=>void run('What should I focus on today?')}>Review today’s priorities <ArrowRight size={16}/></Button><span className="card-footnote">Reads CRM data · Does not change records</span></article>
        <article className="starter-card"><div className="starter-icon"><Search size={22}/></div><span className="eyebrow">02 / UNDERSTAND</span><h3>Look behind<br/>an account signal.</h3><p>Investigate ACME’s open questions, recent activity, and the context behind the proposal.</p><Button variant="outline" disabled={busy} onClick={()=>void run('Why ACME?')}>Investigate ACME <ArrowUpRight size={16}/></Button></article>
        <article className="starter-card"><div className="starter-icon"><GitCompareArrows size={22}/></div><span className="eyebrow">03 / COMPARE</span><h3>See the differences<br/>side by side.</h3><p>Compare ACME and Nova using the same source records, not a generated set of numbers.</p><Button variant="outline" disabled={busy} onClick={()=>void run('Compare ACME and Nova')}>Compare accounts <ArrowUpRight size={16}/></Button></article>
      </div>
    </section>
    <section className="bottom-grid"><div className="activity-panel"><div className="section-heading"><h2>Recent workspaces</h2><span className="small-label">This browser session</span></div>{data.runs.length?data.runs.slice(0,5).map(run=><Link className="history-row" key={run.id} href={`/workspace?run=${run.id}`}><CheckCircle2 size={17}/><div><strong>{run.prompt}</strong><span>{run.mode==='mock'?'Scripted demo':'Live model'} · {run.status} · {dateLabel(run.createdAt)}</span></div><ArrowUpRight size={16}/></Link>):<div className="empty-inline"><p>No analysis has run yet.</p><span>Your first request will leave a saved workspace and an inspectable tool trail here.</span></div>}</div>
    <aside className="data-note"><Database size={22}/><h2>A smaller interface.<br/>Not a smaller view.</h2><p>All {data.summary.deals} deals remain available in Explore. Agent suggestions never replace your source of record.</p><Link href="/explore">Open the data <ArrowRight size={14}/></Link><span>Sample dataset as of {dateLabel(data.datasetAsOf)}.</span></aside></section>
  </>;
}
