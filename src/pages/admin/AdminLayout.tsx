import { Building2, Users, Activity } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';

const adminNavItems: NavItem[] = [
  { to: '/admin', label: 'Tenants', icon: Building2 },
  { to: '/admin/overview', label: 'Overview', icon: Activity },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const location = useLocation();

  const getPageInfo = () => {
    if (location.pathname === '/admin/users') {
      return { title: 'All Users', subtitle: 'User Management' };
    }
    if (location.pathname === '/admin/overview') {
      return { title: 'Global Overview', subtitle: 'Today\'s Activity' };
    }
    return { title: 'Super Admin', subtitle: 'System Overview' };
  };

  const { title, subtitle } = getPageInfo();

  // Don't show layout for detail pages
  if (location.pathname.includes('/tenant/') || location.pathname.match(/\/users\/[^/]+$/)) {
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
