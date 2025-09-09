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
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            // Use setTimeout to defer profile fetching and prevent blocking
            setTimeout(() => {
              if (mounted) {
                fetchProfile(session.user.id);
              }
            }, 0);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          // Use setTimeout to defer profile fetching and prevent blocking
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (data && !error) {
        setProfile(data);
        
        // Check if user is admin by checking admins table
        try {
          const adminCheckPromise = supabase
            .from('admins')
            .select('email')
            .eq('email', data.email)
            .single();
          
          const adminTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Admin check timeout')), 5000)
          );

          const { data: adminData, error: adminError } = await Promise.race([adminCheckPromise, adminTimeoutPromise]) as any;
          
          // User is admin if their email exists in the admins table
          setIsAdmin(!!adminData && !adminError);
        } catch (adminError) {
          console.warn('Admin check failed:', adminError);
          setIsAdmin(false);
        }
      } else {
        // If no profile exists, create one
        if (error && error.code === 'PGRST116') {
          try {
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              await supabase.from('profiles').insert({
                id: userId,
                email: userData.user.email,
                full_name: null
              });
              // Set basic profile data
              setProfile({
                id: userId,
                email: userData.user.email,
                full_name: null
              });
              
              // Check admin status for new profile
              try {
                const { data: adminData } = await supabase
                  .from('admins')
                  .select('email')
                  .eq('email', userData.user.email)
                  .single();
                
                setIsAdmin(!!adminData);
              } catch {
                setIsAdmin(false);
              }
            }
          } catch (insertError) {
            console.error('Failed to create profile:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Reset states on error to prevent infinite loading
      setProfile(null);
      setIsAdmin(false);
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
    try {
      await supabase.auth.signOut();
      // Clear all auth state immediately
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always reset loading state
      setTimeout(() => setActionLoading(false), 500);
    }
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