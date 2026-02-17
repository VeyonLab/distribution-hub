import { GitBranch, Users, Package, Truck, ArrowLeftRight, FileText, Activity, Store, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getBranchesByTenant, 
  getUsersByTenant, 
  getVendorRequestsByTenant, 
  getTripsByTenant,
  getStockTransfersByTenant,
  getVendorRequestsByBranch,
  getTripsByBranch
} from '@/data/mockData';

export default function TenantOwnerDashboard() {
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();

  if (!tenant) return null;

  const tenantBranches = getBranchesByTenant(tenant.id).filter(b => b.status === 'active');
  const tenantUsers = getUsersByTenant(tenant.id).filter(u => u.role !== 'tenant_owner');
  const tenantRequests = getVendorRequestsByTenant(tenant.id);
  const tenantTrips = getTripsByTenant(tenant.id);
  const tenantTransfers = getStockTransfersByTenant(tenant.id);

  const pendingTransfers = tenantTransfers.filter(t => t.status === 'pending').length;
  const activeTrips = tenantTrips.filter(t => t.status !== 'completed').length;
  const pendingRequests = tenantRequests.filter(r => r.status === 'pending').length;

  // Home branch stats
  const myBranchRequests = branch ? getVendorRequestsByBranch(branch.id).filter(r => r.status !== 'draft') : [];
  const myBranchTrips = branch ? getTripsByBranch(branch.id) : [];
  const myPendingRequests = myBranchRequests.filter(r => r.status === 'pending').length;
  const myActiveTrips = myBranchTrips.filter(t => t.status !== 'completed').length;

  const stats = [
    { label: 'Active Branches', value: tenantBranches.length, icon: GitBranch, color: 'bg-blue-500', onClick: () => navigate('/owner/branches') },
    { label: 'Total Requests', value: tenantRequests.filter(r => r.status !== 'draft').length, icon: FileText, color: 'bg-emerald-500', onClick: () => navigate('/owner/requests') },
    { label: 'Active Trips', value: activeTrips, icon: Truck, color: 'bg-purple-500', onClick: () => navigate('/owner/trips') },
    { label: 'Pending Transfers', value: pendingTransfers, icon: ArrowLeftRight, color: 'bg-amber-500', onClick: () => navigate('/owner/transfers') },
  ];

  return (
    <div className="space-y-6 p-4">
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

      {/* My Branch Operations */}
      {branch && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">My Branch — {branch.name}</h2>
          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/manager')}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Manage Branch Operations</p>
                <p className="text-sm text-muted-foreground">
                  {myPendingRequests} pending requests • {myActiveTrips} active trips
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Card 
              className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
              onClick={() => navigate('/manager/requests')}
            >
              <CardContent className="flex flex-col items-center gap-1 p-3">
                <FileText className="h-5 w-5 text-accent" />
                <span className="text-xs font-medium">Requests</span>
                <span className="text-xs text-muted-foreground">{myPendingRequests} pending</span>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
              onClick={() => navigate('/manager/trips')}
            >
              <CardContent className="flex flex-col items-center gap-1 p-3">
                <Truck className="h-5 w-5 text-accent" />
                <span className="text-xs font-medium">Trips</span>
                <span className="text-xs text-muted-foreground">{myActiveTrips} active</span>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
              onClick={() => navigate('/manager/products')}
            >
              <CardContent className="flex flex-col items-center gap-1 p-3">
                <Package className="h-5 w-5 text-accent" />
                <span className="text-xs font-medium">Products</span>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Admin Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Admin Overview</h2>
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
                <p className="font-medium">All Requests (Cross-Branch)</p>
                <p className="text-sm text-muted-foreground">
                  {pendingRequests} pending across branches
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/owner/monitoring')}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Activity className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-medium">Delivery Monitoring</p>
                <p className="text-sm text-muted-foreground">
                  Track all trips in real-time
                </p>
              </div>
            </CardContent>
          </Card>

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
              onClick={() => navigate('/owner/team')}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">Team</span>
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
              onClick={() => navigate('/owner/branches')}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <GitBranch className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">Branches</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Branch Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-2 font-medium">Branch Overview</h3>
          <div className="space-y-2 text-sm">
            {tenantBranches.map(b => {
              const branchUsers = tenantUsers.filter(u => u.branchId === b.id);
              return (
                <div key={b.id} className="flex justify-between">
                  <span className="text-muted-foreground">{b.name}</span>
                  <span className="font-medium">{branchUsers.length} members</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
