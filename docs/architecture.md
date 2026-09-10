# Architecture

## Architecture objective

The architecture should make the **agent-native interaction loop** easy to understand and verify without introducing infrastructure that the prototype does not need.

The core system is:

```text
Browser
  ↓
Next.js application
  ↓
Agent runtime
  ├─ DeepSeek model
  ├─ local CRM tools
  └─ structured workspace output
  ↓
PostgreSQL system of record
```

The project should remain a single application for the MVP.

## Proposed stack

### Application

- Next.js
- React
- TypeScript

Why: the prototype needs both a modern React interface and a server boundary for the model API key, tool execution, database access, and streaming agent responses. A separate frontend/backend split adds little value at this stage.

### UI

- Tailwind CSS
- shadcn/ui with Base UI primitives
- selected AI Elements components only when an AI-specific primitive is useful

Do not introduce Ant Design as a second component system. The fallback CRM should use the same design system as the agent-native surface.

### Agent runtime

- Vercel AI SDK
- DeepSeek V4 Flash as the initial model
- Zod for tool inputs and structured workspace output

The model name must be configurable through a server-side environment variable rather than scattered through application code.

Example configuration intent:

```text
DEEPSEEK_API_KEY=<server-only secret>
DEEPSEEK_MODEL=<configured model id>
```

Never expose the API key through `NEXT_PUBLIC_*` variables or browser-side calls.

### Data

- PostgreSQL
- Drizzle ORM

Drizzle is a replaceable implementation choice, not a product dependency. Its purpose is to provide a small, type-safe SQL-oriented database layer.

### Testing

- Vitest for logic/schema/tool tests
- Playwright for end-to-end interaction and accessibility-critical paths

## Layer responsibilities

### 1. System of Record

Owns deterministic CRM facts.

Initial entities:

- Customer
- Deal
- Activity
- Task

Avoid adding persistent Situation/Recommendation tables in the MVP. Situations should initially be derived at runtime from CRM data.

### 2. Tool layer

The agent never reads the database directly.

It accesses data and mutations through explicit tools.

Initial examples:

```text
get_crm_summary
list_deals
get_deal
get_account_context
get_recent_activities
create_task OR update_deal_stage
```

Each tool should have:

- a clear semantic description;
- a Zod input schema;
- explicit permission/mutation behavior;
- deterministic output from the source system.

Tools may aggregate related records for useful context. They should not hide LLM reasoning inside the tool implementation.

### 3. Agent layer

The agent is responsible for:

- interpreting user intent;
- choosing appropriate tools;
- performing a bounded tool loop;
- interpreting returned facts;
- selecting a supported workspace type;
- returning structured workspace data;
- proposing, but not silently executing, consequential mutations.

The agent is **not** the source of truth.

### 4. Workspace schema

The LLM should not return arbitrary JSX, HTML, or executable UI code.

It returns constrained structured output.

Conceptually:

```text
Agent
  ↓
WorkspaceSchema
  ↓
Zod validation
  ↓
Workspace renderer
  ↓
Approved React components
```

Initial workspace discriminators:

```text
focus
investigation
comparison
```

Keep this implementation simple. A discriminated union plus direct renderer mapping is sufficient. Do not create a generic template engine before the need exists.

### 5. UI layer

The UI owns visual authority.

The agent may decide:

- which supported workspace to use;
- which approved sections are relevant;
- what source-backed content belongs in those sections;
- which allowed action should be emphasized.

The agent may not decide:

- arbitrary layout systems;
- typography or spacing rules;
- button behavior;
- destructive interaction patterns;
- new executable components.

## Data flow example

```text
User: "Why is ACME at risk?"

1. Agent interprets this as an investigation request.
2. Agent calls get_account_context(ACME).
3. Tool returns source-backed CRM data.
4. Agent interprets the signals.
5. Agent returns an Investigation workspace schema.
6. Zod validates the result.
7. React renders Situation + Timeline + Evidence + Action.
8. User may open the underlying record in Explore.
```

## Mutation boundary

For the MVP:

```text
Agent proposes mutation
  ↓
UI shows action and relevant context
  ↓
User approves
  ↓
Server executes tool
  ↓
Persistent CRM state changes
  ↓
UI confirms the result
```

The LLM must not claim success before the mutation tool actually succeeds.

## Deterministic vs generative boundary

### Deterministic

- record values;
- CRM totals;
- timestamps;
- pipeline value;
- task state;
- database mutations;
- permissions;
- tool execution result.

### Generative / interpretive

- situation summaries;
- prioritization;
- explanations;
- recommendations;
- workspace selection;
- natural-language synthesis.

**Architecture invariant:** facts are deterministic; interpretation is generative.

## MCP

MCP is intentionally deferred.

Phase 1 should prove the agent-native loop using local CRM tools only.

A later phase may add external capabilities such as email or calendar tools through MCP if doing so demonstrates meaningful capability discovery or cross-system execution.

Do not make MCP a prerequisite for the MVP.

## Explicitly deferred infrastructure

Do not introduce the following without a demonstrated requirement:

- separate NestJS service;
- LangChain / LangGraph;
- Redis;
- Kafka / event bus;
- vector database;
- multi-agent runtime;
- persistent agent memory;
- general workflow engine;
- generic generative-UI engine;
- large MCP registry.

The prototype should favor transparent code and explicit boundaries over architecture for hypothetical scale.
