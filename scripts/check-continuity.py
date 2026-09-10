"""Small, fail-closed scope validator; not a generic continuity framework."""
import json, pathlib, hashlib
root = pathlib.Path(__file__).resolve().parents[1]
load = lambda p: json.loads((root / p).read_text())
sources = load('.agent-continuity/sources.json')
manifest = load('.agent-continuity/manifest.json')
state = load('.agent-continuity/state.json')
requirements = {r['id']: r for r in manifest['requirements']}
checks = {c['id']: c for r in requirements.values() for c in r['checks']}
assert len(checks) == sum(len(r['checks']) for r in requirements.values()), 'Duplicate check ID'
all_sources = sources['sources'] + sources.get('findings', [])
source_ids = {s['id'] for s in all_sources}
assert len(source_ids) == len(all_sources), 'Duplicate source ID'
for source in all_sources:
    disposition = source.get('disposition')
    assert disposition in ['mapped','deferred','waived','superseded','rejected'], source['id']
    if disposition == 'mapped':
        assert source.get('requirements'), source['id']
        assert all(r in requirements for r in source['requirements']), source['id']
    else:
        assert source.get('reason'), source['id']
for requirement in requirements.values():
    assert requirement['checks'] and all(s in source_ids for s in requirement['sourceRefs']), requirement['id']
for invariant in manifest['invariants']:
    assert invariant['checks'] and all(c in checks for c in invariant['checks']), invariant['id']
assert state['manifestRevision'] == manifest['revision'], 'Manifest/state drift'
for check in checks.values():
    if check.get('disposition') == 'deferred':
        assert check.get('reason') and check.get('destination'), check['id']
        assert check['id'] in state['deferredChecks'], check['id']
if state['completionGate']['status'] == 'passed':
    evidence = load('.agent-continuity/evidence.json')
    for identifier, check in checks.items():
        if check.get('disposition') != 'deferred':
            item = evidence['checks'].get(identifier)
            assert item and item['status'] == 'passed' and item.get('artifact'), identifier
print('SCOPE CAPTURE GATE PASSED:',len(all_sources),'sources/findings,',len(requirements),'requirements,',len(checks),'checks')
print('Manifest SHA256:',hashlib.sha256((root/'.agent-continuity/manifest.json').read_bytes()).hexdigest())
