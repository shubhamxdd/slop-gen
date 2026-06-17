import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dbEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

const _env = dbEnvSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid database environment variables:', _env.error.format());
  process.exit(1);
}

export const dbEnv = _env.data;
