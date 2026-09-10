# Project execution rules

Use Agent Continuity 0.3.4. Read `.agent-continuity/sources.json`, `.agent-continuity/plans/mvp.json`, `.agent-continuity/state.json`, and the latest evidence before resuming. Reconcile repository identity, HEAD, manifest hash, incomplete checks and findings. Persist failures as well as successes. Never promote implementation to verified without check-specific evidence.

The user authorized implementation through the small MVP on 2026-09-11 (Asia/Kuala_Lumpur), superseding the Phase 0 no-development instruction. Credentials-dependent integrations may be mocked temporarily. Mock tests do NOT prove real model behavior. Keep live verification explicitly deferred to user-provided credentials.

Build only Today, Workspace, Explore; Focus, Investigation, Comparison; five read tools; one approved CRM mutation: create a follow-up task. No MCP, multi-agent, memory, generic template engine, autonomous email, or extra CRM modules.

Facts come from PostgreSQL/Drizzle and approved tools. The model returns references and interpretations, never executable UI. Hydrate factual UI fields on the server. Secrets stay server-only. Mutations require an explicit server-checked user decision and must be idempotent and workspace-scoped. Model output cannot approve an action.

Keep a stable, quiet, accessible shell. Expose scope, evidence, source records, mode, failures, and manual fallback. No invented confidence percentages or chain-of-thought display.

Use logical multi-file commits on the implementation branch and a PR; do not merge without verification and review. Continue across phases while agent-executable work remains. An absent credential is a deferred external check, not a reason to stop implementing the rest.

The development state is separate from the product agent's CRM data. For this single-writer prototype, Git-versioned JSON state and an append-only event ledger are the durable store. Do not introduce a continuity database/framework into the product runtime.
