import { pgTable, uuid, varchar, timestamp, boolean, integer, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  plan: varchar('plan', { length: 20 }).default('free').notNull(), // free, pro, agency
  isVerified: boolean('is_verified').default(false).notNull(),
  videosGeneratedThisMonth: integer('videos_generated_this_month').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
