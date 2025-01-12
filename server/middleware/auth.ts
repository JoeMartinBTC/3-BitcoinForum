
const PASSWORDS = {
  VIEW: 'bip25',
  EDIT: '2',
  ADMIN: '3'
};

export function authMiddleware(req: any, res: any, next: any) {
  const password = req.headers['x-password'];

  // For GET requests
  if (req.method === 'GET') {
    if (password === PASSWORDS.VIEW || password === PASSWORDS.EDIT || password === PASSWORDS.ADMIN) {
      return next();
    }
    return res.status(401).json({ error: 'Invalid password' });
  }

  // POST/PUT/DELETE requires EDIT or ADMIN password
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (password === PASSWORDS.EDIT || password === PASSWORDS.ADMIN) {
      return next();
    }
    return res.status(401).json({ error: 'Insufficient permissions' });
  }

  return res.status(401).json({ error: 'Unauthorized' });
}
