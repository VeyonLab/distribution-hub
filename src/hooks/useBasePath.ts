import { useAuth } from '@/contexts/AuthContext';

/**
 * Returns the base path for manager-like operations.
 * For tenant_owner role, returns '/owner'.
 * For manager role, returns '/manager'.
 */
export function useBasePath() {
  const { user } = useAuth();
  return user?.role === 'tenant_owner' ? '/owner' : '/manager';
}