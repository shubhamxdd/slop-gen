import { pgTable, uuid, varchar, timestamp, boolean, integer, text, pgEnum, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userPlanEnum = pgEnum('user_plan', ['free', 'pro', 'agency']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  plan: userPlanEnum('plan').default('free').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  videosGeneratedThisMonth: integer('videos_generated_this_month').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  videosGeneratedCheck: check('videos_generated_check', sql`${table.videosGeneratedThisMonth} >= 0`),
}));
