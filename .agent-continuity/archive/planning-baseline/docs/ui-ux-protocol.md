# Agent-native UI/UX Protocol

## Purpose

This document defines the non-negotiable UX rules for the prototype.

The goal is to prevent future implementation work — human or agent-generated — from drifting into inconsistent UI patterns, arbitrary generative interfaces, or a conventional CRM with an AI chat panel attached.

## Product-level invariants

### Stable shell, dynamic workspace

The global navigation and primary layout remain predictable.

The agent may change the **workspace content**, not the entire application structure.

### Situation-first

Default surfaces should prioritize what is happening and what needs attention before raw record navigation.

### Intent-first

Users should be able to express goals in natural language instead of manually navigating a feature tree.

### AI filters complexity, not visibility

The agent may reduce what the user needs to inspect, but must not hide the existence or scale of the underlying CRM.

Where relevant, expose scope such as:

- `3 of 42 active deals need attention`
- `Based on activity from the last 30 days`
- `Updated 2 min ago`

### AI-first, not AI-only

Users must retain a route to Explore and underlying source records.

### Progressive control

Prefer this depth model:

```text
Situation
  → Evidence
  → Full record
  → Manual operation
```

Users should not be forced into raw CRM data for ordinary work, but the path must remain available.

### Evidence before consequential action

Important recommendations must expose their relevant source-backed evidence before or alongside approval.

### Minimize interaction, not control

Remove navigation and repetitive clicks where the agent can reliably handle them.

Do not remove:

- override;
- approval where required;
- source visibility;
- manual fallback;
- action status;
- auditability.

## Stable application shell

The MVP should remain small.

Primary surfaces:

```text
Today
Workspace
Explore
```

An Ask/command surface may be globally available without becoming the entire UI.

Avoid large enterprise sidebars containing every CRM object as a permanent first-class navigation item.

## Workspace vocabulary

The LLM does not invent arbitrary interface patterns.

Initial approved workspace types:

- Focus
- Investigation
- Comparison

Initial approved UI primitives:

- `SituationCard`
- `EvidenceList`
- `Timeline`
- `DataTable`
- `ActionCard`

The design system owns the rendering and interaction behavior of these primitives.

The agent provides composition and content within the supported schema.

## Generative UI boundary

### Agent may decide

- which supported workspace is appropriate;
- which approved sections are useful;
- ordering when the schema explicitly allows it;
- source-backed summaries;
- which allowed action should be primary.

### Agent may not decide

- arbitrary React/JSX/HTML;
- typography;
- colors;
- spacing system;
- button hierarchy rules;
- arbitrary dialogs/modals;
- new interaction patterns;
- destructive behavior;
- hidden navigation.

The intended model is **constrained compositional UI**, not unconstrained UI generation.

## Interaction rules

### Primary actions

Prefer one obvious primary action per decision surface.

Secondary actions should be visually subordinate or progressively disclosed.

### Consequential mutations

For the MVP, mutations that materially change CRM state must be presented before execution.

Flow:

```text
Proposed action
  → supporting context/evidence
  → user approval
  → execution
  → confirmed result
```

### Loading state

Do not leave the user staring at an unexplained spinner when meaningful state is available.

Prefer status such as:

```text
Checking active deals…
Reviewing recent activities…
Preparing workspace…
```

Do not expose internal chain-of-thought or private reasoning.

### Failure state

If a tool fails:

- state that the requested data/action could not be completed;
- do not fabricate missing results;
- preserve the rest of the usable workspace where possible;
- offer the appropriate retry/manual path.

### Empty state

No data is a valid result.

Do not generate substitute facts to make the UI look populated.

### Uncertainty

Interpretive claims should not be presented with false certainty.

Prefer language such as:

- `may be slowing`
- `likely blocker`
- `3 signals suggest…`

Confidence values should only be shown if they have a defined meaning. Do not invent pseudo-precision solely for visual effect.

## Global awareness

The agent-native interface must not make users feel that the CRM contains only the records selected by the model.

Today should retain a compact deterministic overview, for example:

```text
42 active deals · RM1.8M pipeline · 126 customers
3 deals at risk · updated 2 min ago
```

Agent-derived situations should make their scope understandable where practical.

## Explore fallback

Explore is the conventional inspection/control layer.

It should be visually consistent with the rest of the product and provide direct access to source data.

The MVP does not need full CRUD parity. It needs enough visibility to answer:

- What data exists?
- How much data exists?
- What is the underlying record state?
- Did the approved agent action actually update the CRM?

## Visual rules

Use a modern, quiet B2B product aesthetic rather than a dense admin dashboard.

Default rules:

- generous but not wasteful whitespace;
- clear typography hierarchy;
- limited card nesting;
- subtle separators before unnecessary borders;
- one component system across agent-native and Explore surfaces;
- Lucide icons (or one consistent icon family) rather than mixed icon sets;
- status colors must have semantic meaning;
- red is reserved for real risk/destructive meaning;
- avoid decorative AI gradients, excessive glassmorphism, or constant animated effects;
- AI-specific styling should not dominate the product identity.

## Accessibility baseline

Target WCAG 2.2 AA principles for the MVP.

Every major surface must account for:

- keyboard access;
- visible focus state;
- semantic HTML;
- labels for interactive controls;
- sufficient contrast;
- meaning that does not rely on color alone;
- reasonable target sizes;
- readable loading/error/empty states.

## Required states for reusable components

A reusable workspace component is not complete after only its happy path renders.

Relevant states should include, as applicable:

- default;
- loading;
- empty;
- long content;
- tool failure;
- permission/action unavailable;
- completed/success state;
- narrow/mobile viewport.

Do not build a large Storybook catalog in Phase 1 unless needed. These states can initially be covered directly by component tests and targeted test fixtures.

## UI/UX review gate

Before considering an Agent-native UI change complete, review:

- Does the shell remain stable?
- Is this situation/task-oriented instead of merely record-oriented?
- Are factual values source-backed?
- Does the user understand the relevant scope?
- Can the user inspect evidence?
- Is there a route to the full underlying record/data?
- Is the primary action obvious?
- Is consequential mutation controlled?
- Does failure remain understandable and recoverable?
- Does the workspace use approved primitives rather than inventing a new pattern?
- Are loading, empty, error, and accessibility states considered?

If a UI requires explanation solely because the agent generated an unfamiliar layout, simplify it.
