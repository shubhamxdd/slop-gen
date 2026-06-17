import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', err.message);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.issues.map((e) => ({ path: e.path, message: e.message })),
    });
  }

  const status = err.status || 500;

  // Log the actual error for debugging
  if (status >= 500) {
    console.error('Internal Server Error:', err);
  }

  // For 5xx errors, use generic message; for others, use the actual message
  const message = status >= 500 ? 'Internal Server Error' : (err.message || 'Internal Server Error');

  res.status(status).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
