import { useParams, useNavigate } from 'react-router-dom';
import { GitBranch, Users, Package, Truck, MapPin, Store, Edit, Trash2 } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/hooks/use-toast';
import { 
  getBranchById, 
  getUsersByBranch, 
  getVendorsByBranch, 
  getProductsByBranch,
  getRoutesByBranch,
  getVendorRequestsByBranch, 
  getTripsByBranch 
} from '@/data/mockData';
import { UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  tenant_owner: 'Distributor Admin',
  manager: 'Manager',
  salesman: 'Salesman',
  driver: 'Driver',
};

export default function OwnerBranchDetailPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const branch = branchId ? getBranchById(branchId) : null;

  if (!branch) {
    return (
      <MobileLayout header={<PageHeader title="Branch Not Found" showBack showLogout />}>
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <GitBranch className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Branch not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/owner/branches')}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const branchUsers = getUsersByBranch(branch.id);
  const branchVendors = getVendorsByBranch(branch.id);
  const branchProducts = getProductsByBranch(branch.id);
  const branchRoutes = getRoutesByBranch(branch.id);
  const branchRequests = getVendorRequestsByBranch(branch.id);
  const branchTrips = getTripsByBranch(branch.id);

  const pendingRequests = branchRequests.filter(r => r.status === 'pending').length;
  const activeTrips = branchTrips.filter(t => t.status !== 'completed').length;

  return (
    <MobileLayout
      header={
        <PageHeader 
          title={branch.name} 
          subtitle="Branch Details" 
          showBack
          showLogout 
        />
      }
    >
      <div className="space-y-6 p-4">
        {/* Branch Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {branch.address}
                </div>
                <StatusBadge status={branch.status} />
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => navigate(`/owner/branches/${branch.id}/edit`)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="text-destructive" onClick={() => {
                  toast({ title: 'Branch deactivated', description: `${branch.name} has been deactivated.` });
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Users className="mx-auto mb-1 h-5 w-5 text-blue-500" />
              <p className="text-xl font-bold">{branchUsers.length}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Store className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
              <p className="text-xl font-bold">{branchVendors.length}</p>
              <p className="text-xs text-muted-foreground">Vendors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Package className="mx-auto mb-1 h-5 w-5 text-purple-500" />
              <p className="text-xl font-bold">{branchProducts.length}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Truck className="mx-auto mb-1 h-5 w-5 text-amber-500" />
              <p className="text-xl font-bold">{activeTrips}</p>
              <p className="text-xs text-muted-foreground">Active Trips</p>
            </CardContent>
          </Card>
        </div>

        {/* Branch Members */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-accent" />
              Branch Members
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            {branchUsers.length > 0 ? (
              branchUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize">
                    {roleLabels[user.role]}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No members in this branch</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                Recent Requests
              </div>
              <span className="text-sm font-normal text-muted-foreground">{pendingRequests} pending</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            {branchRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{request.items.length} items</p>
                  <p className="text-xs text-muted-foreground">{request.createdAt.toLocaleDateString()}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>
            ))}
            {branchRequests.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No requests</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
