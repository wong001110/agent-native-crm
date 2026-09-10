# Project execution rules

Read `.agent-continuity/manifest.json`, `.agent-continuity/state.json`, and the product/architecture/UI documents before changing this project. Agent Continuity 0.3.4 governs this implementation.

The user authorized MVP implementation on 2026-09-11, superseding the earlier planning-only instruction. Credentials-dependent integration may use explicitly labelled mocks; real-provider validation remains an explicit user-owned handoff, not a passing test.

## Boundaries
- Today, Workspace, Explore; Focus, Investigation, Comparison only.
- One consequential mutation: create a follow-up task after human approval. Do not add email sending, stage editing, MCP, agent memory, or a template engine.
- Facts are deterministic; interpretation is generative. Validate model output and hydrate fact fields from retrieved CRM records.
- Real mode uses a real model-driven tool loop, not keyword routing. Mock mode is a visibly labelled scripted adapter, never a silent fallback from live failure.
- Keep API keys server-only. Never place secrets or unrestricted transcripts in continuity state, Git, logs, or client payloads.
- Single application: Next.js, React, TypeScript, Tailwind, shadcn/Base UI, selected AI Elements, AI SDK, Zod, PostgreSQL/Drizzle.
- Local credential-free demo storage may implement the same store interface, but must disclose its single-process limitation and must not pretend to be managed PostgreSQL.

## Continuity and completion
Sources -> requirements -> checks -> evidence must remain traceable. Git-tracked JSON is the lightweight, single-writer durable state store for this prototype; do not introduce a continuity service into the CRM runtime. PROJECT_STATE.md is a derived human view.

Checkpoint coherent changes, not each file. Evidence must identify the source tree or commit it checks. Changed implementation invalidates affected evidence. Never silently defer a required item. Persist reviewer findings and gate failures. Before final handoff run a fresh review covering failure paths, permission boundaries, data integrity, resource limits, and documentation drift.

Use a feature branch and PR. Do not merge without explicit user approval. Missing credentials do not stop independent executable work. Build, test and browser evidence must say whether the model was mocked. A working demo does not prove real model quality.
