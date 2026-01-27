import { LayoutDashboard, PlusCircle, FileText } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

const salesmanNavItems: NavItem[] = [
  { to: '/salesman', label: 'Home', icon: LayoutDashboard },
  { to: '/salesman/create', label: 'New Request', icon: PlusCircle },
  { to: '/salesman/requests', label: 'My Requests', icon: FileText },
];

export default function SalesmanLayout() {
  const { tenant } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/salesman/create') return 'Create Request';
    if (location.pathname === '/salesman/requests') return 'My Requests';
    return 'Salesman';
  };

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
