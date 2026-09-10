import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = path => JSON.parse(fs.readFileSync(path,'utf8'));
const active = read('.agent-continuity/plans/execution.json');
const base = read(active.inherits);
const state = read('.agent-continuity/state.json');
const sources = [...read('.agent-continuity/sources.json').sources, ...active.sources];
const requirements = [...base.requirements,...active.additional_requirements];
const ids = new Set(requirements.map(r=>r.id));
const sourceIds = new Set(sources.map(s=>s.id));
assert.equal(ids.size, requirements.length, 'duplicate requirement IDs');
assert.equal(sourceIds.size,sources.length,'duplicate source IDs');
assert.equal(active.project,state.project);
assert.equal(state.scope_manifest.revision,active.revision);
assert.equal(state.implementation_authorized,true,'authorization not reconciled');
const checks=[];
for (const requirement of requirements) {
  assert(requirement.checks.length,`No checks for ${requirement.id}`);
  for(const source of requirement.source_refs) assert(sourceIds.has(source),`Missing source ${source}`);
  for(const check of requirement.checks) checks.push({...check,...active.check_overrides[check.id],requirementId:requirement.id});
}
const checkIds=new Set(checks.map(c=>c.id));
assert.equal(checkIds.size,checks.length,'duplicate check IDs');
for(const source of sources) {
  assert(source.disposition && source.disposition!=='unmapped',`Unmapped source ${source.id}`);
  for(const id of source.requirement_refs ?? []) assert(ids.has(id),`Missing mapped requirement ${id}`);
}
for(const inv of base.invariants) for(const id of inv.check_refs) assert(checkIds.has(id),`Uncovered invariant ${inv.id}`);
for(const id of Object.keys(active.check_overrides)) assert(checkIds.has(id),`Unknown override ${id}`);
for(const check of checks) if(check.disposition==='deferred') assert(check.reason && check.destination,`Undocumented defer ${check.id}`);
for(const [id,result] of Object.entries(state.checks)) {
  assert(checkIds.has(id),`Unknown state check ${id}`);
  if(result.status==='passed') assert(result.evidence?.length,`False pass ${id}`);
}
const events=fs.readFileSync('.agent-continuity/events.jsonl','utf8').trim().split('\n').map(JSON.parse);
assert.equal(new Set(events.map(e=>e.id)).size,events.length,'duplicate event IDs');
console.log(JSON.stringify({gate:'scope-capture',status:'passed',revision:active.revision,sources:sources.length,requirements:requirements.length,checks:checks.length,deferred:checks.filter(c=>c.disposition==='deferred').map(c=>c.id),next:state.next_valid_action},null,2));
if(process.argv.includes('--inventory')) for(const check of checks) console.log(`${check.id}\t${check.disposition ?? 'required'}\t${state.checks[check.id]?.status ?? 'pending'}`);
