import { LayoutDashboard, Store, FileText, BarChart3 } from 'lucide-react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { SalesmanProvider, useSalesman } from '@/contexts/SalesmanContext';

const salesmanNavItems: NavItem[] = [
  { to: '/salesman', label: 'Home', icon: LayoutDashboard },
  { to: '/salesman/vendors', label: 'Outlets', icon: Store },
  { to: '/salesman/requests', label: 'Orders', icon: FileText },
  { to: '/salesman/performance', label: 'KPIs', icon: BarChart3 },
];

function SalesmanShell() {
  const { tenant } = useAuth();
  const { checkIn } = useSalesman();
  const location = useLocation();

  // Gate: must be checked in
  if (!checkIn && location.pathname !== '/salesman/check-in') {
    return <Navigate to="/salesman/check-in" replace />;
  }
  if (checkIn && location.pathname === '/salesman/check-in') {
    return <Navigate to="/salesman" replace />;
  }

  const getPageTitle = () => {
    if (location.pathname === '/salesman/vendors') return 'Outlets';
    if (location.pathname === '/salesman/requests') return 'My Orders';
    if (location.pathname === '/salesman/performance') return 'Performance';
    return 'Salesman';
  };

  // Don't show bottom nav for detail/create/flow pages
  const hideNav = location.pathname.includes('/vendors/') ||
    location.pathname.includes('/create/') ||
    location.pathname.includes('/requests/') ||
    location.pathname.includes('/visit/') ||
    location.pathname.includes('/closure/') ||
    location.pathname.includes('/invoice/') ||
    location.pathname === '/salesman/check-in';

  if (hideNav) return <Outlet />;

  return (
    <MobileLayout
      header={<PageHeader title={getPageTitle()} subtitle={tenant?.name || ''} showLogout />}
      bottomNav={<BottomNav items={salesmanNavItems} />}
    >
      <Outlet />
    </MobileLayout>
  );
}

export default function SalesmanLayout() {
  return (
    <SalesmanProvider>
      <SalesmanShell />
    </SalesmanProvider>
  );
}
