import { LayoutDashboard, FileText, Truck, Users } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

const managerNavItems: NavItem[] = [
  { to: '/manager', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/manager/requests', label: 'Requests', icon: FileText },
  { to: '/manager/trips', label: 'Trips', icon: Truck },
  { to: '/manager/team', label: 'Team', icon: Users },
];

export default function ManagerLayout() {
  const { tenant } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/manager/requests') return 'Vendor Requests';
    if (location.pathname === '/manager/trips') return 'Manage Trips';
    if (location.pathname === '/manager/team') return 'Team';
    return 'Manager Dashboard';
  };

  // Don't show bottom nav for detail/invite pages
  if (location.pathname.includes('/team/')) {
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
      bottomNav={<BottomNav items={managerNavItems} />}
    >
      <Outlet />
    </MobileLayout>
  );
}
