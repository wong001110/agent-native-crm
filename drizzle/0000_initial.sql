CREATE TABLE IF NOT EXISTS crm_customers (id text PRIMARY KEY, name text NOT NULL, industry text NOT NULL, owner text NOT NULL, email text NOT NULL);
CREATE TABLE IF NOT EXISTS crm_deals (id text PRIMARY KEY, customer_id text NOT NULL REFERENCES crm_customers(id), name text NOT NULL, value integer NOT NULL CHECK(value >= 0), stage text NOT NULL CHECK(stage IN ('Discovery','Proposal','Negotiation','Won','Lost')), close_date text NOT NULL, updated_at text NOT NULL);
CREATE TABLE IF NOT EXISTS crm_activities (id text PRIMARY KEY, deal_id text NOT NULL REFERENCES crm_deals(id), kind text NOT NULL, summary text NOT NULL, occurred_at text NOT NULL);
CREATE INDEX IF NOT EXISTS crm_activity_deal_idx ON crm_activities(deal_id, occurred_at);
CREATE TABLE IF NOT EXISTS crm_tasks (id text PRIMARY KEY, deal_id text NOT NULL REFERENCES crm_deals(id), title text NOT NULL, due_date text NOT NULL, status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','done')), created_at text NOT NULL, action_id text UNIQUE);
CREATE TABLE IF NOT EXISTS crm_metadata (id text PRIMARY KEY, value text NOT NULL);
