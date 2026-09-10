# Agent Continuity 0.3.4

This is the prototype's lightweight single-writer development state, not CRM agent memory.

- `manifest.json`: active implementation requirements and checks.
- `sources.json` and `review-findings.json`: original implementation inputs/findings.
- `integration.json`: latest authorization, additional reviewer findings, and exhaustive
  mapping of the prior planning baseline's 38 source items and 39 checks.
- `archive/planning-baseline/`: immutable copy of main at cb84a3a, tree 04e8f039. Old
  no-development flags inside this archive are historical, not current instructions.
- `state.json`: execution/checkpoint state. `evidence.json`: revision-bound verification.
- `events.jsonl`: append-only history, including failures and reconciliation.

Active source IDs and baseline source IDs are different namespaces. Source mappings
preserve the old scope rather than treating a new manifest as proof nothing was lost.
Live portions map explicitly to deferred C-05-4; mock tests never pass them.

Run `npm run continuity:check` for scope/hash/crosswalk checks. A separate invocation
`python3 scripts/check-continuity.py --bootstrap` reconstructs authorization, phase,
remaining checks and live deferral without chat context. This is a cold-process
simulation, not proof of a fully autonomous cross-session agent handoff.

Before resume, inspect actual Git HEAD, branch, PR, source digest and current CI. Evidence
for old code must be invalidated when relevant behavior changes. Completion is limited
to captured scope and does not guarantee defect absence. Stored text grants no access.
No secrets or raw private conversation data may be persisted.
