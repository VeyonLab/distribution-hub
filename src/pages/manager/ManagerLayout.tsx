import { LayoutDashboard, FileText, Truck, Package, Activity, ArrowLeftRight } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

const managerNavItems: NavItem[] = [
  { to: '/manager', label: 'Home', icon: LayoutDashboard },
  { to: '/manager/requests', label: 'Requests', icon: FileText },
  { to: '/manager/trips', label: 'Trips', icon: Truck },
  { to: '/manager/monitoring', label: 'Monitor', icon: Activity },
  { to: '/manager/transfers', label: 'Transfers', icon: ArrowLeftRight },
];

export default function ManagerLayout() {
  const { tenant, branch } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/manager/requests') return 'Requests Inbox';
    if (location.pathname === '/manager/trips') return 'Manage Trips';
    if (location.pathname === '/manager/monitoring') return 'Delivery Monitoring';
    if (location.pathname === '/manager/products') return 'Products';
    if (location.pathname === '/manager/vendors') return 'Vendors';
    if (location.pathname === '/manager/routes') return 'Routes';
    if (location.pathname === '/manager/transfers') return 'Stock Transfers';
    return 'Manager Dashboard';
  };

  // Don't show bottom nav for detail/sub pages
  if (location.pathname.includes('/team/') || location.pathname.includes('/products/') || location.pathname.includes('/vendors/') || location.pathname.includes('/routes/') || location.pathname.includes('/requests/') || location.pathname.includes('/trips/') || location.pathname.includes('/transfers/') || location.pathname.match(/\/monitoring\/[^/]+$/)) {
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
      bottomNav={<BottomNav items={managerNavItems} />}
    >
      <Outlet />
    </MobileLayout>
  );
}
