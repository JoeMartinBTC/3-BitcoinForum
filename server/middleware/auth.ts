
const PASSWORDS = {
  '1': 'bip25',
  '2': '130jahre',
  '3': '99ballons'
};

const matchPassword = (input: string) => {
  const inputLower = input.toLowerCase();
  if (inputLower === PASSWORDS['1'] || inputLower === '1') return '1';
  if (inputLower === PASSWORDS['2'] || inputLower === '2') return '2';
  if (inputLower === PASSWORDS['3'] || inputLower === '3') return '3';
  return null;
};

export function authMiddleware(req: any, res: any, next: any) {
  const password = req.headers['x-password'];
  const level = matchPassword(password || '');
  
  // Always allow GET requests (view only)
  if (req.method === 'GET') {
    if (!password || level) {
      return next();
    }
    return res.status(401).json({ error: 'Invalid password' });
  }

  // POST/PUT/DELETE requires level 2 or 3
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (level === '2' || level === '3') {
      return next();
    }
    return res.status(401).json({ error: 'Insufficient permissions' });
  }

  res.status(401).json({ error: 'Unauthorized' });
}
