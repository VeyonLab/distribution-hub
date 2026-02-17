import { Building2, Users, GitBranch, ArrowLeftRight, LayoutDashboard } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

const ownerNavItems: NavItem[] = [
  { to: '/owner', label: 'Home', icon: LayoutDashboard },
  { to: '/owner/branches', label: 'Branches', icon: GitBranch },
  { to: '/owner/team', label: 'Team', icon: Users },
  { to: '/owner/transfers', label: 'Transfers', icon: ArrowLeftRight },
];

export default function TenantOwnerLayout() {
  const { tenant } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/owner/branches') return 'Branches';
    if (location.pathname === '/owner/team') return 'All Team Members';
    if (location.pathname === '/owner/transfers') return 'Stock Transfers';
    return 'Distributor Dashboard';
  };

  // Don't show bottom nav for detail/sub pages
  if (location.pathname.match(/\/branches\/[^/]+/) || location.pathname.match(/\/team\/[^/]+/)) {
    return <Outlet />;
  }

  return (
    <MobileLayout
      header={
        <PageHeader 
          title={getPageTitle()} 
          subtitle={tenant?.name || ''} 
          showLogout 
        />
      }
      bottomNav={<BottomNav items={ownerNavItems} />}
    >
      <Outlet />
    </MobileLayout>
  );
}
