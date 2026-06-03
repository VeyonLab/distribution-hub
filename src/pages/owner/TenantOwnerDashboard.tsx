import { FileText, Truck, Package, Users, ArrowLeftRight, Store, Settings, Activity, Sun, Radio, Flame, Wallet, ShieldAlert, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  getVendorRequestsByBranch,
  getTripsByBranch,
  getVendorsByBranch,
  getProductsByBranch,
  getBranchesByTenant,
  getUsersByTenant
} from '@/data/mockData';

export default function TenantOwnerDashboard() {
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();

  if (!tenant || !branch) return null;

  // Branch-scoped data (same as manager)
  const requests = getVendorRequestsByBranch(branch.id);
  const trips = getTripsByBranch(branch.id);
  const vendors = getVendorsByBranch(branch.id);
  const products = getProductsByBranch(branch.id);

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const todayRequests = requests.length;
  const activeTrips = trips.filter(t => t.status !== 'completed').length;
  const activeProducts = products.filter(p => p.status === 'active').length;

  // Admin data
  const tenantBranches = getBranchesByTenant(tenant.id).filter(b => b.status === 'active');
  const tenantUsers = getUsersByTenant(tenant.id).filter(u => u.role !== 'tenant_owner');

  const stats = [
    { 
      label: 'Pending Requests', 
      value: pendingRequests, 
      icon: FileText, 
      color: 'bg-amber-500',
      onClick: () => navigate('/owner/requests')
    },
    { 
      label: 'Active Products', 
      value: activeProducts, 
      icon: Package, 
      color: 'bg-blue-500',
      onClick: () => navigate('/owner/products')
    },
    { 
      label: 'Active Trips', 
      value: activeTrips, 
      icon: Truck, 
      color: 'bg-emerald-500',
      onClick: () => navigate('/owner/trips')
    },
    { 
      label: 'Total Vendors', 
      value: vendors.length, 
      icon: Store, 
      color: 'bg-purple-500',
      onClick: () => navigate('/owner/vendors')
    },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label} 
            className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98] animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={stat.onClick}
          >
            <CardContent className="p-4">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
        <div className="space-y-3">
          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/owner/requests')}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-medium">Review Requests</p>
                <p className="text-sm text-muted-foreground">
                  {pendingRequests} pending for batching
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/owner/trips')}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <Truck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Manage Trips</p>
                <p className="text-sm text-muted-foreground">
                  Create and assign delivery trips
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/owner/transfers')}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <ArrowLeftRight className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-medium">Stock Transfers</p>
                <p className="text-sm text-muted-foreground">
                  Request stock from other branches
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* More Options */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Manage</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/owner/products')}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <Package className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Products</span>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/owner/vendors')}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <Store className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Vendors</span>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/owner/routes')}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <Activity className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Routes</span>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/owner/team')}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <Users className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Team</span>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/owner/settings')}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <Settings className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Settings</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-2 font-medium">Today's Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Vendors</span>
              <span className="font-medium">{vendors.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requests Created</span>
              <span className="font-medium">{todayRequests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deliveries Completed</span>
              <span className="font-medium">
                {trips.filter(t => t.status === 'completed').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}