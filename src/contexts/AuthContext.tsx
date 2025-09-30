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
      console.log('🔍 fetchProfile - Starting for userId:', userId);
      
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
      console.log('📋 fetchProfile - Profile data:', data, 'error:', error);

      if (data && !error) {
        setProfile(data);
        console.log('✅ fetchProfile - Profile set, checking admin status for email:', data.email);
        
        // Check if user is admin by checking admins table
        try {
          console.log('🔐 fetchProfile - Checking admin status for email:', data.email);
          
          // Direct check without JWT - use the user's email from profile
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('email')
            .eq('email', data.email)
            .single();
          
          console.log('🔐 fetchProfile - Admin check result:', adminData, 'error:', adminError);
          
          // User is admin if their email exists in the admins table
          const isAdminUser = !!adminData && !adminError;
          console.log('👤 fetchProfile - Setting isAdmin to:', isAdminUser);
          setIsAdmin(isAdminUser);
        } catch (adminError) {
          console.warn('❌ fetchProfile - Admin check failed:', adminError);
          setIsAdmin(false);
        }
      } else {
        console.log('⚠️ fetchProfile - No profile found, creating one');
        // If no profile exists, create one
        if (error && error.code === 'PGRST116') {
          try {
            const { data: userData } = await supabase.auth.getUser();
            console.log('👤 fetchProfile - Creating profile for user:', userData.user?.email);
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
                
                console.log('🔐 fetchProfile - New profile admin check:', adminData);
                const isAdminUser = !!adminData;
                console.log('👤 fetchProfile - Setting isAdmin (new profile) to:', isAdminUser);
                setIsAdmin(isAdminUser);
              } catch {
                console.log('❌ fetchProfile - New profile admin check failed');
                setIsAdmin(false);
              }
            }
          } catch (insertError) {
            console.error('💥 fetchProfile - Failed to create profile:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('💥 fetchProfile - Error:', error);
      // Reset states on error to prevent infinite loading
      setProfile(null);
      setIsAdmin(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
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