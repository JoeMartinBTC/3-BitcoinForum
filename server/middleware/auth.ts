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

  //Interpret password as level.
  const level = parseInt(password, 10);

  //Check if password is valid level
  if(isNaN(level) || level < 1 || level > 3){
    return res.status(401).json({ error: 'Invalid password' });
  }

  // For GET requests (viewing)
  if (req.method === 'GET') {
    if (level >= 2) {
      return next();
    } else {
      return res.status(401).json({ error: 'Insufficient permissions' });
    }
  }

  // For modification requests (POST, PUT, DELETE)
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (level === 3) {
      return next();
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
  }

  return res.status(401).json({ error: 'Invalid request method' });
}