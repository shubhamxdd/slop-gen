import { defineConfig } from 'drizzle-kit';
import { drizzleEnv } from './src/config/drizzle-env';

export default defineConfig({
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: drizzleEnv.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
