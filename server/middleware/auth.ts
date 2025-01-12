
const PASSWORDS = {
  VIEW: '1',
  EDIT: '2',
  ADMIN: '3'
};

export function authMiddleware(req: any, res: any, next: any) {
  const password = req.headers['x-password'];

  // Require password for all requests
  if (!password) {
    return res.status(401).json({ error: 'Password required' });
  }

  // For GET requests (viewing)
  if (req.method === 'GET') {
    // Strict equality check for view level access
    if (password === PASSWORDS.VIEW || password === PASSWORDS.EDIT || password === PASSWORDS.ADMIN) {
      next();
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
    return;
  }

  // For modification requests
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (password === PASSWORDS.EDIT || password === PASSWORDS.ADMIN) {
      next();
    } else {
      res.status(401).json({ error: 'Insufficient permissions' });
    }
    return;
  }

  res.status(401).json({ error: 'Unauthorized request' });
}
