
const PASSWORDS = {
  VIEW: '1',
  EDIT: '2',
  ADMIN: '3'
};

export function authMiddleware(req: any, res: any, next: any) {
  const password = req.headers['x-password'];

  if (!password) {
    return res.status(401).json({ error: 'Password required' });
  }

  // GET requests - require any valid password
  if (req.method === 'GET') {
    if (password === PASSWORDS.VIEW || 
        password === PASSWORDS.EDIT || 
        password === PASSWORDS.ADMIN) {
      next();
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
    return;
  }

  // POST/PUT/DELETE - require EDIT or ADMIN password
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (password === PASSWORDS.EDIT || password === PASSWORDS.ADMIN) {
      next();
    } else {
      res.status(401).json({ error: 'Insufficient permissions' });
    }
    return;
  }

  res.status(401).json({ error: 'Invalid request' });
}
