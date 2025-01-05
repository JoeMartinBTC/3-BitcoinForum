
export type UserRole = 'view' | 'edit' | 'admin';

const PASSWORDS = {
  '1': 'view' as UserRole,
  '2': 'edit' as UserRole, 
  '3': 'admin' as UserRole
};

export function authenticateUser(password: string): UserRole | null {
  return PASSWORDS[password as keyof typeof PASSWORDS] || null;
}

export function canEditEvents(role: UserRole): boolean {
  return role === 'edit' || role === 'admin';
}

export function canImportData(role: UserRole): boolean {
  return role === 'admin';
}
