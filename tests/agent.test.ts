import {afterEach,describe,expect,it} from 'vitest';
import {MockLanguageModelV3} from 'ai/test';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {randomUUID} from 'node:crypto';
import {DemoStore} from '../src/lib/demo-store';
import {runAgent,liveModel,agentMode} from '../src/lib/agent/run';
import {observedContext} from '../src/lib/agent/tools';
import {hydrateWorkspace} from '../src/lib/agent/hydrate';
import {seedSnapshot} from '../src/lib/seed';
import type {AgentEvent} from '../src/lib/contracts';
const dirs:string[]=[];
async function fixture(){const dir=await mkdtemp(join(tmpdir(),'agent-'));dirs.push(dir);return {store:new DemoStore(join(dir,'state.json')),session:randomUUID()};}
afterEach(async()=>{await Promise.all(dirs.splice(0).map(d=>rm(d,{recursive:true,force:true})));});
describe('bounded agent loop with scripted provider',()=>{
  it('executes real tools and hydrates a Focus workspace',async()=>{const {store,session}=await fixture();const events:AgentEvent[]=[];const run=await runAgent(store,session,{prompt:'What should I focus on today?'},{mode:'mock',onEvent:e=>events.push(e)});expect(run.error).toBeNull();expect(run.status).toBe('succeeded');expect(run.workspace?.type).toBe('focus');expect(run.workspace?.items).toHaveLength(3);expect(run.workspace?.items[0].deal.value).toBe(82000);expect(events.some(e=>e.type==='tool'&&e.event.tool==='get_account_context')).toBe(true);expect((await store.getRun(run.id,session))?.workspace).toEqual(run.workspace);});
  it('investigates with scoped evidence and no mutation',async()=>{const {store,session}=await fixture();const run=await runAgent(store,session,{prompt:'Why ACME?'},{mode:'mock'});expect(run.workspace?.type).toBe('investigation');expect(run.workspace?.items[0].evidence).toHaveLength(2);expect((await store.snapshot(session)).tasks).toHaveLength(0);});
  it('uses recent chat context to resolve a follow-up before re-reading source records',async()=>{const {store,session}=await fixture();const run=await runAgent(store,session,{prompt:'What about it?',conversation:[{role:'user',content:'Why ACME?'},{role:'assistant',content:'ACME has unanswered security questions in the current proposal.'}]},{mode:'mock'});expect(run.workspace?.type).toBe('investigation');expect(run.workspace?.items[0].customer.name).toBe('ACME');expect(run.workspace?.items[0].evidence).toHaveLength(2);});
  it('does not prepare a task from a historical request',async()=>{const {store,session}=await fixture();const run=await runAgent(store,session,{prompt:'What exactly will that task contain?',conversation:[{role:'user',content:'Create a follow-up task for ACME.'},{role:'assistant',content:'A task proposal is ready for review.'}]},{mode:'mock'});expect(run.status).toBe('succeeded');expect(run.events.some(event=>event.tool==='prepare_task')).toBe(false);expect(run.workspace?.proposal).toBeNull();});
  it('renders comparison from source facts',async()=>{const {store,session}=await fixture();const run=await runAgent(store,session,{prompt:'Compare ACME and Nova'},{mode:'mock'});expect(run.error).toBeNull();expect(run.workspace?.type).toBe('comparison');expect(run.workspace?.items.map(x=>x.customer.name)).toEqual(['ACME','Nova']);});
  it('prepares a task but only approval mutates the CRM',async()=>{const {store,session}=await fixture();const run=await runAgent(store,session,{prompt:'Create a follow-up task.',contextDealIds:['deal-acme']},{mode:'mock'});expect(run.error).toBeNull();const proposal=run.workspace?.proposal;expect(proposal?.status).toBe('pending');expect((await store.snapshot(session)).tasks).toHaveLength(0);await store.approve(proposal!.id,session);expect((await store.snapshot(session)).tasks).toHaveLength(1);});
  it('discloses unsupported scripted requests instead of fabricating data',async()=>{const {store,session}=await fixture();const run=await runAgent(store,session,{prompt:'Write a poem'},{mode:'mock'});expect(run.workspace?.items).toHaveLength(0);expect(run.workspace?.summary).toContain('Scripted mode');});
  it('records cancellation without changing CRM data',async()=>{const {store,session}=await fixture();const cancel=new AbortController();cancel.abort();const run=await runAgent(store,session,{prompt:'Why ACME?'},{mode:'mock',signal:cancel.signal});expect(run.status).toBe('cancelled');expect((await store.snapshot(session)).tasks).toHaveLength(0);});
});
describe('model and fact boundaries',()=>{
  it('does not silently turn live mode into mock mode',()=>{expect(()=>liveModel({AGENT_MODE:'live'})).toThrow('Mock mode was not substituted');expect(()=>agentMode({AGENT_MODE:'typo'})).toThrow('must be');});
  it('rejects unobserved record IDs',()=>{const ctx=observedContext(seedSnapshot());expect(()=>hydrateWorkspace({type:'focus',title:'Bad',summary:'',proposalId:null,items:[{dealId:'deal-acme',signal:'neutral',interpretation:'x',evidenceIds:[]}]},ctx,'run','live')).toThrow('did not retrieve');});
  it('rejects cross-account evidence',()=>{const s=seedSnapshot(),ctx=observedContext(s);ctx.deals.set('deal-acme',s.deals[0]);ctx.customers.set('acme',s.customers[0]);ctx.activities.set('act-nova-01',s.activities.find(a=>a.id==='act-nova-01')!);expect(()=>hydrateWorkspace({type:'investigation',title:'Bad',summary:'',proposalId:null,items:[{dealId:'deal-acme',signal:'attention',interpretation:'x',evidenceIds:['act-nova-01']}]},ctx,'run','live')).toThrow('does not belong');});
  it('normalizes incomplete model JSON to retrieved, account-safe workspace facts',async()=>{
    const {store,session}=await fixture();let step=0;
    const usage={inputTokens:{total:0,noCache:0,cacheRead:undefined,cacheWrite:undefined},outputTokens:{total:0,text:0,reasoning:undefined}};
    const model=new MockLanguageModelV3({doGenerate:async()=>{
      step++;
      const response=(content:({type:'text';text:string}|{type:'tool-call';toolCallId:string;toolName:string;input:string})[],reason:'stop'|'tool-calls')=>({content,finishReason:{unified:reason,raw:undefined},usage,warnings:[]});
      if(step===1)return response([{type:'tool-call',toolCallId:'list',toolName:'list_deals',input:'{}'}],'tool-calls');
      if(step===2)return response([{type:'tool-call',toolCallId:'acme',toolName:'get_account_context',input:'{"dealId":"deal-acme"}'},{type:'tool-call',toolCallId:'nova',toolName:'get_account_context',input:'{"dealId":"deal-nova"}'}],'tool-calls');
      return response([{type:'text',text:JSON.stringify({type:'comparison',summary:42,proposalId:'not-a-proposal',items:[{dealId:'deal-acme',signal:'attention',evidenceIds:['act-nova-01','act-acme-01','act-acme-01']},{dealId:'deal-acme',signal:'watch',interpretation:'duplicate deal',evidenceIds:['act-acme-01']},{dealId:'deal-nova',signal:'opportunity',interpretation:'',evidenceIds:['act-acme-01']},{dealId:'deal-not-read',signal:'attention',interpretation:'ignore',evidenceIds:['act-acme-01']} ]})}],'stop');
    }});
    const run=await runAgent(store,session,{prompt:'Compare ACME and Nova'},{mode:'live',model});
    expect(run.status).toBe('succeeded');expect(run.workspace?.type).toBe('comparison');expect(run.workspace?.title).toBe('Retrieved CRM records');expect(run.workspace?.summary).toContain('retrieved in this run');expect(run.workspace?.proposal).toBeNull();
    expect(run.workspace?.items).toHaveLength(2);expect(run.workspace?.items[0]).toMatchObject({signal:'attention',interpretation:'Review the retrieved CRM source records before choosing a next step.'});expect(run.workspace?.items[0].evidence.map(e=>e.id)).toEqual(['act-acme-01']);expect(run.workspace?.items[1]).toMatchObject({signal:'neutral'});expect(run.workspace?.items[1].evidence).toHaveLength(0);
  });
});
