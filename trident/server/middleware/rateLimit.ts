import { Request, Response, NextFunction } from 'express';

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  // Simple rate limiting middleware
  next();
};
