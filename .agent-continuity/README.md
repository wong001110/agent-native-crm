# Agent Continuity execution state

The current user authorization is captured in `plans/execution.json` revision 2.
It inherits all stable requirement/check IDs from `plans/mvp.json` and source items
from `sources.json`, then records the new authorization, decisions and explicit
credentials-dependent deferrals. The older planning-only flags are historical.

`state.json` is the canonical execution snapshot; `events.jsonl` is append-only.
`PROJECT_STATE.md` is a readable projection. `scripts/continuity.mjs` validates the
source/check mappings and emits the current bootstrap/check inventory. A pending
check is not passed by its absence from a sparse state map. Completion evidence must
identify an exact check and artifact/commit. Live-model evidence cannot be replaced
by a fixture run. Review findings are persisted in `reviews/` and mapped before closure.

This remains a lightweight single-writer Git-backed continuity profile, not a new
service or database product. Read remote HEAD before publishing; reconcile changes,
do not force overwrite. Evidence affected by code changes becomes stale until rerun.
Never store secrets or unrelated private conversation data. The current mandate is
phased MVP implementation with PRs and squash merges, not public deployment.
