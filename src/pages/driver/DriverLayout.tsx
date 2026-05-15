import { Truck, MapPin, Package, ClipboardList } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

const driverNavItems: NavItem[] = [
  { to: '/driver', label: 'Today', icon: Truck },
  { to: '/driver/route', label: 'Route', icon: MapPin },
  { to: '/driver/stock', label: 'Van', icon: Package },
  { to: '/driver/eod', label: 'EOD', icon: ClipboardList },
];

const NESTED_PATTERNS = ['/driver/stop/', '/driver/loading', '/driver/gate-pass', '/driver/incident'];

export default function DriverLayout() {
  const { tenant } = useAuth();
  const location = useLocation();

  // Detail/sub-flow pages render their own MobileLayout
  if (NESTED_PATTERNS.some(p => location.pathname.startsWith(p))) {
    return <Outlet />;
  }

  const getPageTitle = () => {
    if (location.pathname === '/driver/route') return 'My Route';
    if (location.pathname === '/driver/stock') return 'Stock on Wheels';
    if (location.pathname === '/driver/eod') return 'End of Day';
    return "Today's Trip";
  };

  return (
    <MobileLayout
      header={<PageHeader title={getPageTitle()} subtitle={tenant?.name || ''} showLogout />}
      bottomNav={<BottomNav items={driverNavItems} />}
    >
      <Outlet />
    </MobileLayout>
  );
}
