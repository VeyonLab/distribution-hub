import { LayoutDashboard, Store, FileText } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

const salesmanNavItems: NavItem[] = [
  { to: '/salesman', label: 'Home', icon: LayoutDashboard },
  { to: '/salesman/vendors', label: 'Vendors', icon: Store },
  { to: '/salesman/requests', label: 'My Requests', icon: FileText },
];

export default function SalesmanLayout() {
  const { tenant } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/salesman/vendors') return 'Vendors';
    if (location.pathname === '/salesman/requests') return 'My Requests';
    return 'Salesman';
  };

  // Don't show bottom nav for detail/create pages
  if (location.pathname.includes('/vendors/') || location.pathname.includes('/create/') || location.pathname.includes('/requests/')) {
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
      bottomNav={<BottomNav items={salesmanNavItems} />}
    >
      <Outlet />
    </MobileLayout>
  );
}
