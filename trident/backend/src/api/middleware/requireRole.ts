import { Request, Response, NextFunction } from 'express';

export const requireRole = (role: string | string[]) => {
  const allowed = Array.isArray(role) ? role : [role];

  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !allowed.includes(userRole)) {
      res.status(403).json({ ok: false, error: 'Insufficient role' });
      return;
    }

    next();
  };
};
