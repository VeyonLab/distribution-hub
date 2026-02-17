import { Building2, Users, GitBranch, ArrowLeftRight, LayoutDashboard, FileText, Truck, Activity, Package, Store } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

const ownerNavItems: NavItem[] = [
  { to: '/owner', label: 'Home', icon: LayoutDashboard },
  { to: '/owner/branches', label: 'Branches', icon: GitBranch },
  { to: '/owner/requests', label: 'Requests', icon: FileText },
  { to: '/owner/monitoring', label: 'Monitor', icon: Activity },
  { to: '/owner/transfers', label: 'Transfers', icon: ArrowLeftRight },
];

export default function TenantOwnerLayout() {
  const { tenant } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/owner/branches') return 'Branches';
    if (location.pathname === '/owner/team') return 'All Team Members';
    if (location.pathname === '/owner/transfers') return 'Stock Transfers';
    if (location.pathname === '/owner/requests') return 'All Requests';
    if (location.pathname === '/owner/trips') return 'All Trips';
    if (location.pathname === '/owner/monitoring') return 'Delivery Monitoring';
    if (location.pathname === '/owner/products') return 'All Products';
    if (location.pathname === '/owner/vendors') return 'All Vendors';
    return 'Distributor Dashboard';
  };

  // Don't show bottom nav for detail/sub pages
  if (
    location.pathname.match(/\/branches\/[^/]+/) || 
    location.pathname.match(/\/team\/[^/]+/) ||
    location.pathname.match(/\/requests\/[^/]+/)
  ) {
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
