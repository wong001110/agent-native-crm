import { beforeAll, afterAll, afterEach, describe, test, expect, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { and,eq,sql } from 'drizzle-orm';
import { z } from 'zod';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createWorkspace,loadData,getRun,beginRun } from '@/lib/db/repository';
import { getDb,getPool } from '@/lib/db/client';
import * as tables from '@/lib/db/schema';
import { getConfig,AppError,publicError } from '@/lib/config';
import { encodeSession,decodeSession,sameOrigin,jsonBody,requireSession,sessionCookie } from '@/lib/security';
import { summarize,type WorkspaceSpec } from '@/lib/domain';
import { createCrmTools } from '@/lib/agent/tools';
import { runFixture } from '@/lib/agent/mock';
import { runLiveAgent } from '@/lib/agent/live';
import { executeRun } from '@/lib/agent/runner';
import { workspaceSchema,hydrateWorkspace,newObservations } from '@/lib/workspace';
import { proposeTask,decideProposal } from '@/lib/actions';
let workspaceId:string;let otherId:string;
const signal=()=>new AbortController().signal;
const tomorrow=()=>new Date(Date.now()+86400000).toISOString().slice(0,10);
const proposalInput=()=>({dealId:'acme',title:'Clarify the security questions',dueDate:tomorrow()});
const makeSpec=():WorkspaceSpec=>({type:'investigation',title:'ACME context',summary:'Security review may need a follow-up.',items:[{dealId:'acme',interpretation:'The unanswered questions may be blocking progress.',evidenceIds:['acme-security'],emphasis:'risk'}]});
async function context(){const seen=newObservations();const result=createCrmTools(workspaceId,seen,()=>{},signal());await result.handlers.get_account_context({dealId:'acme'});return seen;}
beforeAll(async()=>{workspaceId=await createWorkspace();otherId=await createWorkspace();});
afterEach(()=>{vi.unstubAllEnvs();});
afterAll(async()=>{await getDb().delete(tables.workspaces).where(sql`${tables.workspaces.id} in (${workspaceId},${otherId})`);await getPool().end();});

describe('P1: deterministic persisted system of record',()=>{
 test('P1-R2-C1 / P1-R2-C2: seed relationships and totals',async()=>{const data=await loadData(workspaceId);expect(data.deals).toHaveLength(8);expect(data.customers).toHaveLength(8);expect(data.activities).toHaveLength(13);expect(summarize(data)).toMatchObject({activeDeals:6,totalDeals:8,pipelineValue:344000,openTasks:1});for(const deal of data.deals)expect(data.customers.some(c=>c.id===deal.customerId)).toBe(true);expect((await loadData(workspaceId)).deals).toEqual(data.deals);});
 test('P1-R2-C2: workspaces are independent',async()=>{await getDb().update(tables.deals).set({value:82001}).where(and(eq(tables.deals.workspaceId,otherId),eq(tables.deals.id,'acme')));expect((await loadData(workspaceId)).deals.find(d=>d.id==='acme')?.value).toBe(82000);});
});
describe('P2: real tools, explicit fixture behavior',()=>{
 test('P2-R2-C1: all five tools execute scoped queries',async()=>{const seen=newObservations();const events:string[]=[];const {handlers}=createCrmTools(workspaceId,seen,e=>events.push(e.tool));expect(await handlers.get_crm_summary()).toMatchObject({activeDeals:6});expect(await handlers.list_deals({minValue:80000})).toMatchObject({totalMatching:2});await handlers.get_deal({dealId:'acme'});await handlers.get_account_context({dealId:'acme'});await handlers.get_recent_activities({dealIds:['acme'],days:30});expect(new Set(events).size).toBe(5);expect(seen.activities.get('acme-security')?.dealId).toBe('acme');expect(seen.activities.has('nova-budget')).toBe(false);});
 test('P2-R2-C1: invalid IDs and parameters fail explicitly',async()=>{const {handlers}=createCrmTools(workspaceId,newObservations(),()=>{});await expect(handlers.get_deal({dealId:'missing'})).rejects.toMatchObject({status:404});await expect(handlers.list_deals({minValue:-1})).rejects.toThrow();});
 test('P2-R2-C2: all fixture workspaces and empty results use source facts',async()=>{const common={workspaceId,totalDeals:8,signal:signal(),emit:()=>{}};const focus=await runFixture({...common,prompt:'What should I focus on today?'});expect(focus.spec.type).toBe('focus');expect(focus.spec.items.map(i=>i.dealId)).toEqual(['acme','nova']);const investigate=await runFixture({...common,prompt:'Why ACME?'});expect(investigate.records[0].deal.value).toBe(82000);const compare=await runFixture({...common,prompt:'Compare ACME and Nova'});expect(compare.records).toHaveLength(2);expect((await runFixture({...common,prompt:'Show deals over RM1,000,000'})).records).toHaveLength(0);});
 test('P2-R2-C2: unsupported fixture requests are not faked',async()=>{await expect(runFixture({workspaceId,prompt:'Write a poem',totalDeals:8,signal:signal(),emit:()=>{}})).rejects.toMatchObject({code:'FIXTURE_LIMIT'});});
 test('P2-R2-C2: changed database values flow into fixture views',async()=>{const view=await runFixture({workspaceId:otherId,prompt:'Why ACME?',totalDeals:8,signal:signal(),emit:()=>{}});expect(view.records[0].deal.value).toBe(82001);});
 test('P2-R1-C2: live configuration is fail-closed and bounded',()=>{expect(()=>getConfig({AGENT_MODE:'live'})).toThrow();expect(()=>getConfig({AGENT_MODE:'invalid'})).toThrow();const cfg=getConfig({AGENT_MODE:'live',DEEPSEEK_API_KEY:'test-only-key',DEMO_ACCESS_TOKEN:'test-access-token',SESSION_SECRET:'a'.repeat(32)});expect(cfg.mode).toBe('live');expect(cfg.maxSteps).toBe(6);expect(cfg.timeoutMs).toBeLessThanOrEqual(45000);});
 test('P2-R1-C1: actual DeepSeek provider and ToolLoopAgent exchange tool results (MOCK HTTP TRANSPORT, not real inference)',async()=>{
   const bodies:Record<string,unknown>[]=[];let n=0;
   const fakeFetch:typeof fetch=async(_input,init)=>{
     bodies.push(JSON.parse(String(init?.body)));
     const call=n++===0?{name:'get_account_context',arguments:JSON.stringify({dealId:'acme'})}:{name:'show_workspace',arguments:JSON.stringify(makeSpec())};
     return Response.json({id:`fixture-${n}`,object:'chat.completion',created:1,model:'deepseek-v4-flash',choices:[{index:0,message:{role:'assistant',content:null,tool_calls:[{id:`tool-${n}`,type:'function',function:call}]},finish_reason:'tool_calls'}],usage:{prompt_tokens:10,completion_tokens:20,total_tokens:30}});
   };
   const model=createDeepSeek({apiKey:'not-a-real-key',fetch:fakeFetch})('deepseek-v4-flash');
   const view=await runLiveAgent({workspaceId,prompt:'Why ACME?',totalDeals:8,signal:signal(),emit:()=>{},model});
   expect(n).toBe(2);expect(view.records[0].deal.value).toBe(82000);expect(JSON.stringify(bodies[1].messages)).toContain('acme-security');expect(JSON.stringify(bodies[1].messages)).toContain('tool');
 });
 test('P2-R1-C2: failed provider does not silently use fixture data',async()=>{
   const model=createDeepSeek({apiKey:'not-a-real-key',fetch:async()=>Response.json({error:{message:'provider down'}},{status:503})})('deepseek-v4-flash');
   await expect(runLiveAgent({workspaceId,prompt:'Why ACME?',totalDeals:8,signal:signal(),emit:()=>{},model})).rejects.toThrow();
 });
 test('P2-R2-C1: the read-tool budget is enforced',async()=>{const {handlers}=createCrmTools(workspaceId,newObservations(),()=>{});for(let i=0;i<18;i++)await handlers.get_crm_summary();await expect(handlers.get_crm_summary()).rejects.toMatchObject({code:'TOOL_BUDGET'});});
});
describe('P3: constrained source-grounded workspace',()=>{
 test('P3-R1-C1: reject unknown renderer or arbitrary JSX fields',()=>{expect(workspaceSchema.safeParse({...makeSpec(),type:'raw_html'}).success).toBe(false);expect(workspaceSchema.safeParse({...makeSpec(),jsx:'<script/>'}).success).toBe(false);});
 test('P3-R1-C2: reject unseen records and invalid evidence associations',async()=>{expect(()=>hydrateWorkspace(makeSpec(),newObservations(),8)).toThrow();const seen=await context();expect(()=>hydrateWorkspace({...makeSpec(),items:[{...makeSpec().items[0],evidenceIds:['nova-budget']}]},seen,8)).toThrow();});
 test('P3-R1-C2: source values are hydrated, not model-authored',async()=>{const seen=await context();const view=hydrateWorkspace(makeSpec(),seen,8);expect(view.records[0].deal.value).toBe(82000);expect(view.scope.retrievedDeals).toBe(1);expect(view.scope.totalDeals).toBe(8);expect(view.records[0].timeline).toHaveLength(4);});
 test('P3-R1-C2: action target must be among retrieved/displayed deals',async()=>{const seen=await context();expect(()=>hydrateWorkspace({...makeSpec(),action:{type:'create_task',...proposalInput(),dealId:'nova'}},seen,8)).toThrow();});
});
describe('P4: server-owned proposal, approval and persistence',()=>{
 test('P4-R1-C1: proposal/rejection do not create a task',async()=>{const before=(await loadData(workspaceId)).tasks.length;const proposal=await proposeTask(workspaceId,proposalInput());expect((await loadData(workspaceId)).tasks).toHaveLength(before);expect(await decideProposal(workspaceId,proposal.id,'reject')).toMatchObject({status:'rejected'});expect((await loadData(workspaceId)).tasks).toHaveLength(before);await expect(decideProposal(workspaceId,proposal.id,'approve')).rejects.toMatchObject({status:409});});
 test('P4-R1-C2: concurrent repeated approval commits exactly one task and activity',async()=>{const before=await loadData(workspaceId);const proposal=await proposeTask(workspaceId,proposalInput());const results=await Promise.all([decideProposal(workspaceId,proposal.id,'approve'),decideProposal(workspaceId,proposal.id,'approve')]);expect(results[0].taskId).toBe(results[1].taskId);const after=await loadData(workspaceId);expect(after.tasks).toHaveLength(before.tasks.length+1);expect(after.activities).toHaveLength(before.activities.length+1);expect(results.some(r=>r.replayed)).toBe(true);});
 test('P4-R1-C3: cross-workspace proposal is inaccessible',async()=>{const proposal=await proposeTask(workspaceId,proposalInput());await expect(decideProposal(otherId,proposal.id,'approve')).rejects.toMatchObject({status:404});});
 test('P4-R1-C3: expired proposal cannot execute',async()=>{const proposal=await proposeTask(workspaceId,proposalInput());await getDb().update(tables.proposals).set({expiresAt:new Date(Date.now()-1000).toISOString()}).where(eq(tables.proposals.id,proposal.id));await expect(decideProposal(workspaceId,proposal.id,'approve')).rejects.toMatchObject({code:'EXPIRED'});});
 test('P4-R1-C3: changed deal invalidates proposal',async()=>{const proposal=await proposeTask(otherId,proposalInput());await getDb().update(tables.deals).set({updatedAt:new Date().toISOString()}).where(and(eq(tables.deals.workspaceId,otherId),eq(tables.deals.id,'acme')));await expect(decideProposal(otherId,proposal.id,'approve')).rejects.toMatchObject({code:'STALE'});});
 test('P4-R1-C3: unknown target and arbitrary approved payload fail',async()=>{await expect(proposeTask(workspaceId,{...proposalInput(),approved:true})).rejects.toThrow();await expect(proposeTask(workspaceId,{...proposalInput(),dealId:'missing'})).rejects.toMatchObject({status:404});});
 test('P4-R1-C3: a failed originating run cannot authorize a proposal',async()=>{const run=await beginRun(workspaceId,'failure test','mock');const proposal=await proposeTask(workspaceId,proposalInput(),run.id);await getDb().update(tables.runs).set({status:'failed'}).where(eq(tables.runs.id,run.id));await expect(decideProposal(workspaceId,proposal.id,'approve')).rejects.toMatchObject({code:'RUN'});});
 test('P4-R2-C1 / P4-R2-C2: full agent run proposes, then approval persists and audit reads current status',async()=>{const run=await beginRun(workspaceId,'Prepare a follow-up task for ACME.','mock');const result=await executeRun({run,workspaceId,signal:signal(),emit:()=>{}});expect(result.status).toBe('completed');const proposal=result.workspace!.proposal!;expect(proposal.status).toBe('pending');await decideProposal(workspaceId,proposal.id,'approve');expect((await loadData(workspaceId)).tasks.some(t=>t.title===proposal.title)).toBe(true);expect((await getRun(workspaceId,run.id)).workspace?.proposal?.status).toBe('approved');});
 test('P4-R2-C2: cancellation never creates a CRM task',async()=>{const before=(await loadData(workspaceId)).tasks.length;const run=await beginRun(workspaceId,'Prepare a follow-up task for ACME.','mock');const controller=new AbortController();controller.abort();await expect(executeRun({run,workspaceId,signal:controller.signal,emit:()=>{}})).rejects.toThrow();expect((await loadData(workspaceId)).tasks).toHaveLength(before);expect((await getRun(workspaceId,run.id)).status).toBe('cancelled');});
});
describe('P4: request and secret boundaries',()=>{
 test('P4-R3-C1: signed sessions reject tampering',()=>{const id=randomUUID();const signed=encodeSession(id,'test-secret');expect(decodeSession(signed,'test-secret')).toBe(id);expect(decodeSession(signed+'x','test-secret')).toBeNull();expect(decodeSession(signed,'wrong-secret')).toBeNull();});
 test('P4-R3-C1: an issued session resolves only to its workspace',async()=>{const url='http://localhost:3000/api/state';const cookie=sessionCookie(new Request(url),workspaceId).split(';')[0];expect(await requireSession(new Request(url,{headers:{cookie}}))).toBe(workspaceId);});
 test('P4-R3-C1: changing mode/access policy invalidates old sessions',async()=>{const url='http://localhost:3000/api/state';const cookie=sessionCookie(new Request(url),workspaceId).split(';')[0];vi.stubEnv('DEMO_ACCESS_TOKEN','new-policy-token');await expect(requireSession(new Request(url,{headers:{cookie}}))).rejects.toMatchObject({status:401});});
 test('P4-R3-C1: cross-origin writes are rejected',()=>{expect(()=>sameOrigin(new Request('http://localhost:3000/api/actions',{headers:{origin:'https://attacker.example'}}))).toThrow();expect(()=>sameOrigin(new Request('http://localhost:3000/api/actions',{headers:{origin:'http://localhost:3000'}}))).not.toThrow();});
 test('P4-R3-C2: invalid and oversized request bodies are rejected',async()=>{const request=(body:unknown)=>new Request('http://localhost:3000',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});await expect(jsonBody(request({x:'a'.repeat(9000)}),z.object({x:z.string()}))).rejects.toMatchObject({status:413});await expect(jsonBody(request({approved:true}),z.object({}).strict())).rejects.toMatchObject({status:400});});
 test('P4-R3-C2: raw provider and database error messages never reach the client',()=>{const result=publicError(new Error('postgres://secret-key-at-provider'));expect(result.message).not.toContain('secret-key');expect(publicError(new AppError('EXPECTED','Safe explanation')).message).toBe('Safe explanation');});
 test('P4-R3-C2: per-session admission budget is enforced',async()=>{for(let i=0;i<8;i++)await beginRun(otherId,'budget test','mock');await expect(beginRun(otherId,'ninth run','mock')).rejects.toMatchObject({status:429});});
});
