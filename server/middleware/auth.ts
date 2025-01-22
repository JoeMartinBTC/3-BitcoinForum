
import type { Request, Response, NextFunction } from "express";

const PASSWORDS = {
  VIEW: 'bip25',
  EDIT: '130jahr',
  ADMIN: '99ballons'
};

export { PASSWORDS };

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const password = req.headers['x-password'];

  // Require password
  if (!password) {
    return res.status(401).json({ error: 'Password required' });
  }

  // For GET requests (viewing)
  if (req.method === 'GET') {
    if (![PASSWORDS.VIEW, PASSWORDS.EDIT, PASSWORDS.ADMIN].includes(password as string)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    return next();
  }

  // For modification requests (POST, PUT, DELETE)
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (![PASSWORDS.EDIT, PASSWORDS.ADMIN].includes(password as string)) {
      return res.status(401).json({ error: 'Insufficient permissions' });
    }
    return next();
  }

  return res.status(401).json({ error: 'Invalid request method' });
}
