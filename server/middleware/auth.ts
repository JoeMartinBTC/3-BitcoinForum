
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

  // Validate password based on request method
  if (req.method === 'GET') {
    if ([PASSWORDS.VIEW, PASSWORDS.EDIT, PASSWORDS.ADMIN].includes(password)) {
      return next();
    }
  } else if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if ([PASSWORDS.EDIT, PASSWORDS.ADMIN].includes(password)) {
      return next();
    }
  }

  return res.status(401).json({ error: 'Invalid password' });
}
