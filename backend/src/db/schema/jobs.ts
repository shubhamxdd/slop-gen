import { pgTable, uuid, varchar, timestamp, text, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, processing, completed, failed
  progress: varchar('progress', { length: 100 }).default('Started').notNull(),
  topic: text('topic').notNull(),
  input: jsonb('input').notNull(),
  outputUrl: text('output_url'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
