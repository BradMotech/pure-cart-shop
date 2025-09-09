import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { LoadingOverlay } from '@/components/Loader';

interface UserProfile {
  id: string;
  email: string | null;
  full_name?: string | null;
  is_admin?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setProfile(data);
      
      // Check if user has admin role using the database function
      const { data: roleData, error: roleError } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      if (!roleError) {
        setIsAdmin(!!roleData);
      } else {
        // Fallback to email-based admin check
        const adminEmails = ['mashaobradley@gmail.com', 'bradley@motechxpress.co.za'];
        const isUserAdmin = adminEmails.includes(data.email || '');
        setIsAdmin(!!isUserAdmin);
      }
    } else {
      // If no profile exists, create one
      if (error && error.code === 'PGRST116') {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('profiles').insert({
            id: userId,
            email: userData.user.email,
            full_name: null
          });
        }
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (data.user && !error) {
      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName
      });
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };


  const signOut = async () => {
    setActionLoading(true);
    await supabase.auth.signOut();
    // Keep loading for a moment to show transition
    setTimeout(() => setActionLoading(false), 1000);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAdmin,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {actionLoading && <LoadingOverlay text="Signing out..." />}
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