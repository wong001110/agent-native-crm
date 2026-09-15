'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import type {Snapshot,Summary,PublicRun,Workspace,ToolEvent,AgentEvent,PublicProposal,ConversationTurn} from '@/lib/contracts';
import {useLanguage} from './language-provider';
export type CrmData={snapshot:Snapshot;summary:Summary;runs:PublicRun[];mode:'mock'|'live';database:string;datasetAsOf:string};
type CrmContextValue={data:CrmData|null;loading:boolean;dataError:string|null;refresh:()=>Promise<void>;workspace:Workspace|null;busy:boolean;runLoading:boolean;events:ToolEvent[];error:string|null;notice:string|null;run:(prompt:string,ids?:string[],conversation?:ConversationTurn[])=>Promise<Workspace|null>;stop:()=>void;clearError:()=>void;updateProposal:(proposal:PublicProposal)=>void};
const Context=createContext<CrmContextValue|null>(null);
export function useCrm(){const ctx=useContext(Context);if(!ctx)throw new Error('CRM provider is required');return ctx;}
export async function jsonRequest<T>(url:string,body?:unknown):Promise<T>{const response=await fetch(url,{method:body===undefined?'GET':'POST',headers:body===undefined?undefined:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});const result=await response.json();if(!response.ok)throw new Error(typeof result.error==='string'?result.error:'The request failed. Please retry.');return result as T;}
export function CrmProvider({children}:{children:React.ReactNode}){
  const {t}=useLanguage();
  const [data,setData]=useState<CrmData|null>(null),[loading,setLoading]=useState(true),[dataError,setDataError]=useState<string|null>(null);
  const [workspace,setWorkspace]=useState<Workspace|null>(null),[busy,setBusy]=useState(false),[runLoading,setRunLoading]=useState(false),[events,setEvents]=useState<ToolEvent[]>([]),[error,setError]=useState<string|null>(null),[notice,setNotice]=useState<string|null>(null);
  const active=useRef<AbortController|null>(null),currentRun=useRef<string|null>(null),router=useRouter(),query=useSearchParams();
  const refresh=useCallback(async()=>{try{setData(await jsonRequest<CrmData>('/api/crm'));setDataError(null);}catch(e){setDataError(e instanceof Error?e.message:t('dataUnavailable'));}finally{setLoading(false);}},[t]);
  useEffect(()=>{void refresh();return ()=>active.current?.abort();},[refresh]);
  const requestedRun=query.get('run');
  useEffect(()=>{
    if(!requestedRun||busy||requestedRun===currentRun.current)return;
    let cancelled=false;setRunLoading(true);setError(null);
    void jsonRequest<{run:PublicRun}>(`/api/runs/${encodeURIComponent(requestedRun)}`).then(({run})=>{
      if(cancelled)return;currentRun.current=run.id;setWorkspace(run.workspace);setEvents(run.events);
      if(run.status==='running')setError(t('runIncomplete'));
      else if(run.error)setError(run.error);
    }).catch(e=>{if(!cancelled)setError(e instanceof Error?e.message:t('savedUnavailable'));}).finally(()=>{if(!cancelled)setRunLoading(false);});
    return ()=>{cancelled=true;};
  },[requestedRun,busy]);
  const run=useCallback(async(prompt:string,ids:string[]=[],conversation:ConversationTurn[]=[]):Promise<Workspace|null>=>{
    if(active.current)return null;
    const controller=new AbortController();active.current=controller;setBusy(true);setError(null);setNotice(null);setEvents([]);router.push('/workspace');
    let receivedTerminal=false,completedWorkspace:Workspace|null=null;
    try{
      const response=await fetch('/api/agent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,contextDealIds:ids,conversation}),signal:controller.signal});
      if(!response.ok){const body=await response.json();throw new Error(body.error??t('agentUnavailable'));}
      if(!response.body)throw new Error(t('noResponse'));
      const reader=response.body.getReader(),decoder=new TextDecoder();let pending='';
      function receive(line:string){
        if(!line.trim())return;const event=JSON.parse(line) as AgentEvent;
        if(event.type==='started'){currentRun.current=event.runId;router.replace(`/workspace?run=${event.runId}`);}
        if(event.type==='tool')setEvents(old=>[...old.filter(x=>x.id!==event.event.id),event.event]);
        if(event.type==='workspace'){receivedTerminal=true;completedWorkspace=event.workspace;setWorkspace(event.workspace);setNotice(`${t('workspace')} ready. ${t('approvalCopy')}`);}
        if(event.type==='error'){receivedTerminal=true;setError(event.message);}
      }
      try{while(!receivedTerminal){const {done,value}=await reader.read();if(done)break;pending+=decoder.decode(value,{stream:true});const lines=pending.split('\n');pending=lines.pop()??'';for(const line of lines)receive(line);}if(!receivedTerminal){pending+=decoder.decode();receive(pending);}if(receivedTerminal)await reader.cancel();}finally{reader.releaseLock();}
      if(!receivedTerminal)throw new Error(t('connectionEnded'));
      return completedWorkspace;
    }catch(e){if(controller.signal.aborted)setNotice(t('runStopped'));else setError(e instanceof Error?e.message:t('runFailed'));return null;}
    finally{active.current=null;setBusy(false);await refresh();}
  },[refresh,router,t]);
  const updateProposal=useCallback((proposal:PublicProposal)=>{setWorkspace(old=>old?.proposal?.id===proposal.id?{...old,proposal}:old);},[]);
  return <Context.Provider value={{data,loading,dataError,refresh,workspace,busy,runLoading,events,error,notice,run,stop:()=>active.current?.abort(),clearError:()=>setError(null),updateProposal}}>{children}</Context.Provider>;
}
