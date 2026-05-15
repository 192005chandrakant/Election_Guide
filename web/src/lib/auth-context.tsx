"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { checkRedirectResult, logAuthError } from "@/lib/auth-utils";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for redirect result first (from popup fallback to redirect)
    const checkRedirect = async () => {
      try {
        const result = await checkRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
        }
      } catch (err) {
        logAuthError(err, "checkRedirectResult");
      }
    };
    
    checkRedirect();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      setError(null);
    }, (err) => {
      logAuthError(err, "onAuthStateChanged");
      setError(err.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
