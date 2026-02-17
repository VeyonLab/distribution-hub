import { LayoutDashboard, FileText, Truck, Package, Activity, ArrowLeftRight, ArrowLeft } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav, NavItem } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const managerNavItems: NavItem[] = [
  { to: '/manager', label: 'Home', icon: LayoutDashboard },
  { to: '/manager/requests', label: 'Requests', icon: FileText },
  { to: '/manager/trips', label: 'Trips', icon: Truck },
  { to: '/manager/monitoring', label: 'Monitor', icon: Activity },
  { to: '/manager/transfers', label: 'Transfers', icon: ArrowLeftRight },
];

export default function ManagerLayout() {
  const { tenant, branch, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isOwnerActingAsManager = user?.role === 'tenant_owner';

  const getPageTitle = () => {
    if (location.pathname === '/manager/requests') return 'Requests Inbox';
    if (location.pathname === '/manager/trips') return 'Manage Trips';
    if (location.pathname === '/manager/monitoring') return 'Delivery Monitoring';
    if (location.pathname === '/manager/products') return 'Products';
    if (location.pathname === '/manager/vendors') return 'Vendors';
    if (location.pathname === '/manager/routes') return 'Routes';
    if (location.pathname === '/manager/transfers') return 'Stock Transfers';
    return isOwnerActingAsManager ? 'Branch Operations' : 'Manager Dashboard';
  };

  // Don't show bottom nav for detail/sub pages
  if (location.pathname.includes('/team/') || location.pathname.includes('/products/') || location.pathname.includes('/vendors/') || location.pathname.includes('/routes/') || location.pathname.includes('/requests/') || location.pathname.includes('/trips/') || location.pathname.includes('/transfers/') || location.pathname.match(/\/monitoring\/[^/]+$/)) {
    return <Outlet />;
  }

  return (
    <MobileLayout
      header={
        <div>
          {isOwnerActingAsManager && (
            <div className="px-4 pt-2">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground" onClick={() => navigate('/owner')}>
                <ArrowLeft className="h-3 w-3" />
                Back to Admin Dashboard
              </Button>
            </div>
          )}
          <PageHeader 
            title={getPageTitle()} 
            subtitle={branch ? `${tenant?.name} • ${branch.name}` : tenant?.name || ''} 
            showLogout={!isOwnerActingAsManager}
          />
        </div>
      }
      bottomNav={<BottomNav items={managerNavItems} />}
    >
      <Outlet />
    </MobileLayout>
  );
}
