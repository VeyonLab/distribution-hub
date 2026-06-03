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

  const adminTiles = [
    { label: 'Morning Routine', icon: Sun, color: 'from-amber-400 to-orange-500', route: '/owner/morning', desc: '5-min checklist' },
    { label: 'Real-Time Pulse', icon: Radio, color: 'from-blue-500 to-cyan-500', route: '/owner/pulse', desc: 'Live vans & tickets' },
    { label: 'Aging Stock', icon: Flame, color: 'from-red-500 to-pink-500', route: '/owner/aging-stock', desc: 'FIFO heatmap' },
    { label: 'EOD Reconciliation', icon: Wallet, color: 'from-emerald-500 to-teal-500', route: '/owner/reconciliation', desc: '3-way match' },
    { label: 'Credit Manager', icon: ShieldAlert, color: 'from-rose-500 to-red-600', route: '/owner/credit', desc: 'Bad payers' },
    { label: 'KPI Scorecard', icon: Trophy, color: 'from-violet-500 to-purple-600', route: '/owner/scorecard', desc: 'Leaderboard' },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Admin Panel — coordination */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <span className="text-xs text-muted-foreground">Coordination tools</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {adminTiles.map((t, i) => (
            <Card
              key={t.label}
              className="cursor-pointer overflow-hidden border-0 shadow-md transition-all hover:shadow-lg active:scale-[0.98] animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => navigate(t.route)}
            >
              <div className={`bg-gradient-to-br ${t.color} p-4 text-white`}>
                <t.icon className="mb-2 h-6 w-6" />
                <p className="text-sm font-semibold">{t.label}</p>
                <p className="text-[11px] opacity-90">{t.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Branch Stats */}
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