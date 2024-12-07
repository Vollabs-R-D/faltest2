import React from 'react';
import { formatDate } from '../utils/date';
import { TokenTransaction } from '../types/organization';

interface TokenTransactionListProps {
  transactions: TokenTransaction[];
}

export function TokenTransactionList({ transactions }: TokenTransactionListProps) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
        >
          <div>
            <p className="font-medium text-gray-900">
              {transaction.action_type === 'model_creation'
                ? 'Model Creation'
                : transaction.action_type === 'image_generation'
                ? 'Image Generation'
                : 'Token Purchase'}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(transaction.created_at)}
            </p>
          </div>
          <p className={`text-lg font-semibold ${
            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
          </p>
        </div>
      ))}
    </div>
  );
}