# Project State

**MVP implemented; final review remediation and main-branch reconciliation in progress.**

Current authorization: Execute mode through MVP, phase-by-phase changes, batched logical
commits and squash merging. The previous no-merge hold is superseded. Public deployment
and paid provisioning are not authorized.

## Delivered implementation

Today / Workspace / Explore; Focus / Investigation / Comparison; five source tools;
AI SDK loop with explicit scripted demo mode and a real DeepSeek adapter; observed-record
fact hydration; session-bound saved workspaces; proposed and approved internal tasks;
manual task fallback; local demo persistence and PostgreSQL/Drizzle; responsive UI/tests.

The existing P1-P4 development checkpoints are preserved in events.jsonl. Final head
before this review was afef1af6a01c2de213d142a3f7e387feb33d27e1; CI 34517560032 passed.
No real DeepSeek call has been verified. C-05-4 remains explicitly deferred to the user.

## Current review findings

FND-INT-001: preserve/map the merged planning baseline and reconcile authorization.
FND-INT-002: reject action proposals targeting a deal absent from the displayed workspace.
FND-INT-003: reject repeated evidence references.

These changes require current CI; old green tests do not certify the remediation.
The active manifest is `.agent-continuity/manifest.json`; `integration.json` preserves
all 39 baseline checks and their relationship to active checks. A live portion remains
deferred wherever it maps to C-05-4.

PR #4 was a redundant foundation attempt and is closed unmerged, with its branch retained.
Continue PR #3 rather than maintaining parallel implementations. See state.json for the
current gate and next action. This document is not independent completion evidence.
