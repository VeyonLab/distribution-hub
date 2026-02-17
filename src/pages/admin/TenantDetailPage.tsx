import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Package, Store, Mail, Phone, User, Calendar } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  getTenantById, 
  getUsersByTenant, 
  getVendorsByTenant, 
  getProductsByTenant,
  getBranchesByTenant
} from '@/data/mockData';

export default function TenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  const tenant = tenantId ? getTenantById(tenantId) : null;

  if (!tenant) {
    return (
      <MobileLayout
        header={<PageHeader title="Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Building2 className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Distributor not found</p>
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
  const tenantBranches = getBranchesByTenant(tenant.id);
  const owner = tenantUsers.find(u => u.role === 'tenant_owner');

  return (
    <MobileLayout
      header={
        <PageHeader 
          title={tenant.name} 
          subtitle="Distributor Details" 
          showBack
          showLogout 
        />
      }
    >
      <div className="space-y-4 p-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
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
        </div>

        {/* Owner Details */}
        {owner && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-accent" />
                Distributor Owner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <User className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{owner.name}</p>
                  <p className="text-xs text-muted-foreground">Owner / Admin</p>
                </div>
              </div>
              <div className="space-y-2 pl-1">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{owner.email}</span>
                </div>
                {owner.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{owner.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Branch Info */}
        {tenantBranches.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-accent" />
                Branches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tenantBranches.map(branch => (
                <div key={branch.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div>
                    <p className="text-sm font-medium">{branch.name}</p>
                    <p className="text-xs text-muted-foreground">{branch.address}</p>
                  </div>
                  <span className={`inline-flex h-2 w-2 rounded-full ${branch.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Registration Info */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Registered on </span>
              <span className="font-medium">{tenant.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}