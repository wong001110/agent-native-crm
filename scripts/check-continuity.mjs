import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { resolve, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
const fileHash = path => sha(readFileSync(resolve(root, path)));
const manifestPath = '.agent-continuity/plans/mvp.json';
const sourcesPath = '.agent-continuity/sources.json';
const manifest = read(manifestPath);
const sources = read(sourcesPath);
const crosswalk = read('.agent-continuity/baseline-crosswalk.json');
const baselineSources = read('.agent-continuity/baseline/planning-sources.json');
const baselineManifest = read('.agent-continuity/baseline/planning-manifest.json');
const unique = values => { assert.equal(new Set(values).size, values.length, 'Duplicate stable ID'); return new Set(values); };

function capture(m, s, x) {
  assert.equal(m.project, 'wong001110/agent-native-crm');
  assert.equal(s.project, m.project);
  const requirements = unique(m.requirements.map(r => r.id));
  const checks = unique(m.requirements.flatMap(r => r.checks.map(c => c.id)));
  const sourceIds = unique(s.sources.map(item => item.id));
  for (const item of s.sources) {
    assert.ok(['mapped','deferred','waived','rejected','superseded'].includes(item.disposition), `Unaccounted source ${item.id}`);
    if (item.disposition === 'mapped') {
      assert.ok(item.requirements?.length, `Unmapped source ${item.id}`);
      for (const id of item.requirements) assert.ok(requirements.has(id), `Missing requirement ${id}`);
    } else assert.ok(item.reason, `Missing disposition reason ${item.id}`);
  }
  for (const req of m.requirements) {
    assert.ok(req.sourceRefs.length && req.sourceRefs.every(id => sourceIds.has(id)), `Unknown source for ${req.id}`);
    if (req.disposition === 'required') assert.ok(req.checks.length, `Missing observable checks for ${req.id}`);
    else assert.ok(req.reason && req.destination, `Unexplained deferral ${req.id}`);
  }
  for (const invariant of m.invariants) assert.ok(invariant.checks.length && invariant.checks.every(id => checks.has(id)), `Uncovered invariant ${invariant.id}`);
  unique(x.sources.map(item => item.source)); unique(x.checks.map(item => item.check));
  assert.deepEqual(x.sources.map(item => item.source).sort(), baselineSources.sources.map(item => `PR1/${item.id}`).sort(), 'Baseline source lost');
  assert.deepEqual(x.checks.map(item => item.check).sort(), baselineManifest.requirements.flatMap(req => req.checks.map(check => `PR1/${check.id}`)).sort(), 'Baseline check lost');
  for (const item of x.sources) {
    if (item.disposition === 'mapped') assert.ok(item.requirements?.length && item.requirements.every(id => requirements.has(id)), `Unmapped baseline source ${item.source}`);
    else assert.ok(item.reason, `Unexplained baseline source ${item.source}`);
  }
  for (const item of x.checks) {
    if (item.disposition === 'mapped') assert.ok(item.checks?.length && item.checks.every(id => checks.has(id)), `Unmapped baseline check ${item.check}`);
    else assert.ok(item.reason, `Unexplained baseline check ${item.check}`);
  }
  return { requirements: requirements.size, checks: checks.size, sources: sourceIds.size, baselineSources: x.sources.length, baselineChecks: x.checks.length };
}

// Any code, dependency, migration or test change invalidates prior runtime evidence.
// Documentation and state do not self-reference this conservative fingerprint.
const codePaths = ['src','tests','scripts','drizzle','package.json','package-lock.json','tsconfig.json','next.config.ts','postcss.config.mjs','eslint.config.mjs','vitest.config.ts','playwright.config.ts','components.json','.github/workflows/ci.yml'];
const files = [];
function collect(path) {
  const absolute = resolve(root, path);
  if (statSync(absolute).isDirectory()) for (const name of readdirSync(absolute)) collect(`${path}/${name}`);
  else files.push([relative(root, absolute), fileHash(path)]);
}
codePaths.forEach(collect);
const runtimeHash = sha(JSON.stringify(files.sort((a,b) => a[0].localeCompare(b[0]))));
const result = capture(manifest, sources, crosswalk);
if (process.argv.includes('--self-test')) {
  const clone = value => structuredClone(value);
  const omitted = clone(crosswalk); omitted.sources.pop(); assert.throws(() => capture(manifest, sources, omitted));
  const missing = clone(crosswalk); missing.checks.pop(); assert.throws(() => capture(manifest, sources, missing));
  const invalid = clone(sources); invalid.sources[0].requirements = ['MISSING']; assert.throws(() => capture(manifest, invalid, crosswalk));
  const unchecked = clone(manifest); unchecked.requirements[0].checks = []; assert.throws(() => capture(unchecked, sources, crosswalk));
  console.log('Four negative scope-capture cases passed. These are continuity checks, not product security tests.');
}
if (process.argv.includes('--completion')) {
  const state = read('.agent-continuity/state.json');
  assert.equal(state.manifestHash, fileHash(manifestPath), 'Manifest drift');
  assert.equal(state.sourcesHash, fileHash(sourcesPath), 'Source drift');
  for (const req of manifest.requirements.filter(r => r.disposition === 'required')) for (const check of req.checks) {
    const entry = state.checks[check.id];
    assert.equal(entry?.status, 'passed', `Incomplete: ${check.id}`);
    assert.equal(entry.runtimeHash, runtimeHash, `Stale evidence: ${check.id}`);
    assert.ok(entry.evidence?.length, `Missing evidence: ${check.id}`);
  }
  if (process.argv.includes('--final')) assert.equal(state.freshReviewGate?.status, 'passed', 'Independent fresh review remains incomplete');
}
console.log(JSON.stringify({ captureGate:'passed', ...result, manifestHash:fileHash(manifestPath), sourcesHash:fileHash(sourcesPath), runtimeHash }, null, 2));
