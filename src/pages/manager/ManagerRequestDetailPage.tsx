import { useParams, useNavigate } from 'react-router-dom';
import { Store, Package, MapPin, User, Calendar } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { getVendorRequestById, getVendorById, getProductById, getUserById } from '@/data/mockData';

export default function ManagerRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { tenant } = useAuth();
  const navigate = useNavigate();

  const request = requestId ? getVendorRequestById(requestId) : null;
  const vendor = request ? getVendorById(request.vendorId) : null;
  const salesman = request ? getUserById(request.salesmanId) : null;

  if (!request || request.tenantId !== tenant?.id) {
    return (
      <MobileLayout
        header={<PageHeader title="Request Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Package className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Request not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/manager/requests')}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const totalItems = request.items.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = request.items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const dateStr = new Date(request.createdAt).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <MobileLayout
      header={<PageHeader title="Request Details" subtitle={tenant?.name} showBack showLogout />}
    >
      <div className="space-y-4 p-4">
        {/* Status and Date */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={request.status} className="mt-1" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{dateStr}</p>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Info */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <Store className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vendor</p>
              <p className="font-medium">{vendor?.name || 'Unknown Vendor'}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {vendor?.address}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salesman Info */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <User className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submitted by</p>
              <p className="font-medium">{salesman?.name || 'Unknown'}</p>
              {salesman?.phone && (
                <p className="text-xs text-muted-foreground">{salesman.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                Items
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {request.items.length} products • {totalItems} items
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {request.items.map((item, index) => {
              const product = getProductById(item.productId);
              const lineTotal = product ? product.price * item.quantity : 0;
              
              return (
                <div 
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{product?.price?.toLocaleString('en-IN') || 0} per {product?.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × ₹{product?.price?.toLocaleString('en-IN') || 0}
                    </p>
                    <p className="text-base font-bold text-accent">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {/* Grand Total */}
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <span className="font-medium">Total Amount</span>
              <span className="text-lg font-bold text-accent">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
