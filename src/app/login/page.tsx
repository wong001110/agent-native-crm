'use client';
import {type FormEvent,useState} from 'react';
import {Layers2,LogIn,ShieldCheck} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {LanguageToggle,useLanguage} from '@/components/language-provider';

function destination(){
  const next=new URLSearchParams(window.location.search).get('next');
  return next&&next.startsWith('/')&&!next.startsWith('//')?next:'/';
}

export default function LoginPage(){
  const [password,setPassword]=useState('');
  const [error,setError]=useState<string|null>(null);
  const [submitting,setSubmitting]=useState(false);
  const {t}=useLanguage();
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(submitting)return;
    setSubmitting(true);setError(null);
    try{
      const result=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password}),cache:'no-store'});
      const body=await result.json().catch(()=>null) as {error?:unknown}|null;
      if(!result.ok){setError(typeof body?.error==='string'?body.error:t('loginFailed'));return;}
      window.location.assign(destination());
    }catch{setError(t('loginReach'));}
    finally{setSubmitting(false);}
  }
  return <main className="login-page"><section className="login-card" aria-labelledby="login-title"><div className="login-language"><LanguageToggle/></div>
    <div className="login-mark"><Layers2 size={24}/></div>
    <p className="login-eyebrow">AGENT-NATIVE CRM</p>
    <h1 id="login-title">{t('loginTitle')}</h1>
    <p className="login-copy">{t('loginIntro')}</p>
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="workspace-password">{t('workspacePassword')}</label>
      <Input id="workspace-password" type="password" value={password} onChange={event=>setPassword(event.target.value)} autoComplete="current-password" autoFocus disabled={submitting} aria-invalid={error?true:undefined} aria-describedby={error?'login-error':'login-help'}/>
      {error?<p id="login-error" className="login-error" role="alert">{error}</p>:<p id="login-help" className="login-help">{t('loginHelp')}</p>}
      <Button type="submit" disabled={!password||submitting} className="login-submit"><LogIn size={16}/>{submitting?t('signingIn'):t('signIn')}</Button>
    </form>
    <p className="login-security"><ShieldCheck size={15}/> {t('loginSecurity')}</p>
  </section></main>;
}
