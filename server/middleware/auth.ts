
const PASSWORDS = {
  VIEW: 'bip25',
  EDIT: '130jahre',
  ADMIN: '99ballons'
};

// Helper function to make password checks case-insensitive
const matchPassword = (input: string, target: string) => input.toLowerCase() === target.toLowerCase();

export function authMiddleware(req: any, res: any, next: any) {
  const password = req.headers['x-password'];
  
  // Always allow GET requests (view only)
  if (req.method === 'GET') {
    if (!password || matchPassword(password, PASSWORDS.VIEW) || matchPassword(password, PASSWORDS.EDIT) || matchPassword(password, PASSWORDS.ADMIN)) {
      return next();
    }
    return res.status(401).json({ error: 'Invalid password' });
  }

  // POST/PUT/DELETE requires EDIT or ADMIN password
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (matchPassword(password, PASSWORDS.EDIT) || matchPassword(password, PASSWORDS.ADMIN)) {
      return next();
    }
    return res.status(401).json({ error: 'Insufficient permissions' });
  }

  res.status(401).json({ error: 'Unauthorized' });
}
