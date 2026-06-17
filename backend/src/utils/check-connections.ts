import postgres from 'postgres';
import Redis from 'ioredis';
import { env } from '../config/env';

async function checkConnections() {
  console.log('🔍 Checking database and cache connections...');

  // 1. Check PostgreSQL
  const sql = postgres(env.DATABASE_URL, { max: 1 });
  try {
    const result = await sql`SELECT 1 as connected`;
    if (result && result[0].connected === 1) {
      console.log('✅ PostgreSQL: Connected successfully');
    }
  } catch (error: any) {
    console.error('❌ PostgreSQL: Connection failed');
    console.error(`   Error: ${error.message}`);
  } finally {
    await sql.end();
  }

  // 2. Check Redis
  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
  });
  try {
    const pong = await redis.ping();
    if (pong === 'PONG') {
      console.log('✅ Redis: Connected successfully');
    }
  } catch (error: any) {
    console.error('❌ Redis: Connection failed');
    console.error(`   Error: ${error.message}`);
  } finally {
    await redis.quit();
  }
}

checkConnections().catch(console.error);
