import { defineConfig } from 'drizzle-kit';
import { dbEnv } from './src/config/db-env';

export default defineConfig({
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbEnv.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
