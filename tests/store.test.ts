import {afterEach,describe,expect,it} from 'vitest';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {randomUUID} from 'node:crypto';
import {DemoStore} from '../src/lib/demo-store';
import {draftProposal,summaryOf} from '../src/lib/domain';
import {taskDraftSchema,workspacePlanSchema} from '../src/lib/contracts';
import {seedSnapshot} from '../src/lib/seed';
const dirs:string[]=[];
async function fixture(){const dir=await mkdtemp(join(tmpdir(),'crm-'));dirs.push(dir);return {file:join(dir,'store.json'),store:new DemoStore(join(dir,'store.json')),session:randomUUID()};}
const draft={dealId:'deal-acme',title:'Answer security questions',note:'Review the three unresolved items.',dueDate:'2026-09-12'};
afterEach(async()=>{await Promise.all(dirs.splice(0).map(d=>rm(d,{recursive:true,force:true})));});
describe('source-of-record and task boundary',()=>{
  it('computes deterministic totals',()=>{expect(summaryOf(seedSnapshot())).toMatchObject({deals:12,customers:12,pipelineValue:535000,tasks:0});});
  it('rejects malformed input and executable UI shapes',()=>{expect(taskDraftSchema.safeParse({...draft,title:'  '}).success).toBe(false);expect(workspacePlanSchema.safeParse({workspace:{type:'jsx',code:'alert(1)'}}).success).toBe(false);});
  it('does not mutate CRM when preparing a proposal',async()=>{const {store,session}=await fixture();await store.saveProposal(draftProposal(session,draft,null));expect((await store.snapshot(session)).tasks).toHaveLength(0);});
  it('approves once and persists through a fresh adapter',async()=>{const {store,file,session}=await fixture();const p=draftProposal(session,draft,null);await store.saveProposal(p);const [a,b]=await Promise.all([store.approve(p.id,session),store.approve(p.id,session)]);expect(a.id).toBe(b.id);expect((await new DemoStore(file).snapshot(session)).tasks).toHaveLength(1);});
  it('rejects another session and isolates task visibility',async()=>{const {store,session}=await fixture();const p=draftProposal(session,draft,null);await store.saveProposal(p);await expect(store.approve(p.id,'other')).rejects.toThrow('not available');await store.approve(p.id,session);expect((await store.snapshot('other')).tasks).toHaveLength(0);});
  it('cannot approve a rejected proposal',async()=>{const {store,session}=await fixture();const p=draftProposal(session,draft,null);await store.saveProposal(p);await store.reject(p.id,session);await expect(store.approve(p.id,session)).rejects.toThrow('rejected');});
  it('cannot approve an expired proposal',async()=>{const {store,session}=await fixture();const p=draftProposal(session,draft,null,new Date('2020-01-01'));await store.saveProposal(p);await expect(store.approve(p.id,session)).rejects.toThrow('expired');});
  it('rejects nonexistent deals',async()=>{const {store,session}=await fixture();await expect(store.saveProposal(draftProposal(session,{...draft,dealId:'missing'},null))).rejects.toThrow('does not exist');});
  it('never silently resets corrupt storage',async()=>{const {store,file,session}=await fixture();await writeFile(file,'{broken');await expect(store.snapshot(session)).rejects.toThrow('not silently reset');});
  it('executes the stored payload rather than a mutated caller object',async()=>{const {store,session}=await fixture();const p=draftProposal(session,draft,null);await store.saveProposal(p);p.draft.title='Tampered locally';const task=await store.approve(p.id,session);expect(task.title).toBe(draft.title);});
});
