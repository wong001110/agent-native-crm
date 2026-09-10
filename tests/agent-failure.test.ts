import {afterEach,describe,expect,it} from 'vitest';
import {MockLanguageModelV3} from 'ai/test';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {DemoStore} from '../src/lib/demo-store';
import {runAgent} from '../src/lib/agent/run';
const dirs:string[]=[];
async function store(){const dir=await mkdtemp(join(tmpdir(),'agent-failure-'));dirs.push(dir);return new DemoStore(join(dir,'data.json'));}
afterEach(async()=>{await Promise.all(dirs.splice(0).map(d=>rm(d,{recursive:true,force:true})));});
const usage={inputTokens:{total:0,noCache:0,cacheRead:undefined,cacheWrite:undefined},outputTokens:{total:0,text:0,reasoning:undefined}};
describe('agent failure paths',()=>{
  it('persists redacted provider failure without swapping to a successful mock',async()=>{const db=await store();const model=new MockLanguageModelV3({doGenerate:async()=>{throw new Error('provider credential secret-must-not-leak');}});const result=await runAgent(db,'session',{prompt:'Why ACME?'},{mode:'live',model});expect(result.status).toBe('failed');expect(result.mode).toBe('live');expect(result.workspace).toBeNull();expect(result.error).not.toContain('secret-must-not-leak');expect((await db.getRun(result.id,'session'))?.status).toBe('failed');});
  it('rejects invalid structured output',async()=>{const db=await store();const model=new MockLanguageModelV3({doGenerate:async()=>({content:[{type:'text',text:'{"workspace":{"type":"execute-jsx","code":"alert(1)"}}'}],finishReason:{unified:'stop',raw:undefined},usage,warnings:[]})});const result=await runAgent(db,'session',{prompt:'Render a page'},{mode:'live',model});expect(result.status).toBe('failed');expect(result.workspace).toBeNull();});
  it('terminates a model that keeps asking for tools',async()=>{const db=await store();let calls=0;const model=new MockLanguageModelV3({doGenerate:async()=>({content:[{type:'tool-call',toolCallId:`repeat-${++calls}`,toolName:'get_crm_summary',input:'{}'}],finishReason:{unified:'tool-calls',raw:undefined},usage,warnings:[]})});const result=await runAgent(db,'session',{prompt:'Never stop'},{mode:'live',model});expect(calls).toBeLessThanOrEqual(6);expect(result.status).toBe('failed');expect((await db.snapshot('session')).tasks).toHaveLength(0);});
});
