import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building2, Shield, CheckCircle, XCircle } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserById, getTenantById } from '@/data/mockData';
import { UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  tenant_owner: 'Distributor Admin',
  manager: 'Manager',
  salesman: 'Salesman',
  driver: 'Driver',
};

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const user = userId ? getUserById(userId) : null;
  const tenant = user?.tenantId ? getTenantById(user.tenantId) : null;

  if (!user) {
    return (
      <MobileLayout
        header={<PageHeader title="User Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <User className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">User not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/users')}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const handleToggleStatus = () => {
    toast({
      title: user.status === 'active' ? 'User Deactivated' : 'User Activated',
      description: `${user.name}'s status has been updated. (UI demo only)`,
    });
  };

  return (
    <MobileLayout
      header={<PageHeader title="User Details" showBack showLogout />}
    >
      <div className="space-y-4 p-4">
        {/* User Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <User className="h-10 w-10 text-secondary-foreground" />
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-status-success' : 'bg-muted-foreground'}`} />
                <span className="text-sm capitalize text-muted-foreground">{user.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            
            {user.phone && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role & Tenant */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Role & Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="font-medium">{roleLabels[user.role]}</p>
              </div>
            </div>
            
            {tenant && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tenant</p>
                  <p className="font-medium">{tenant.name}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            variant={user.status === 'active' ? 'destructive' : 'default'}
            className="w-full gap-2"
            onClick={handleToggleStatus}
          >
            {user.status === 'active' ? (
              <>
                <XCircle className="h-4 w-4" />
                Deactivate User
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Activate User
              </>
            )}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
