'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ArrowUpRight,Layers2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useCrm} from './crm-provider';
import {FloatingAgentChat} from './floating-agent-dialog';
import {LanguageToggle,useLanguage} from './language-provider';

export function AppShell({children}:{children:React.ReactNode}){
  const path=usePathname();
  const {data,loading,dataError,refresh}=useCrm();
  const {t}=useLanguage();
  return <div className="app-shell">
    <a href="#main-content" className="skip-link">{t('skipToContent')}</a>
    <header className="app-header"><div className="header-inner">
      <Link href="/" className="brand" aria-label={t('homeAria')}><span className="brand-mark"><Layers2 size={20}/></span><span>CRM <span className="brand-sub">/ agent-native</span></span></Link>
      <nav aria-label={t('mainNavigation')}>{[['/','today'],['/workspace','workspace'],['/explore','explore']].map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined} className={path===href?'nav-link active':'nav-link'}>{t(label)}</Link>)}</nav>
      <LanguageToggle/>
      <span className={`mode-badge ${data?.mode==='live'?'live':''}`} data-testid="mode-badge"><span className="status-dot"/>{data?.mode==='live'?t('liveModel'):t('scriptedDemo')}</span>
    </div></header>
    <div className="app-content">
      <div className="context-line"><span>WORKSPACE / <strong>{path==='/explore'?t('contextExplore'):path==='/workspace'?t('contextWorkspace'):t('contextToday')}</strong></span><span className="prototype-label">{t('prototype')}</span></div>
      {dataError?<div role="alert" className="notice error"><div><strong>{t('dataUnavailable')}</strong><p>{dataError}</p></div><Button variant="outline" onClick={()=>void refresh()}>{t('retryData')}</Button></div>:null}
      {loading?<div role="status" className="loading-panel">{t('loadingSource')}</div>:null}
      <main id="main-content" tabIndex={-1}>{children}</main>
      <FloatingAgentChat/>
      <footer className="app-footer"><span>{t('footerTagline')}</span><Link href="/explore">{t('footerLink')} <ArrowUpRight size={13}/></Link></footer>
    </div>
  </div>;
}
