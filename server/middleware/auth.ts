
const PASSWORDS = {
  VIEW: '1',
  EDIT: '2',
  ADMIN: '3'
};

export function authMiddleware(req: any, res: any, next: any) {
  const password = req.headers['x-password'];

  // Return 401 if no password provided
  if (!password) {
    return res.status(401).json({ error: 'Password required' });
  }

  // For GET requests (viewing)
  if (req.method === 'GET') {
    if (password === PASSWORDS.VIEW || password === PASSWORDS.EDIT || password === PASSWORDS.ADMIN) {
      return next();
    }
    return res.status(401).json({ error: 'Invalid password' });
  }

  // For modification requests
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (password === PASSWORDS.EDIT || password === PASSWORDS.ADMIN) {
      return next();
    }
    return res.status(401).json({ error: 'Insufficient permissions' });
  }

  return res.status(401).json({ error: 'Unauthorized' });
}
