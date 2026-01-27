import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Package, Truck, MapPin, Store, ArrowLeft } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  getTenantById, 
  getUsersByTenant, 
  getVendorsByTenant, 
  getProductsByTenant,
  getRoutesByTenant,
  getVendorRequestsByTenant, 
  getTripsByTenant 
} from '@/data/mockData';

export default function TenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  const tenant = tenantId ? getTenantById(tenantId) : null;

  if (!tenant) {
    return (
      <MobileLayout
        header={<PageHeader title="Tenant Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Building2 className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Tenant not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/admin')}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const tenantUsers = getUsersByTenant(tenant.id);
  const tenantVendors = getVendorsByTenant(tenant.id);
  const tenantProducts = getProductsByTenant(tenant.id);
  const tenantRoutes = getRoutesByTenant(tenant.id);
  const tenantRequests = getVendorRequestsByTenant(tenant.id);
  const tenantTrips = getTripsByTenant(tenant.id);

  const pendingRequests = tenantRequests.filter(r => r.status === 'pending').length;
  const activeTrips = tenantTrips.filter(t => t.status !== 'completed').length;

  return (
    <MobileLayout
      header={
        <PageHeader 
          title={tenant.name} 
          subtitle="Tenant Details" 
          showBack
          showLogout 
        />
      }
    >
      <div className="space-y-6 p-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Users className="mx-auto mb-1 h-5 w-5 text-blue-500" />
              <p className="text-xl font-bold">{tenantUsers.length}</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Store className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
              <p className="text-xl font-bold">{tenantVendors.length}</p>
              <p className="text-xs text-muted-foreground">Vendors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Package className="mx-auto mb-1 h-5 w-5 text-purple-500" />
              <p className="text-xl font-bold">{tenantProducts.length}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <MapPin className="mx-auto mb-1 h-5 w-5 text-amber-500" />
              <p className="text-xl font-bold">{tenantRoutes.length}</p>
              <p className="text-xs text-muted-foreground">Routes</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-accent" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            {tenantUsers.length > 0 ? (
              tenantUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize">
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">No team members</p>
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
              <span className="text-sm font-normal text-muted-foreground">
                {pendingRequests} pending
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            {tenantRequests.slice(0, 3).map((request) => (
              <div key={request.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{request.items.length} items</p>
                  <p className="text-xs text-muted-foreground">
                    {request.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
            ))}
            {tenantRequests.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No requests</p>
            )}
          </CardContent>
        </Card>

        {/* Active Trips */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-accent" />
                Active Trips
              </div>
              <span className="text-sm font-normal text-muted-foreground">
                {activeTrips} active
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            {tenantTrips.slice(0, 3).map((trip) => (
              <div key={trip.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{trip.stops.length} stops</p>
                  <p className="text-xs text-muted-foreground">
                    {trip.scheduledDate.toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={trip.status} />
              </div>
            ))}
            {tenantTrips.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No trips</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
