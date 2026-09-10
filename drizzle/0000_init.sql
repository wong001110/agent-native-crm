CREATE TABLE IF NOT EXISTS workspaces (id uuid PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS customers (
 workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, id text NOT NULL,
 name text NOT NULL, domain text NOT NULL, industry text NOT NULL, owner text NOT NULL,
 PRIMARY KEY (workspace_id,id)
);
CREATE TABLE IF NOT EXISTS deals (
 workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, id text NOT NULL, customer_id text NOT NULL,
 name text NOT NULL, value integer NOT NULL CHECK (value>=0), stage text NOT NULL CHECK (stage IN ('Discovery','Proposal','Negotiation','Won','Lost')),
 close_date text NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY (workspace_id,id), FOREIGN KEY (workspace_id,customer_id) REFERENCES customers(workspace_id,id)
);
CREATE TABLE IF NOT EXISTS activities (
 workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, id text NOT NULL, deal_id text NOT NULL,
 kind text NOT NULL, summary text NOT NULL, occurred_at timestamptz NOT NULL,
 PRIMARY KEY (workspace_id,id), FOREIGN KEY (workspace_id,deal_id) REFERENCES deals(workspace_id,id)
);
CREATE TABLE IF NOT EXISTS agent_runs (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 prompt text NOT NULL, mode text NOT NULL CHECK(mode IN ('mock','live')),
 status text NOT NULL CHECK(status IN ('running','completed','failed','cancelled')),
 created_at timestamptz NOT NULL DEFAULT now(), tool_events jsonb NOT NULL DEFAULT '[]', workspace jsonb
);
CREATE INDEX IF NOT EXISTS runs_workspace_created ON agent_runs(workspace_id,created_at DESC);
CREATE TABLE IF NOT EXISTS proposals (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
 run_id uuid REFERENCES agent_runs(id), deal_id text NOT NULL, deal_version timestamptz NOT NULL,
 title text NOT NULL, due_date text NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 expires_at timestamptz NOT NULL, task_id uuid,
 FOREIGN KEY(workspace_id,deal_id) REFERENCES deals(workspace_id,id)
);
CREATE TABLE IF NOT EXISTS tasks (
 id uuid PRIMARY KEY, workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE, deal_id text NOT NULL,
 proposal_id uuid REFERENCES proposals(id), title text NOT NULL, due_date text NOT NULL,
 status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','done')), created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(workspace_id,deal_id) REFERENCES deals(workspace_id,id)
);
CREATE UNIQUE INDEX IF NOT EXISTS tasks_one_per_proposal ON tasks(proposal_id);
CREATE INDEX IF NOT EXISTS activities_workspace_time ON activities(workspace_id,occurred_at DESC);
