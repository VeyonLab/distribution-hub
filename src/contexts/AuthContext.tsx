import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Tenant, AuthState, Branch } from '@/types';
import { users, getTenantById, authenticateUser, tenants, getBranchById } from '@/data/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  // For Super Admin - ability to view a specific tenant
  viewingTenantId: string | null;
  setViewingTenant: (tenantId: string | null) => void;
  getActiveTenant: () => Tenant | null;
  // Branch info for branch-scoped roles
  branch: Branch | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tenant: null,
    isAuthenticated: false,
  });
  const [branch, setBranch] = useState<Branch | null>(null);
  const [viewingTenantId, setViewingTenantId] = useState<string | null>(null);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const user = authenticateUser(email, password);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const tenant = user.tenantId ? getTenantById(user.tenantId) || null : null;
    const userBranch = user.branchId ? getBranchById(user.branchId) || null : null;
    
    setAuthState({
      user,
      tenant,
      isAuthenticated: true,
    });
    setBranch(userBranch);
    
    // Reset viewing tenant on login
    setViewingTenantId(null);
    
    return { success: true };
  };

  const logout = () => {
    setAuthState({
      user: null,
      tenant: null,
      isAuthenticated: false,
    });
    setBranch(null);
    setViewingTenantId(null);
  };

  const setViewingTenant = (tenantId: string | null) => {
    if (authState.user?.role === 'super_admin') {
      setViewingTenantId(tenantId);
    }
  };

  const getActiveTenant = (): Tenant | null => {
    if (authState.user?.role === 'super_admin' && viewingTenantId) {
      return getTenantById(viewingTenantId) || null;
    }
    return authState.tenant;
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login, 
      logout, 
      viewingTenantId,
      setViewingTenant,
      getActiveTenant,
      branch,
    }}>
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
