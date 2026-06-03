import { GitBranch, LayoutDashboard, Truck, Activity, Radio } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

const ownerNavItems: NavItem[] = [
  { to: '/owner', label: 'Home', icon: LayoutDashboard },
  { to: '/owner/pulse', label: 'Pulse', icon: Radio },
  { to: '/owner/trips', label: 'Trips', icon: Truck },
  { to: '/owner/monitoring', label: 'Monitor', icon: Activity },
  { to: '/owner/branches', label: 'Branches', icon: GitBranch },
];

export default function TenantOwnerLayout() {
  const { tenant, branch } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/owner/branches') return 'All Branches';
    if (location.pathname === '/owner/team') return 'Branch Team';
    if (location.pathname === '/owner/transfers') return 'Stock Transfers';
    if (location.pathname === '/owner/requests') return 'Requests Inbox';
    if (location.pathname === '/owner/trips') return 'Manage Trips';
    if (location.pathname === '/owner/monitoring') return 'Delivery Monitoring';
    if (location.pathname === '/owner/products') return 'Products';
    if (location.pathname === '/owner/vendors') return 'Vendors';
    if (location.pathname === '/owner/routes') return 'Routes';
    if (location.pathname === '/owner/settings') return 'Business Settings';
    if (location.pathname === '/owner/pulse') return 'Real-Time Pulse';
    return 'Admin Dashboard';
  };

  // Don't show bottom nav for detail/sub pages
  if (
    location.pathname.match(/\/branches\/[^/]+/) || 
    location.pathname.match(/\/team\/[^/]+/) ||
    location.pathname.match(/\/requests\/[^/]+/) ||
    location.pathname.match(/\/trips\/[^/]+/) ||
    location.pathname.match(/\/monitoring\/[^/]+/) ||
    location.pathname.match(/\/vendors\/[^/]+/) ||
    location.pathname.match(/\/products\/[^/]+/) ||
    location.pathname.match(/\/routes\/[^/]+/) ||
    location.pathname === '/owner/settings'
  ) {
    return <Outlet />;
  }

  return (
    <MobileLayout
      header={
        <PageHeader 
          title={getPageTitle()} 
          subtitle={branch ? `${tenant?.name} • ${branch.name}` : tenant?.name || ''} 
          showLogout 
        />
      }
      bottomNav={<BottomNav items={ownerNavItems} />}
    >
      <Outlet />
    </MobileLayout>
  );
}