import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange, getUserProfile } from '../services/auth';
import { Profile } from '../types/profile';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  isLoading: true 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    getCurrentUser().then(async (user) => {
      setUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          setProfile(profile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
      setIsLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          setProfile(profile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}