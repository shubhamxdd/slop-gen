import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface JwtPayload {
  userId: string;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      throw new Error('Invalid token payload');
    }
    return decoded as JwtPayload;
  } catch (error: any) {
    if (error.message === 'Invalid token payload') throw error;
    throw new Error('Invalid or expired token');
  }
};
