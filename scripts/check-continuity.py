"""Small scope/evidence validator; not a replacement for runtime tests or review."""
import json, pathlib, hashlib, subprocess, sys
root = pathlib.Path(__file__).resolve().parents[1]
load = lambda p: json.loads((root / p).read_text())
sources = load('.agent-continuity/sources.json')
manifest = load('.agent-continuity/manifest.json')
state = load('.agent-continuity/state.json')
integration = load('.agent-continuity/integration.json')
requirements = {r['id']: r for r in manifest['requirements']}
assert len(requirements) == len(manifest['requirements']), 'Duplicate requirement ID'
checks = {c['id']: c for r in requirements.values() for c in r['checks']}
assert len(checks) == sum(len(r['checks']) for r in requirements.values()), 'Duplicate check ID'
all_sources = sources['sources'] + sources.get('findings', []) + integration['sources'] + integration['findings']
all_sources += load('.agent-continuity/review-findings.json').get('findings', [])
source_ids = {s['id'] for s in all_sources}
assert len(source_ids) == len(all_sources), 'Duplicate active source ID'
for source in all_sources:
    disposition = source.get('disposition')
    assert disposition in ['mapped','deferred','waived','superseded','rejected'], source['id']
    if disposition == 'mapped':
        assert source.get('requirements'), source['id']
        assert all(r in requirements for r in source['requirements']), source['id']
        assert all(c in checks for c in source.get('checks', [])), source['id']
    else:
        assert source.get('reason'), source['id']
for requirement in requirements.values():
    assert requirement['checks'] and all(s in source_ids for s in requirement['sourceRefs']), requirement['id']
for invariant in manifest['invariants']:
    assert invariant['checks'] and all(c in checks for c in invariant['checks']), invariant['id']
assert state['manifestRevision'] == manifest['revision'], 'Manifest/state drift'
assert state['integrationRevision'] == integration['revision'], 'Integration/state drift'
assert state['mergeAuthorized'] and state['mergeMethod'] == 'squash', 'Current authorization not reconciled'
manifest_hash = hashlib.sha256((root/'.agent-continuity/manifest.json').read_bytes()).hexdigest()
assert state['manifestSha256'] == manifest_hash, 'Manifest hash drift'
base = integration['baselineArchive'] + '/.agent-continuity/'
base_sources = load(base + 'sources.json')['sources']
base_manifest = load(base + 'plans/mvp.json')
base_checks = {c['id'] for r in base_manifest['requirements'] for c in r['checks']}
assert set(integration['baselineCheckMap']) == base_checks, 'Baseline check omitted or invented'
for old, targets in integration['baselineCheckMap'].items():
    assert targets and all(c in checks for c in targets), old
mapped = integration['baselineSourceRequirements']
preserved = set(integration['preservedBaselineDispositions'])
assert not (set(mapped) & preserved), 'Ambiguous baseline source disposition'
assert set(mapped) | preserved == {s['id'] for s in base_sources}, 'Baseline source omitted or invented'
for old, targets in mapped.items():
    assert targets and all(r in requirements for r in targets), old
for source in base_sources:
    if source['id'] in preserved:
        assert source['disposition'] in ['deferred','rejected','waived','superseded'] and source.get('reason'), source['id']
archive_tree = subprocess.check_output(['git','rev-parse','HEAD:'+integration['baselineArchive']],cwd=root,text=True).strip()
assert archive_tree == integration['baselineTree'], 'Historical baseline archive changed'
for check in checks.values():
    if check.get('disposition') == 'deferred':
        assert check.get('reason') and check.get('destination'), check['id']
        assert check['id'] in state['deferredChecks'], check['id']
# Fingerprint executable/config/test inputs; documentation-only closure can bind to this exact artifact.
prefixes = ('src/','tests/','drizzle/')
extras = {'package.json','package-lock.json','components.json','compose.yaml','next.config.ts','next-env.d.ts','playwright.config.ts','postcss.config.mjs','tsconfig.json','vitest.config.ts','scripts/live-smoke.ts','scripts/setup-db.ts'}
paths = subprocess.check_output(['git','ls-files'],cwd=root,text=True).splitlines()
digest = hashlib.sha256()
for path in sorted(p for p in paths if p.startswith(prefixes) or p in extras):
    digest.update(path.encode()+b'\0'+(root/path).read_bytes()+b'\0')
implementation_hash = digest.hexdigest()
if state['completionGate']['status'] == 'passed':
    assert state.get('implementationSha256') == implementation_hash, 'Implementation changed after verification'
    evidence = load('.agent-continuity/evidence.json')
    for identifier, check in checks.items():
        if check.get('disposition') != 'deferred':
            item = evidence['checks'].get(identifier)
            assert item and item['status'] == 'passed' and item.get('artifact') and item.get('commit'), identifier
    assert not state.get('affectedChecks'), 'Stale checks block completion'
print('SCOPE CAPTURE GATE PASSED:',len(all_sources),'active sources/findings,',len(requirements),'requirements,',len(checks),'checks')
print('BASELINE CROSSWALK:',len(base_sources),'sources,',len(base_checks),'checks; no live portion silently passed')
print('Manifest SHA256:',manifest_hash)
print('Implementation SHA256:',implementation_hash)
if '--bootstrap' in sys.argv:
    print(json.dumps({'exercise':'cold-process bootstrap simulation, not a new-agent handoff','project':state['project'],'phase':state['currentPhase'],'mode':state['mode'],'mergeMethod':state['mergeMethod'],'incompleteOrStale':state.get('affectedChecks',[]),'deferred':state['deferredChecks'],'next':state['nextValidAction']},indent=2))
