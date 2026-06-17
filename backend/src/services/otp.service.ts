import { redis } from '../db/redis';
import { randomInt } from 'crypto';

export class OtpService {
  private static PREFIX = 'otp:';
  private static EXPIRY = 600; // 10 minutes

  static async generateAndStore(userId: string): Promise<string> {
    const otp = randomInt(100000, 1000000).toString();
    const key = `${this.PREFIX}${userId}`;
    
    await redis.set(key, otp, 'EX', this.EXPIRY);
    return otp;
  }

  static async verify(userId: string, otp: string): Promise<boolean> {
    const key = `${this.PREFIX}${userId}`;
    const storedOtp = await redis.get(key);
    
    if (storedOtp === otp) {
      await redis.del(key);
      return true;
    }
    
    return false;
  }

  static async consumeResendSlot(userId: string): Promise<boolean> {
    const key = `resend_limit:${userId}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, 3600); // 1 hour reset
    }
    
    return count <= 3;
  }
}
