import React, { useState, useEffect } from 'react';
import { Settings, Plus, X, CreditCard, History } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Organization, TokenTransaction } from '../types/organization';
import { TokenTransactionList } from '../components/TokenTransactionList';
import { getTokenTransactions, addTokens } from '../services/tokens';

// ... rest of the imports ...

export function SettingsPage() {
  // ... existing state ...
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchOrganization();
      fetchMembers();
      fetchTransactions();
    }
  }, [profile]);

  const fetchTransactions = async () => {
    if (!profile?.organization_id) return;
    
    setIsLoadingTransactions(true);
    try {
      const transactions = await getTokenTransactions(profile.organization_id);
      setTransactions(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handlePurchaseTokens = async (amount: number) => {
    if (!profile?.organization_id) return;

    try {
      await addTokens(profile.organization_id, amount);
      toast.success(`Successfully purchased ${amount} tokens`);
      fetchTransactions();
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      toast.error('Failed to purchase tokens');
    }
  };

  // ... rest of the component implementation ...

  return (
    <div className="px-8 py-12">
      <div className="space-y-8">
        {/* ... existing settings sections ... */}

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-black">Tokens</h3>
              <p className="mt-1 text-sm text-gray-500">
                Purchase tokens and view transaction history
              </p>
            </div>
            <CreditCard className="h-6 w-6 text-gray-400" />
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex gap-4">
              <button
                onClick={() => handlePurchaseTokens(100)}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
              >
                Purchase 100 Tokens
              </button>
              <button
                onClick={() => handlePurchaseTokens(500)}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
              >
                Purchase 500 Tokens
              </button>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-medium text-gray-900">
                Transaction History
              </h4>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
                </div>
              ) : (
                <TokenTransactionList transactions={transactions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}