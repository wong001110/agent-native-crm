# Agent-native CRM Prototype

An intent-driven CRM experiment: **ask a business question, retrieve source records, assemble the right workspace, and approve a concrete next step**.

This is a small technical demonstration, not a CRM replacement. The implementation has three primary surfaces—Today, Workspace and Explore—and only three workspace forms: Focus, Investigation and Comparison.

> **Verification status:** implementation is under acceptance testing on `feat/mvp-agent-workspace`. Consult [PROJECT_STATE.md](PROJECT_STATE.md) and the PR/CI evidence before treating it as verified.
>
> Default mode is a **clearly labelled scripted demonstration**, not a real LLM. The same AI SDK tool loop, CRM tools, schema validation, persistence, and approval boundary are exercised. A configurable DeepSeek adapter is implemented separately. Real provider compatibility and reasoning quality remain unverified until credentials are supplied and live tests are run.

## Run the credential-free demo

Requires Node.js 22.16 or later.

```bash
git clone https://github.com/wong001110/agent-native-crm.git
cd agent-native-crm
git checkout feat/mvp-agent-workspace
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:3000`. Keep `APP_ORIGIN` equal to the exact browser origin; `localhost` and `127.0.0.1` are different origins.

The default file-backed demo seeds 12 fictional accounts, 12 deals worth **RM535,000**, and 24 recorded activities. No real emails, customer accounts, or external calendar are accessed. Tasks, proposals, and generated workspaces are persisted locally under `.data/`; that directory is ignored by Git.

The file adapter is **single-process and local-only**. It is not a substitute for a persistent database on serverless infrastructure. It refuses to run as storage on Vercel. A new browser session sees the same fictional source records but its own tasks, proposals, and runs. Clearing the session cookie loses the browser's access to those session-owned records; this is not a full authentication/account system.

## Reference demo

1. Today → **Review today's priorities**: the tool loop retrieves CRM data and returns a Focus workspace.
2. **Investigate ACME**: inspect the deal, source evidence and activity timeline.
3. **Prepare follow-up task**: review the exact task, account, due date and context. No task is created yet.
4. **Approve & create task**: the server executes the saved, session-bound proposal exactly once.
5. **View in Explore**: the persisted task and recorded activity are visible after refresh.

Other supported scripted prompts include `Why ACME?`, `Compare ACME and Nova`, and `Create a follow-up task for ACME.` The scripted adapter has a deliberately finite vocabulary. Arbitrary natural-language understanding is a **live-mode evaluation**, not something the mock proves.

Explore provides customers, deals, a simple pipeline, source activities, session-owned tasks, record details, and a manual task-preparation path. It continues to work without a successful model call.

## Connect PostgreSQL

A local PostgreSQL instance requires no cloud credentials:

```bash
docker compose up -d
```

Update the server-only `.env.local`:

```dotenv
DB_MODE=postgres
DATABASE_URL=postgres://crm_demo:local_demo_only@127.0.0.1:5432/agent_crm
```

Then:

```bash
npm run db:setup
npm run dev
```

`db:setup` applies the initial idempotent schema and seeds only an empty CRM. It does not overwrite existing customers. For this small MVP the initial SQL is versioned in Git; a multi-version migration runner is not implemented. PostgreSQL approval uses a transaction and row lock; unique proposal references enforce exactly one task per approved proposal.

## Connect a real DeepSeek model

Set these values **on the server only**:

```dotenv
AGENT_MODE=live
DEEPSEEK_API_KEY=your_private_key
DEEPSEEK_MODEL=the_exact_model_id_supported_by_your_provider
DEEPSEEK_BASE_URL=https://api.deepseek.com
APP_PASSWORD=choose_a_strong_private_demo_password
APP_ORIGIN=http://127.0.0.1:3000
```

Restart the server. When password protection is enabled, browser HTTP Basic credentials are username `demo` and the configured `APP_PASSWORD`. Production live or PostgreSQL mode fails closed without that password. Use HTTPS for any remote deployment.

The model ID is intentionally not pinned to an unverified marketing name or provider alias. The selected provider/model must support tool calling and structured output through the installed AI SDK adapter. Missing credentials or a live provider failure **never silently switches to mock mode**.

```bash
npm run test:live
```

This is an explicit paid-call smoke test of Focus, Investigation and Comparison. It stores evidence under `.data/live-smoke-*.json` with the Git commit, model, run IDs, outcomes and token counts. It does not automatically approve tasks. Passing it does not certify the correctness of all generated interpretations.

## Architecture

```text
Browser: stable shell + Today / Workspace / Explore
    ↓ same-origin server API
Next.js Node runtime
    ├─ session and demo-access boundaries
    ├─ AI SDK ToolLoopAgent
    │   ├─ scripted mock OR real DeepSeek provider
    │   └─ approved CRM read tools + prepare_task
    ├─ Zod workspace validation
    ├─ source hydration from actually retrieved records
    └─ human approval endpoint → stored proposal → task
           ↓
    Store interface
    ├─ local file-backed demo
    └─ PostgreSQL + Drizzle
```

**Facts are deterministic; interpretation is generative.** Deal values, stages, owners, dates and evidence text come from retrieved records. The model produces only the constrained workspace selection, short interpretations, observed IDs and an optional prepared proposal reference. Unobserved IDs, mismatched evidence and unsupported workspace types fail validation.

The UI uses a small set of application components and official shadcn/Base UI primitives. AI-generated prose uses the installed AI Elements `MessageResponse` with a restricted, non-interactive markdown vocabulary. There is no generated JSX, `eval`, arbitrary component registry, or general template engine.

Run IDs are allocated and saved before generation. Tool progress is streamed as NDJSON events—not hidden reasoning. Finished workspaces are addressable at `/workspace?run=<id>` within their owning browser session.

## Test and inspect

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run continuity:check
```

`npm run test:e2e` starts the production build; run `npm run build` first. PostgreSQL integration tests require `TEST_DATABASE_URL`; CI supplies a PostgreSQL 17 service and runs the migration/seed before testing. A skipped local PostgreSQL test is not evidence that PostgreSQL passed.

GitHub CI covers typecheck, store/agent/security tests, PostgreSQL transactions, production build, Playwright browser flows, responsive layouts and axe accessibility checks. Browser reports and screenshots are uploaded as workflow artifacts. Read the exact CI run rather than assuming every listed check has passed.

## Boundaries and limitations

- Only one mutation: create an approved internal follow-up task. No outbound email, stage editing, customer deletion or autonomous consequential actions.
- Proposal approval is session-bound, expires after 30 minutes while pending, and is idempotent. Rejection cannot be bypassed by reusing its ID.
- Maximum prompt length 1,200 characters; maximum JSON request size 8 KiB; agent timeout 45 seconds; tool loop stops after six steps; one provider retry. Local admission limits are per process, not distributed rate limiting.
- The sample dataset is anchored on 11 September 2026. It is not a live business feed. Saved workspaces are snapshots, not continuously refreshed predictions.
- This is not enterprise authentication, multi-tenant authorization, a security certification, or a full WCAG conformance claim. Do not import sensitive customer data into an exposed prototype.
- No MCP, memory, multi-agent system, persistent Situation lifecycle, workflow builder, vector database or external-worker system in the MVP.

## Development continuity

[AGENTS.md](AGENTS.md) defines the project constraints. Agent Continuity 0.3.4 is represented by Git-tracked source/requirement manifests, structured state, evidence, review findings, and an append-only event ledger under [`.agent-continuity/`](.agent-continuity/). This is a lightweight single-writer development mechanism, not part of the CRM product runtime.

[Product scope](docs/product-scope.md) · [Architecture](docs/architecture.md) · [UI/UX protocol](docs/ui-ux-protocol.md) · [Roadmap](docs/roadmap.md)
