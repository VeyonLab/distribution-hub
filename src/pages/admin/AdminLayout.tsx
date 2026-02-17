import { Building2, LayoutDashboard } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';

const adminNavItems: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/distributors', label: 'Distributors', icon: Building2 },
];

export default function AdminLayout() {
  const location = useLocation();

  const getPageInfo = () => {
    if (location.pathname === '/admin/distributors') {
      return { title: 'Distributors', subtitle: 'All Distributors' };
    }
    return { title: 'Super Admin', subtitle: 'System Overview' };
  };

  const { title, subtitle } = getPageInfo();

  // Don't show layout for detail pages
  if (location.pathname.includes('/tenant/')) {
    return <Outlet />;
  }

  return (
    <MobileLayout
      header={<PageHeader title={title} subtitle={subtitle} showLogout />}
      bottomNav={<BottomNav items={adminNavItems} />}
    >
      <Outlet />
    </MobileLayout>
  );
}
