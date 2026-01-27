import { MapPin, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { getVendorRequestsBySalesman, getVendorById, getProductById } from '@/data/mockData';

export default function SalesmanMyRequests() {
  const { user } = useAuth();

  if (!user) return null;

  const requests = getVendorRequestsBySalesman(user.id);

  return (
    <div className="space-y-4 p-4">
      <p className="text-sm text-muted-foreground">
        {requests.length} requests created by you
      </p>

      <div className="space-y-4">
        {requests.map((request) => {
          const vendor = getVendorById(request.vendorId);

          return (
            <Card key={request.id} className="animate-slide-up">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-accent" />
                    {vendor?.name || 'Unknown Vendor'}
                  </CardTitle>
                  <StatusBadge status={request.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {vendor?.address}
                </p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-1">
                  {request.items.map((item) => {
                    const product = getProductById(item.productId);
                    return (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span>{product?.name || 'Unknown'}</span>
                        </div>
                        <span className="font-medium">
                          {item.quantity} {product?.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Created {request.createdAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          );
        })}

        {requests.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No requests yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first vendor request
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
