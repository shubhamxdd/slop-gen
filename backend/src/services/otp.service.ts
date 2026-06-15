import { redis } from '../db/redis';

export class OtpService {
  private static PREFIX = 'otp:';
  private static EXPIRY = 600; // 10 minutes

  static async generateAndStore(userId: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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

  static async canResend(userId: string): Promise<boolean> {
    const key = `resend_limit:${userId}`;
    const count = await redis.get(key);
    
    if (count && parseInt(count) >= 3) {
      return false;
    }
    
    return true;
  }

  static async trackResend(userId: string) {
    const key = `resend_limit:${userId}`;
    await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour reset
  }
}
