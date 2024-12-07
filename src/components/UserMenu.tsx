import React from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function UserMenu() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="mt-auto p-4">
      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
        <div className="truncate">
          <p className="text-sm font-medium text-black">{user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="ml-2 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}