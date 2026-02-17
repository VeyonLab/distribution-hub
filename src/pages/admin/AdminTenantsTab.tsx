import { Building2, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tenants, users, getUsersByTenant } from '@/data/mockData';

export default function AdminTenantsTab() {
  const navigate = useNavigate();
  
  const totalTenants = tenants.length;
  const totalUsers = users.filter(u => u.role !== 'super_admin').length;

  const stats = [
    { label: 'Total Distributors', value: totalTenants, icon: Building2, color: 'bg-blue-500' },
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-emerald-500' },
  ];

  return (
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

      {/* Distributors List */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Distributors</h2>
        <div className="space-y-3">
          {tenants.map((tenant) => {
            const tenantUsers = getUsersByTenant(tenant.id);
            const owner = tenantUsers.find(u => u.role === 'tenant_owner');

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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {tenantUsers.length} users
                    </span>
                    {owner && (
                      <span className="text-muted-foreground">
                        Owner: {owner.name}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}