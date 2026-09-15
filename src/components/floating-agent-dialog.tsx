'use client';
import {type FormEvent,useEffect,useRef,useState} from 'react';
import {ArrowUp,MessageCircleMore,Minimize2,RotateCcw,Square} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Prose} from '@/components/prose';
import type {ConversationTurn,Workspace} from '@/lib/contracts';
import {useCrm} from './crm-provider';
import {useLanguage} from './language-provider';

type ChatMessage={id:number;role:ConversationTurn['role'];content:string};
function workspaceReply(workspace:Workspace,t:(key:string)=>string){const task=workspace.proposal?.draft;return `${workspace.title}\n\n${workspace.summary}${task?`\n\n${t('pendingTask')}: ${task.title}\n${t('taskDue')}: ${task.dueDate}\n${t('taskDetails')}: ${task.note}`:''}`.slice(0,700);}

export function FloatingAgentChat(){
  const {data,busy,run,stop,workspace}=useCrm();
  const {t}=useLanguage();
  const [open,setOpen]=useState(false);
  const [prompt,setPrompt]=useState('');
  const [messages,setMessages]=useState<ChatMessage[]>([]);
  const input=useRef<HTMLTextAreaElement>(null);
  const messageArea=useRef<HTMLDivElement>(null);
  const nextMessageId=useRef(0);
  useEffect(()=>{
    function shortcut(event:KeyboardEvent){
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
        event.preventDefault();setOpen(true);
      }
      if(event.key==='Escape'&&open)setOpen(false);
    }
    window.addEventListener('keydown',shortcut);
    return ()=>window.removeEventListener('keydown',shortcut);
  },[open]);
  useEffect(()=>{if(open)requestAnimationFrame(()=>input.current?.focus());},[open]);
  useEffect(()=>{if(open)messageArea.current?.scrollTo({top:messageArea.current.scrollHeight});},[messages,busy,open]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const question=prompt.trim();
    if(!question||busy)return;
    const conversation=messages.slice(-6).map(({role,content})=>({role,content:content.slice(0,700)}));
    const userMessage={id:++nextMessageId.current,role:'user' as const,content:question};
    setMessages(current=>[...current,userMessage]);
    setPrompt('');setOpen(true);
    const result=await run(question,workspace?.items.map(item=>item.deal.id).slice(0,4),conversation);
    const assistantMessage={id:++nextMessageId.current,role:'assistant' as const,content:result?workspaceReply(result,t):t('chatFailed')};
    setMessages(current=>[...current,assistantMessage]);
  }
  return <>
    {!open?<Button type="button" className="floating-agent-trigger" onClick={()=>setOpen(true)} aria-label={t('askCrm')} aria-expanded={false}><MessageCircleMore size={17}/><span>{t('askCrm')}</span><kbd>⌘ / Ctrl K</kbd></Button>:null}
    {open?<aside className="floating-agent-chat" aria-labelledby="crm-chat-title">
      <header className="floating-agent-chat-header"><div><span className="floating-agent-chat-mark"><MessageCircleMore size={16}/></span><div><h2 id="crm-chat-title">{t('chatTitle')}</h2><p>{data?.mode==='live'?t('chatLive'):t('chatDemo')}</p></div></div><div className="floating-agent-chat-actions"><Button type="button" variant="ghost" size="icon-sm" onClick={()=>setMessages([])} disabled={!messages.length||busy} aria-label={t('newConversation')}><RotateCcw size={15}/></Button><Button type="button" variant="ghost" size="icon-sm" onClick={()=>setOpen(false)} aria-label={t('minimizeChat')}><Minimize2 size={16}/></Button></div></header>
      <div ref={messageArea} className="floating-agent-messages" role="log" aria-live="polite" aria-relevant="additions text">
        {!messages.length?<div className="floating-agent-empty"><strong>{t('keepThread')}</strong><p>{t('chatEmpty')}</p></div>:messages.map(message=><article key={message.id} className={`floating-agent-message ${message.role}`}><span>{message.role==='user'?t('you'):t('chatTitle')}</span>{message.role==='assistant'?<Prose>{message.content}</Prose>:<p>{message.content}</p>}</article>)}
        {busy?<div className="floating-agent-thinking" role="status">{t('checkingRecords')}</div>:null}
      </div>
      <form className="floating-agent-composer" onSubmit={submit}>
        <label className="sr-only" htmlFor="crm-prompt">{t('chatInputLabel')}</label>
        <textarea id="crm-prompt" ref={input} value={prompt} maxLength={1200} rows={2} onChange={event=>setPrompt(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();event.currentTarget.form?.requestSubmit();}}} placeholder={t('chatInput')} disabled={busy} aria-describedby="floating-command-help"/>
        <div className="floating-agent-composer-footer"><p id="floating-command-help">{data?.mode==='live'?t('chatLiveHelp'):t('chatDemoHelp')}</p>{busy?<Button type="button" variant="outline" onClick={stop} aria-label={t('stopRun')}><Square size={14}/> {t('stop')}</Button>:<Button type="submit" disabled={!prompt.trim()||!data} aria-label={t('runRequest')}><ArrowUp size={18}/><span>{t('send')}</span></Button>}</div>
      </form>
    </aside>:null}
  </>;
}
