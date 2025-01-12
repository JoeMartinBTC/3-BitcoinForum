
const PASSWORDS = {
  VIEW: '1',
  EDIT: '2',
  ADMIN: '3'
};

export { PASSWORDS };

export function authMiddleware(req: any, res: any, next: any) {
  const password = req.headers['x-password'];

  // Require password
  if (!password) {
    return res.status(401).json({ error: 'Password required' });
  }

  // For GET requests (viewing)
  if (req.method === 'GET') {
    if (![PASSWORDS.VIEW, PASSWORDS.EDIT, PASSWORDS.ADMIN].includes(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    return next();
  }

  // For modification requests (POST, PUT, DELETE)
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (![PASSWORDS.EDIT, PASSWORDS.ADMIN].includes(password)) {
      return res.status(401).json({ error: 'Insufficient permissions' });
    }
    return next();
  }

  return res.status(401).json({ error: 'Invalid request method' });
}
