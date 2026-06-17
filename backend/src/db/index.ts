import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env';
import * as usersSchema from './schema/users';
import * as jobsSchema from './schema/jobs';

const queryClient = postgres(env.DATABASE_URL);
export const db = drizzle(queryClient, { 
  schema: { ...usersSchema, ...jobsSchema } 
});
