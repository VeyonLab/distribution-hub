import { Truck, MapPin } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

const driverNavItems: NavItem[] = [
  { to: '/driver', label: 'Today', icon: Truck },
  { to: '/driver/route', label: 'Route', icon: MapPin },
];

export default function DriverLayout() {
  const { tenant } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/driver/route') return 'My Route';
    return "Today's Trip";
  };

  // Don't show bottom nav for stop detail pages
  if (location.pathname.includes('/driver/stop/')) {
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
      bottomNav={<BottomNav items={driverNavItems} />}
    >
      <Outlet />
    </MobileLayout>
  );
}
