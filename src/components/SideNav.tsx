import React from 'react';
import { Brain, Wand, Library, Images, Settings, LogIn } from 'lucide-react';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';
import { User } from '@supabase/supabase-js';
import { TokenBalance } from './TokenBalance';

interface SideNavProps {
  currentPage: 'create' | 'models' | 'generate' | 'gallery' | 'settings';
  onPageChange: (page: 'create' | 'models' | 'generate' | 'gallery' | 'settings') => void;
  user: User | null;
}

export function SideNav({ currentPage, onPageChange, user }: SideNavProps) {
  return (
    <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <Logo />
        <h1 className="ml-3 text-xl font-semibold text-black">Chromir</h1>
      </div>
      {user && (
        <div className="px-4 py-3 border-b border-gray-200">
          <TokenBalance />
        </div>
      )}
      <nav className="flex-1 px-4 pt-8">
        <button
          onClick={() => onPageChange('create')}
          className={`mb-2 flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
            currentPage === 'create'
              ? 'bg-gray-100 text-black'
              : 'text-gray-500 hover:bg-gray-50 hover:text-black'
          }`}
        >
          <Brain className="mr-3 h-5 w-5" />
          Create Model
        </button>
        <button
          onClick={() => onPageChange('models')}
          className={`mb-2 flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
            currentPage === 'models'
              ? 'bg-gray-100 text-black'
              : 'text-gray-500 hover:bg-gray-50 hover:text-black'
          }`}
        >
          <Library className="mr-3 h-5 w-5" />
          Your Models
        </button>
        <button
          onClick={() => onPageChange('generate')}
          className={`mb-2 flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
            currentPage === 'generate'
              ? 'bg-gray-100 text-black'
              : 'text-gray-500 hover:bg-gray-50 hover:text-black'
          }`}
        >
          <Wand className="mr-3 h-5 w-5" />
          Generate Images
        </button>
        <button
          onClick={() => onPageChange('gallery')}
          className={`mb-2 flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
            currentPage === 'gallery'
              ? 'bg-gray-100 text-black'
              : 'text-gray-500 hover:bg-gray-50 hover:text-black'
          }`}
        >
          <Images className="mr-3 h-5 w-5" />
          Gallery
        </button>
        <button
          onClick={() => onPageChange('settings')}
          className={`flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
            currentPage === 'settings'
              ? 'bg-gray-100 text-black'
              : 'text-gray-500 hover:bg-gray-50 hover:text-black'
          }`}
        >
          {user ? (
            <>
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </>
          ) : (
            <>
              <LogIn className="mr-3 h-5 w-5" />
              Sign In
            </>
          )}
        </button>
      </nav>
      {user && <UserMenu />}
    </div>
  );
}