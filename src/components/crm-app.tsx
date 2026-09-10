"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Command, Database, Layers, ShieldCheck, Square, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkspaceView } from './workspace-view';
import { Explore } from './explore';
import { api, HttpError } from '@/lib/browser-api';
import { money, shortDate, type AppState, type AgentEvent, type Run, type ToolEvent } from '@/lib/domain';

export function CrmApp(){
  const router=useRouter();const params=useSearchParams();
  const view=['today','workspace','explore'].includes(params.get('view')??'')?params.get('view')!:'today';
  const [state,setState]=useState<AppState|null>(null);const [starting,setStarting]=useState(true);const [needsToken,setNeedsToken]=useState(false);const [token,setToken]=useState('');
  const [error,setError]=useState('');const [prompt,setPrompt]=useState('');const [busy,setBusy]=useState(false);const [events,setEvents]=useState<ToolEvent[]>([]);const [currentRun,setCurrentRun]=useState<Run|null>(null);const [notice,setNotice]=useState('');
  const abort=useRef<AbortController|null>(null);const inputRef=useRef<HTMLTextAreaElement>(null);const busyRef=useRef(false);
  const refresh=useCallback(async()=>{const next=await api<AppState>('/api/state');setState(next);},[]);
  const initialize=useCallback(async(accessToken?:string)=>{
    setStarting(true);setError('');
    try{await api('/api/session',{...(accessToken?{accessToken}:{})});await refresh();setNeedsToken(false);setToken('');}
    catch(e){if(e instanceof HttpError&&e.status===401)setNeedsToken(true);else setError(e instanceof Error?e.message:'The CRM is unavailable.');}
    finally{setStarting(false);}
  },[refresh]);
  useEffect(()=>{void initialize();return()=>abort.current?.abort();},[initialize]);
  useEffect(()=>{const handler=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key==='k'){event.preventDefault();inputRef.current?.focus();}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[]);
  const requested=params.get('run');
  const selected=(requested?state?.runs.find(run=>run.id===requested):undefined)??(currentRun?state?.runs.find(run=>run.id===currentRun.id)??currentRun:undefined);
  const navigate=(next:string)=>router.push(`/?view=${next}`,{scroll:false});
  const openRecord=(record='',tab='deals')=>router.push(`/?view=explore&tab=${encodeURIComponent(tab)}${record?`&record=${encodeURIComponent(record)}`:''}`,{scroll:false});
  async function ask(text:string){
    if(busyRef.current||text.trim().length<2)return;
    busyRef.current=true;setBusy(true);setError('');setNotice('');setEvents([]);setPrompt(text);router.push('/?view=workspace',{scroll:false});
    const controller=new AbortController();abort.current=controller;
    let received=false;
    try{
      const response=await fetch('/api/agent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:text,...(selected?.id?{previousRunId:selected.id}:{})}),signal:controller.signal});
      if(!response.ok){const body=await response.json();throw new Error(body.error??'The agent request failed.');}
      if(!response.body)throw new Error('The response stream was unavailable.');
      const reader=response.body.getReader();const decoder=new TextDecoder();let buffer='';
      const consume=(line:string)=>{
        if(!line.trim())return;const event=JSON.parse(line) as AgentEvent;
        if(event.type==='progress')setEvents(previous=>[...previous,event.event]);
        if(event.type==='error')throw new Error(event.message);
        if(event.type==='result'){setCurrentRun(event.run);received=true;}
      };
      while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const lines=buffer.split('\n');buffer=lines.pop()??'';for(const line of lines)consume(line);}
      buffer+=decoder.decode();if(buffer.trim())consume(buffer);
      if(!received)throw new Error('The run ended before a valid workspace arrived. No success has been assumed.');
      await refresh();setPrompt('');
    }catch(e){if(controller.signal.aborted)setNotice('Run stopped. No task was created. Your previous workspace is still available.');else setError(e instanceof Error?e.message:'The run failed.');try{await refresh();}catch{/* Keep the last usable snapshot when the server is unavailable. */}}
    finally{busyRef.current=false;setBusy(false);abort.current=null;}
  }
  const recent=state?.runs.filter(run=>run.status==='completed')??[];
  const todayWorkspace=recent.find(run=>run.workspace?.spec.type==='focus')?.workspace;
  return <div className="app-shell"><a className="skip-link" href="#main">Skip to workspace</a><header className="app-header"><Link href="/" className="brand" aria-label="Native CRM home"><span className="brand-mark"><Layers size={20} aria-hidden="true"/></span><span>native<span className="brand-divider">/</span><span className="brand-crm">crm</span></span></Link><nav aria-label="Main navigation">{['today','workspace','explore'].map(item=><button key={item} aria-current={view===item?'page':undefined} onClick={()=>navigate(item)}>{item[0].toUpperCase()+item.slice(1)}</button>)}</nav><div className="header-status"><span className="mode-pill"><span className="status-dot"/>{state?.mode==='live'?'Live model':'Fixture mode'}</span><span className="avatar" aria-label="Demo workspace">AM</span></div></header>
    <main id="main" className="main-content">
      {!state?<section className="welcome"><p className="eyebrow">Agent-native CRM prototype</p><h1>Less administration.<br/>More considered action.</h1>{starting?<p role="status">Opening your isolated CRM workspace…</p>:needsToken?<form onSubmit={event=>{event.preventDefault();void initialize(token);}} className="access-form"><label>Demo access token<input type="password" autoComplete="off" value={token} onChange={event=>setToken(event.target.value)} required/></label><Button type="submit" size="lg">Open workspace<ArrowRight aria-hidden="true" size={16}/></Button></form>:<Button onClick={()=>void initialize()}>Retry connection</Button>}{error&&<p className="error-banner" role="alert">{error}</p>}<p className="muted small">Seeded business records. Real tools and persistence. Model fixtures are always labeled.</p></section>:<>
        <div className="mode-note"><span>{state.mode==='mock'?<><ShieldCheck aria-hidden="true" size={15}/><strong>Interactive fixture demo.</strong> Model responses are scripted; CRM queries and approved writes are real.</>:<><Sparkles aria-hidden="true" size={15}/><strong>{state.model}</strong> Real model · seeded CRM data · actions require approval.</>}</span><button className="text-link" onClick={()=>openRecord()}>Inspect data<ArrowUpRight aria-hidden="true" size={13}/></button></div>
        <div className="metric-strip" aria-label="CRM overview"><div><span>Active deals</span><strong>{state.summary.activeDeals}<small> / {state.summary.totalDeals} total</small></strong></div><div><span>Active pipeline</span><strong>{money(state.summary.pipelineValue)}</strong></div><div><span>Customers</span><strong>{state.summary.customers}</strong></div><div><span>Open tasks</span><strong>{state.summary.openTasks}</strong></div></div>
        {view!=='explore'&&<section className={`command-surface ${view==='today'?'command-hero':''}`} aria-label="Ask the CRM">{view==='today'?<><p className="eyebrow">Your working day, with context</p><h1>What deserves<br/><span>your attention?</span></h1><p className="hero-subtitle">Start with an intention. Get the evidence, a useful workspace,<br className="desktop-break"/> and the next step — with you in control.</p></>:<div className="section-heading"><div><p className="eyebrow">Adaptive workspace</p><h1>One intention. The right view.</h1></div>{recent.length>0&&<label className="history-select"><span className="sr-only">Recent workspaces</span><select aria-label="Recent workspaces" value={requested??selected?.id??''} onChange={event=>router.push(`/?view=workspace&run=${event.target.value}`,{scroll:false})}><option value="">Recent workspaces</option>{recent.map(run=><option key={run.id} value={run.id}>{run.workspace?.spec.title}</option>)}</select></label>}</div>}
          <form className="command-box" onSubmit={event=>{event.preventDefault();void ask(prompt);}}><label className="sr-only" htmlFor="crm-command">What would you like to do?</label><textarea id="crm-command" ref={inputRef} value={prompt} maxLength={1500} rows={2} placeholder="Which deals should I focus on today?" onChange={event=>setPrompt(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();void ask(prompt||'What should I focus on today?');}}}/><div className="command-bottom"><span className="muted small"><Command aria-hidden="true" size={12}/> K to focus · Enter to run</span>{busy?<Button variant="outline" type="button" onClick={()=>abort.current?.abort()}><Square aria-hidden="true" size={13}/>Stop</Button>:<Button type="submit" size="lg" disabled={prompt.trim().length<2}>Build workspace<ArrowRight aria-hidden="true" size={15}/></Button>}</div></form>
          <div className="suggestions" aria-label="Example questions"><button disabled={busy} onClick={()=>void ask('What should I focus on today?')}>Review my priorities<ArrowUpRight aria-hidden="true" size={13}/></button><button disabled={busy} onClick={()=>void ask('What happened with ACME?')}>Investigate ACME<ArrowUpRight aria-hidden="true" size={13}/></button><button disabled={busy} onClick={()=>void ask('Compare ACME and Nova.')}>Compare two deals<ArrowUpRight aria-hidden="true" size={13}/></button></div>
        </section>}
        {error&&<div role="alert" className="error-banner"><AlertCircle aria-hidden="true" size={18}/><div><strong>That operation did not complete.</strong><p>{error}</p><button className="text-link" onClick={()=>openRecord()}>Continue in Explore</button></div></div>}
        {notice&&<p role="status" className="notice-banner">{notice}</p>}
        {busy&&<section className="run-progress" aria-label="Agent progress"><div role="status" className="progress-heading"><span className="pulse-dot"/> {events.at(-1)?.message??'Starting the agent…'}</div><p className="muted small">{state.mode==='mock'?'Running labeled fixtures through the real CRM tools.':'Retrieving context. No task can be created without your approval.'}</p><ol>{events.filter(event=>event.status!=='running').map((event,index)=><li key={index}>{event.status==='completed'?<CheckCircle2 aria-hidden="true" size={14}/>:<AlertCircle aria-hidden="true" size={14}/>}<code>{event.tool}</code><span>{event.status}</span></li>)}</ol></section>}
        {view==='workspace'&&selected?.workspace&&<WorkspaceView workspace={selected.workspace} onAsk={text=>void ask(text)} onOpen={openRecord} onChanged={refresh} busy={busy}/>}
        {view==='workspace'&&!selected?.workspace&&!busy&&<div className="workspace-empty"><Layers aria-hidden="true" size={26}/><h2>A workspace, not another chat thread.</h2><p>Ask a question above. The agent selects a focus view,<br className="desktop-break"/> an investigation, or a comparison from your CRM context.</p><span className="eyebrow">Intent → tools → evidence → decision</span></div>}
        {view==='today'&&todayWorkspace&&<WorkspaceView workspace={todayWorkspace} onAsk={text=>void ask(text)} onOpen={openRecord} onChanged={refresh} busy={busy}/>}
        {view==='today'&&<section className="recent-work"><div className="section-heading"><div><p className="eyebrow">Actual execution history</p><h2>Recent work</h2></div><button className="text-link" onClick={()=>openRecord('','activities')}>All activity<ArrowUpRight aria-hidden="true" size={13}/></button></div>{state.runs.length?state.runs.slice(0,5).map(run=><button className="run-row" key={run.id} onClick={()=>{setCurrentRun(run);router.push(`/?view=workspace&run=${run.id}`,{scroll:false});}}><span className="run-icon"><Layers aria-hidden="true" size={17}/></span><span><strong>{run.workspace?.spec.title??run.prompt}</strong><small>{run.toolEvents.filter(event=>event.status==='completed').length} tool queries completed · {run.mode==='mock'?'Fixture':'Live'} · {shortDate(run.createdAt)}</small></span><span className="quiet-tag">{run.status}</span><ArrowUpRight aria-hidden="true" size={15}/></button>):<div className="history-empty"><Database aria-hidden="true" size={22}/><p>No agent runs yet. Your records are ready, and nothing has been changed.</p></div>}</section>}
        {view==='explore'&&<Explore key={`${params.get('record')??''}:${params.get('tab')??'deals'}`} data={state.data} record={params.get('record')??''} tab={params.get('tab')??'deals'} onNavigate={openRecord} onChanged={refresh}/>}
        <footer className="app-footer"><span><ShieldCheck aria-hidden="true" size={14}/> Your approval is the execution boundary.</span><span>Prototype · Seed data · {state.mode==='mock'?'No real inference':'Live inference'}</span></footer>
      </>}
    </main>
  </div>;
}
