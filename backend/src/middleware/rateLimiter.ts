import { Request, Response, NextFunction } from 'express';

// Simple rate limiting middleware
const requests = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max requests per window

  const clientData = requests.get(ip);
  
  if (!clientData || now > clientData.resetTime) {
    // New window or client
    requests.set(ip, { count: 1, resetTime: now + windowMs });
    next();
  } else if (clientData.count < maxRequests) {
    // Within limits
    clientData.count++;
    next();
  } else {
    // Rate limited
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
};
