import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's an existing token and validate it
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const { data, error } = await apiClient.getProfile();
        if (data && !error) {
          setUser({
            id: data.id,
            email: data.email,
            full_name: data.full_name
          });
          setIsAdmin(data.isAdmin || false);
        } else {
          // Invalid token, remove it
          apiClient.removeToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await apiClient.signUp(email, password, fullName);
    
    if (data && !error) {
      setUser(data.user);
      // Fetch profile to get admin status
      const profileResult = await apiClient.getProfile();
      if (profileResult.data) {
        setIsAdmin(profileResult.data.isAdmin || false);
      }
    }
    
    return { error: error ? { message: error } : null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await apiClient.signIn(email, password);
    
    if (data && !error) {
      setUser(data.user);
      // Fetch profile to get admin status
      const profileResult = await apiClient.getProfile();
      if (profileResult.data) {
        setIsAdmin(profileResult.data.isAdmin || false);
      }
    }
    
    return { error: error ? { message: error } : null };
  };

  const signOut = async () => {
    apiClient.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};