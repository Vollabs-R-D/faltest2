import React from 'react';
import { Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function TokenBalance() {
  const { profile } = useAuth();
  const tokens = profile?.organization?.tokens ?? 0;

  return (
    <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5">
      <Coins className="h-4 w-4 text-gray-600" />
      <span className="text-sm font-medium text-gray-900">{tokens} tokens</span>
    </div>
  );
}