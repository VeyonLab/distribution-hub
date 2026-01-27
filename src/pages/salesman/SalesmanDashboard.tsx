import { FileText, Store, Package, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getVendorRequestsBySalesman, getVendorsByTenant, getProductsByTenant } from '@/data/mockData';

export default function SalesmanDashboard() {
  const { user, tenant } = useAuth();
  const navigate = useNavigate();

  if (!user || !tenant) return null;

  const myRequests = getVendorRequestsBySalesman(user.id);
  const vendors = getVendorsByTenant(tenant.id);
  const products = getProductsByTenant(tenant.id);

  const pendingRequests = myRequests.filter(r => r.status === 'pending').length;
  const batchedRequests = myRequests.filter(r => r.status === 'batched').length;

  return (
    <div className="space-y-6 p-4">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-semibold">Hello, {user.name.split(' ')[0]}!</h2>
        <p className="text-sm text-muted-foreground">Ready to take orders today?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{myRequests.length}</p>
            <p className="text-sm text-muted-foreground">My Requests</p>
          </CardContent>
        </Card>
        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-4">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{batchedRequests}</p>
            <p className="text-sm text-muted-foreground">In Delivery</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3 font-semibold">Quick Actions</h3>
        <div className="space-y-3">
          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/salesman/create')}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                <Package className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-medium">Create New Request</p>
                <p className="text-sm text-muted-foreground">
                  Place order for a vendor
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/salesman/requests')}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">View My Requests</p>
                <p className="text-sm text-muted-foreground">
                  {pendingRequests} pending
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Store className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{vendors.length}</p>
              <p className="text-xs text-muted-foreground">Vendors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Package className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{products.length}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
