CREATE TABLE IF NOT EXISTS customers (id text PRIMARY KEY, name text NOT NULL, industry text NOT NULL, contact text NOT NULL, email text NOT NULL);
CREATE TABLE IF NOT EXISTS deals (id text PRIMARY KEY, customer_id text NOT NULL REFERENCES customers(id), name text NOT NULL, value integer NOT NULL CHECK (value >= 0), stage text NOT NULL CHECK (stage IN ('Discovery','Qualified','Proposal','Negotiation')), owner text NOT NULL, close_date text NOT NULL);
CREATE TABLE IF NOT EXISTS activities (id text PRIMARY KEY, deal_id text NOT NULL REFERENCES deals(id), at text NOT NULL, kind text NOT NULL, text text NOT NULL, session_id text);
CREATE TABLE IF NOT EXISTS action_proposals (id text PRIMARY KEY, session_id text NOT NULL, payload jsonb NOT NULL);
CREATE INDEX IF NOT EXISTS proposal_session_idx ON action_proposals(session_id);
CREATE TABLE IF NOT EXISTS tasks (id text PRIMARY KEY, session_id text NOT NULL, proposal_id text NOT NULL UNIQUE REFERENCES action_proposals(id), deal_id text NOT NULL REFERENCES deals(id), title text NOT NULL, note text NOT NULL, due_date text NOT NULL, created_at text NOT NULL, status text NOT NULL CHECK(status = 'open'));
CREATE TABLE IF NOT EXISTS agent_runs (id text PRIMARY KEY, session_id text NOT NULL, created_at text NOT NULL, payload jsonb NOT NULL);
CREATE INDEX IF NOT EXISTS run_session_idx ON agent_runs(session_id);
