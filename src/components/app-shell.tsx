'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {ArrowUp,Command,Layers2,Square,ArrowUpRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useCrm} from './crm-provider';
export function AppShell({children}:{children:React.ReactNode}){
  const path=usePathname(),{data,loading,dataError,refresh,busy,run,stop,workspace}=useCrm();
  const [prompt,setPrompt]=useState('');const input=useRef<HTMLInputElement>(null);
  useEffect(()=>{function shortcut(e:KeyboardEvent){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.current?.focus();}}window.addEventListener('keydown',shortcut);return ()=>window.removeEventListener('keydown',shortcut);},[]);
  return <div className="app-shell">
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <header className="app-header"><div className="header-inner">
      <Link href="/" className="brand" aria-label="Agent-native CRM home"><span className="brand-mark"><Layers2 size={20}/></span><span>CRM <span className="brand-sub">/ agent-native</span></span></Link>
      <nav aria-label="Main navigation">{[['/','Today'],['/workspace','Workspace'],['/explore','Explore']].map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined} className={path===href?'nav-link active':'nav-link'}>{label}</Link>)}</nav>
      <span className={`mode-badge ${data?.mode==='live'?'live':''}`} data-testid="mode-badge"><span className="status-dot"/>{data?.mode==='live'?'Live model':'Scripted demo'}</span>
    </div></header>
    <div className="app-content">
      <div className="context-line"><span>WORKSPACE / <strong>{path==='/explore'?'YOUR SOURCE OF RECORD':path==='/workspace'?'INTENT TO ACTION':'TODAY'}</strong></span><span className="prototype-label">Prototype · Fictional CRM data</span></div>
      {dataError?<div role="alert" className="notice error"><div><strong>CRM data is unavailable.</strong><p>{dataError}</p></div><Button variant="outline" onClick={()=>void refresh()}>Retry data</Button></div>:null}
      {loading?<div role="status" className="loading-panel">Loading the source of record…</div>:null}
      <main id="main-content" tabIndex={-1}>{children}</main>
      <section className="command-surface" aria-label="Ask your CRM"><form onSubmit={e=>{e.preventDefault();if(prompt.trim()&&!busy){void run(prompt,workspace?.items.map(i=>i.deal.id).slice(0,4));setPrompt('');}}>
        <label htmlFor="crm-prompt" className="command-label"><Command size={16}/> What would you like to move forward?</label>
        <div className="command-row"><Input id="crm-prompt" ref={input} value={prompt} maxLength={1200} onChange={e=>setPrompt(e.target.value)} placeholder="Ask about an account, compare deals, or prepare a next step…" disabled={busy} aria-describedby="command-help"/>{busy?<Button type="button" variant="outline" onClick={stop}><Square size={14}/> Stop run</Button>:<Button type="submit" disabled={!prompt.trim()||!data} aria-label="Run request"><ArrowUp size={18}/><span>Run</span></Button>}</div>
        <div id="command-help" className="command-help"><span>{data?.mode==='live'?'Model-selected tools · Source-backed facts · Approval before action':'Scripted adapter · No model credentials used · Live validation pending'}</span><kbd>⌘ / Ctrl K</kbd></div>
      </form></section>
      <footer className="app-footer"><span>Less administration. More informed decisions.</span><Link href="/explore">Your data is always accessible <ArrowUpRight size={13}/></Link></footer>
    </div>
  </div>;
}
