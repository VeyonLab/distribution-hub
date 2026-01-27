import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Tenant, AuthState } from '@/types';
import { users, getTenantById } from '@/data/mockData';

interface AuthContextType extends AuthState {
  login: (email: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tenant: null,
    isAuthenticated: false,
  });

  const login = (email: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return false;

    const tenant = user.tenantId ? getTenantById(user.tenantId) || null : null;
    
    setAuthState({
      user,
      tenant,
      isAuthenticated: true,
    });
    
    return true;
  };

  const logout = () => {
    setAuthState({
      user: null,
      tenant: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
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
