import { pgTable, uuid, varchar, timestamp, text, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const jobStatusEnum = pgEnum('job_status', ['pending', 'processing', 'completed', 'failed']);

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: jobStatusEnum('status').default('pending').notNull(),
  progress: varchar('progress', { length: 100 }).default('Started').notNull(),
  topic: text('topic').notNull(),
  input: jsonb('input').notNull(),
  outputUrl: text('output_url'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
