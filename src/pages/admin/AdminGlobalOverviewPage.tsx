import { Building2, Truck, FileText, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tenants, getTripsByTenant, getVendorRequestsByTenant } from '@/data/mockData';

export default function AdminGlobalOverviewPage() {
  const navigate = useNavigate();

  // Get today's date for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate metrics per tenant
  const tenantMetrics = tenants.map(tenant => {
    const trips = getTripsByTenant(tenant.id);
    const requests = getVendorRequestsByTenant(tenant.id);

    // Today's active trips (scheduled or in_progress)
    const todayActiveTrips = trips.filter(t => {
      const tripDate = new Date(t.scheduledDate);
      tripDate.setHours(0, 0, 0, 0);
      return tripDate.getTime() === today.getTime() && 
             (t.status === 'scheduled' || t.status === 'in_progress' || t.status === 'draft');
    }).length;

    // Today's pending vendor requests
    const todayPendingRequests = requests.filter(r => {
      const reqDate = new Date(r.createdAt);
      reqDate.setHours(0, 0, 0, 0);
      return reqDate.getTime() === today.getTime() && r.status === 'pending';
    }).length;

    return {
      tenant,
      todayActiveTrips,
      todayPendingRequests,
    };
  });

  // Global totals
  const totalActiveTrips = tenantMetrics.reduce((sum, m) => sum + m.todayActiveTrips, 0);
  const totalPendingRequests = tenantMetrics.reduce((sum, m) => sum + m.todayPendingRequests, 0);

  return (
    <div className="space-y-6 p-4">
      {/* Global Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="bg-blue-500 p-4 text-white">
            <Truck className="mb-2 h-6 w-6" />
            <p className="text-3xl font-bold">{totalActiveTrips}</p>
            <p className="text-sm opacity-80">Active Trips Today</p>
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="bg-amber-500 p-4 text-white">
            <FileText className="mb-2 h-6 w-6" />
            <p className="text-3xl font-bold">{totalPendingRequests}</p>
            <p className="text-sm opacity-80">Pending Requests</p>
          </div>
        </Card>
      </div>

      {/* Tenant List with Metrics */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Tenants Overview</h2>
        <div className="space-y-3">
          {tenantMetrics.map(({ tenant, todayActiveTrips, todayPendingRequests }) => (
            <Card 
              key={tenant.id} 
              className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
              onClick={() => navigate(`/admin/tenant/${tenant.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-accent" />
                    {tenant.name}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{todayActiveTrips}</p>
                      <p className="text-xs text-muted-foreground">Active Trips</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{todayPendingRequests}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {tenants.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Building2 className="mb-2 h-12 w-12 text-muted-foreground/50" />
                <p className="font-medium">No tenants</p>
                <p className="text-sm text-muted-foreground">No tenants have been created yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
