import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateSchoolName: (schoolName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateSchoolName: async () => {},
});

async function fetchUserProfile(uid: string): Promise<{ schoolName: string }> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) {
    return snap.data() as { schoolName: string };
  }
  return { schoolName: '' };
}

async function saveUserProfile(uid: string, data: Record<string, any>) {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          schoolName: profile.schoolName || '',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string, schoolName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await saveUserProfile(cred.user.uid, {
      displayName: name,
      email,
      schoolName,
      createdAt: new Date().toISOString(),
    });
  };

  const signInWithGoogle = async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const cred = await signInWithCredential(auth, credential);
    const profile = await fetchUserProfile(cred.user.uid);
    if (!profile.schoolName) {
      await saveUserProfile(cred.user.uid, {
        displayName: cred.user.displayName,
        email: cred.user.email,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const updateSchoolName = async (schoolName: string) => {
    if (!user) return;
    await saveUserProfile(user.uid, { schoolName });
    setUser((prev) => (prev ? { ...prev, schoolName } : null));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, updateSchoolName }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
