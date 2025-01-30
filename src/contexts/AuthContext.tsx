import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, getUserRole, UserRole, UserData } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  checkAuthorization: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleHierarchy: Record<UserRole, number> = {
  'super_admin': 4,
  'admin': 3,
  'editor': 2,
  'viewer': 1
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const role = await getUserRole(firebaseUser.uid);
          if (role) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              role,
              displayName: firebaseUser.displayName || undefined,
              lastLogin: new Date(),
              createdAt: new Date(firebaseUser.metadata.creationTime!)
            });
          } else {
            setError('User role not found');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Authentication error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAuthorization = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    
    const userRoleLevel = roleHierarchy[user.role];
    return requiredRoles.some(role => userRoleLevel >= roleHierarchy[role]);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, checkAuthorization }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}