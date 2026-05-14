import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  schoolName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, schoolName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateSchoolName: (schoolName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateSchoolName: async () => {},
});

async function fetchProfile(uid: string): Promise<{ name: string; schoolName: string } | null> {
  const { data } = await supabase
    .from('profiles')
    .select('name, school_name')
    .eq('id', uid)
    .single();
  if (data) return { name: data.name, schoolName: data.school_name || '' };
  return null;
}

function sessionToUser(session: Session, profile: { name: string; schoolName: string } | null): AuthUser {
  return {
    uid: session.user.id,
    email: session.user.email ?? null,
    displayName: profile?.name ?? session.user.email?.split('@')[0] ?? null,
    schoolName: profile?.schoolName ?? '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const profile = await fetchProfile(session.user.id);
        setUser(sessionToUser(session, profile));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const profile = await fetchProfile(session.user.id);
        setUser(sessionToUser(session, profile));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string, schoolName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        school_name: schoolName,
      });
      if (profileError) {
        console.error('Profile insert error:', JSON.stringify(profileError));
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateSchoolName = async (schoolName: string) => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ school_name: schoolName })
      .eq('id', user.uid);
    setUser((prev) => (prev ? { ...prev, schoolName } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateSchoolName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
