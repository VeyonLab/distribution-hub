import { MapPin, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getVendorRequestsByTenant, 
  getVendorById, 
  getUserById,
  getProductById 
} from '@/data/mockData';

export default function ManagerRequests() {
  const { tenant } = useAuth();

  if (!tenant) return null;

  const requests = getVendorRequestsByTenant(tenant.id);

  // Group requests by vendor
  const groupedRequests = requests.reduce((acc, req) => {
    const vendor = getVendorById(req.vendorId);
    if (!vendor) return acc;
    
    if (!acc[vendor.id]) {
      acc[vendor.id] = {
        vendor,
        requests: [],
      };
    }
    acc[vendor.id].requests.push(req);
    return acc;
  }, {} as Record<string, { vendor: typeof requests[0] extends { vendorId: string } ? ReturnType<typeof getVendorById> : never; requests: typeof requests }>);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {requests.length} requests from {Object.keys(groupedRequests).length} vendors
        </p>
      </div>

      <div className="space-y-4">
        {Object.values(groupedRequests).map(({ vendor, requests: vendorReqs }) => {
          if (!vendor) return null;
          
          return (
            <Card key={vendor.id} className="animate-slide-up overflow-hidden">
              <CardHeader className="bg-secondary/50 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4 text-accent" />
                  {vendor.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{vendor.address}</p>
              </CardHeader>
              <CardContent className="divide-y pt-0">
                {vendorReqs.map((req) => {
                  const salesman = getUserById(req.salesmanId);
                  
                  return (
                    <div key={req.id} className="py-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          by {salesman?.name || 'Unknown'}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <div className="space-y-1">
                        {req.items.map((item) => {
                          const product = getProductById(item.productId);
                          return (
                            <div 
                              key={item.id} 
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <Package className="h-3 w-3 text-muted-foreground" />
                                <span>{product?.name || 'Unknown Product'}</span>
                              </div>
                              <span className="font-medium">
                                {item.quantity} {product?.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
