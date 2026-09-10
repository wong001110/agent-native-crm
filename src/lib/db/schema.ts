import { pgTable, text, integer } from 'drizzle-orm/pg-core';
export const customers = pgTable('crm_customers', {
  id: text('id').primaryKey(), name: text('name').notNull(), industry: text('industry').notNull(),
  owner: text('owner').notNull(), email: text('email').notNull(),
});
export const deals = pgTable('crm_deals', {
  id: text('id').primaryKey(), customerId: text('customer_id').notNull().references(() => customers.id),
  name: text('name').notNull(), value: integer('value').notNull(), stage: text('stage').notNull(),
  closeDate: text('close_date').notNull(), updatedAt: text('updated_at').notNull(),
});
export const activities = pgTable('crm_activities', {
  id: text('id').primaryKey(), dealId: text('deal_id').notNull().references(() => deals.id),
  kind: text('kind').notNull(), summary: text('summary').notNull(), occurredAt: text('occurred_at').notNull(),
});
export const tasks = pgTable('crm_tasks', {
  id: text('id').primaryKey(), dealId: text('deal_id').notNull().references(() => deals.id),
  title: text('title').notNull(), dueDate: text('due_date').notNull(), status: text('status').notNull().default('open'),
  createdAt: text('created_at').notNull(), actionId: text('action_id').unique(),
});
export const metadata = pgTable('crm_metadata', { id: text('id').primaryKey(), value: text('value').notNull() });
export type Customer = typeof customers.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Snapshot = { customers: Customer[]; deals: Deal[]; activities: Activity[]; tasks: Task[]; asOf: string; retrievedAt: string };
