# Credentialed live-model acceptance — deferred

Owner: user-provided DeepSeek credentials / private test environment. Check: `LIVE-R1-C1`.

This check is not passed by scripted fixture tests or the mocked HTTP protocol test. Keep credentials out of Git, browser bundles, continuity state, screenshots and logs.

## Setup

Use a fresh synthetic PostgreSQL workspace. Configure `AGENT_MODE=live`, the real `DEEPSEEK_API_KEY`, an account-supported `DEEPSEEK_MODEL`, a random `SESSION_SECRET` and a separate `DEMO_ACCESS_TOKEN`. Pin `APP_ORIGIN` when using a proxy. Restart, sign in with the demo token and verify the visible Live model label.

## Acceptance matrix

Run each family with at least three paraphrases. Record the input, configured provider/model, run ID, actual tools, selected view, source IDs, outcome and latency. Do not record secrets or private chain-of-thought.

| Family | Example and observable acceptance |
|---|---|
| Priorities | Ask which active deals deserve attention. The model retrieves context and constructs a useful Focus view, rather than always selecting a hardcoded pair. |
| Investigation | Ask what happened with ACME, then another account. The timeline/evidence uses that account's retrieved records, and likely blockers are labeled as interpretations. |
| Comparison | Compare ACME and Nova, then substitute other accounts. Two to four requested targets have correct factual values and evidence. |
| Follow-up context | After investigating, ask to prepare a follow-up task without repeating the account. Confirm the intended account, title and date before approval. |
| Approval | Verify no task before approval, reject one proposal, then approve a new one. Exactly one task persists after reload/retry. No email is sent. |
| Data variation | Modify synthetic records in the test database, start a fresh analysis and verify the facts and relevant interpretation change. Historical views remain labeled snapshots. |
| Ambiguity/unsupported action | Ask about an unknown account or request an email send. The model must not invent records, claim unauthorized success or target a different account without clarification. |
| Empty and failure | Use an empty value filter, unavailable model or missing key. Errors remain visible, live never downgrades to mock, and Explore remains usable with otherwise valid access settings. |

Bind results to the exact implementation commit and test-data state. Separate provider availability, protocol correctness, schema validity, semantic quality and latency. Valid JSON alone is not proof of useful reasoning. A failed family reopens the affected requirement. Keep `LIVE-R1-C1` deferred until these trials actually run.
