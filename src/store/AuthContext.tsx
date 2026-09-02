import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact your administrator.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to multiple failed login attempts. Please try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    default:
      return 'Authentication failed. Please check your connection and try again.';
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isAuthEnabled = Boolean(auth && isFirebaseConfigured());

  useEffect(() => {
    if (!auth || !isFirebaseConfigured()) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Subscribe to Firebase Auth state updates
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Auth state error:', error);
        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase Authentication is not initialized. Please verify your .env.local configuration.');
    }
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    await signInWithEmailAndPassword(auth, cleanEmail, password);
  };

  const logout = async (): Promise<void> => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase Authentication is not initialized.');
    }
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('Please enter your email address to receive password reset instructions.');
    }
    await sendPasswordResetEmail(auth, cleanEmail);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthEnabled,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
