
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from '../hooks/use-toast';

interface User {
  id: number;
  email: string;
  role: string;
  replitUsername: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  const fetchCurrentUser = async () => {
    const res = await fetch('/api/users/me');
    if (res.ok) {
      const data = await res.json();
      setCurrentUser(data);
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });

    if (res.ok) {
      toast({ description: "User role updated successfully" });
      fetchUsers();
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <Card className="p-4">You need admin access to view this section.</Card>;
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <p className="font-medium">{user.replitUsername}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <select 
              value={user.role}
              onChange={(e) => updateUserRole(user.id, e.target.value)}
              className="border rounded p-1"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </Card>
  );
}
