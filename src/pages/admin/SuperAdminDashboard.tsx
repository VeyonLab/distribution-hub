import { Building2, Users, TrendingUp, Package, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tenants, users, vendorRequests, trips, getUsersByTenant, getVendorRequestsByTenant, getTripsByTenant } from '@/data/mockData';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  
  const totalTenants = tenants.length;
  const totalUsers = users.filter(u => u.role !== 'super_admin').length;
  const totalPendingRequests = vendorRequests.filter(r => r.status === 'pending').length;
  const activeTrips = trips.filter(t => t.status !== 'completed').length;

  const stats = [
    { label: 'Total Tenants', value: totalTenants, icon: Building2, color: 'bg-blue-500' },
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-emerald-500' },
    { label: 'Pending Requests', value: totalPendingRequests, icon: Package, color: 'bg-amber-500' },
    { label: 'Active Trips', value: activeTrips, icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <MobileLayout
      header={<PageHeader title="Super Admin" subtitle="System Overview" showLogout />}
    >
      <div className="space-y-6 p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="animate-slide-up">
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

        {/* Tenants List */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Tenants</h2>
          <div className="space-y-3">
            {tenants.map((tenant) => {
              const tenantUsers = getUsersByTenant(tenant.id);
              const tenantRequests = getVendorRequestsByTenant(tenant.id);
              const tenantTrips = getTripsByTenant(tenant.id);

              return (
                <Card 
                  key={tenant.id} 
                  className="animate-slide-up cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
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
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold">{tenantUsers.length}</p>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{tenantRequests.length}</p>
                        <p className="text-xs text-muted-foreground">Requests</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{tenantTrips.length}</p>
                        <p className="text-xs text-muted-foreground">Trips</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
