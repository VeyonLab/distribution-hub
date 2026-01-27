import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, User, Package, Calendar, Truck } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  trips,
  getRouteById, 
  getUserById, 
  getVendorById,
  getVendorRequestById,
  getProductById
} from '@/data/mockData';

export default function ManagerTripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { tenant } = useAuth();
  const navigate = useNavigate();

  const trip = trips.find(t => t.id === tripId);
  const route = trip ? getRouteById(trip.routeId) : null;
  const driver = trip?.driverId ? getUserById(trip.driverId) : null;

  if (!trip || trip.tenantId !== tenant?.id) {
    return (
      <MobileLayout
        header={<PageHeader title="Trip Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Truck className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Trip not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/manager/trips')}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const dateStr = new Date(trip.scheduledDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Calculate consolidated items across all stops
  const consolidatedItems: Record<string, { productId: string; quantity: number }> = {};
  trip.stops.forEach(stop => {
    stop.vendorRequestIds.forEach(reqId => {
      const request = getVendorRequestById(reqId);
      if (request) {
        request.items.forEach(item => {
          if (!consolidatedItems[item.productId]) {
            consolidatedItems[item.productId] = { productId: item.productId, quantity: 0 };
          }
          consolidatedItems[item.productId].quantity += item.quantity;
        });
      }
    });
  });

  const consolidatedList = Object.values(consolidatedItems).sort((a, b) => {
    const productA = getProductById(a.productId);
    const productB = getProductById(b.productId);
    return (productA?.name || '').localeCompare(productB?.name || '');
  });

  return (
    <MobileLayout
      header={<PageHeader title="Trip Details" subtitle={tenant?.name} showBack showLogout />}
    >
      <div className="space-y-4 p-4">
        {/* Status and Info */}
        <Card>
          <CardContent className="grid grid-cols-2 gap-4 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={trip.status} className="mt-1" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-medium">{dateStr}</p>
            </div>
          </CardContent>
        </Card>

        {/* Route & Driver */}
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Route</p>
                  <p className="text-sm font-medium">{route?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Driver</p>
                  <p className="text-sm font-medium">{driver?.name || 'Unassigned'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route Stops with Vendor Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                Stop Order
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {trip.stops.length} stops
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trip.stops.map((stop, index) => {
              const vendor = getVendorById(stop.vendorId);
              
              // Get items for this stop
              const stopItems: Record<string, { productId: string; quantity: number }> = {};
              stop.vendorRequestIds.forEach(reqId => {
                const request = getVendorRequestById(reqId);
                if (request) {
                  request.items.forEach(item => {
                    if (!stopItems[item.productId]) {
                      stopItems[item.productId] = { productId: item.productId, quantity: 0 };
                    }
                    stopItems[item.productId].quantity += item.quantity;
                  });
                }
              });

              return (
                <div key={stop.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{vendor?.name}</p>
                        <p className="text-xs text-muted-foreground">{vendor?.address}</p>
                      </div>
                    </div>
                    <StatusBadge status={stop.deliveryStatus} />
                  </div>
                  
                  {/* Items for this stop */}
                  <div className="mt-2 space-y-1 border-t pt-2">
                    {Object.values(stopItems).map((item) => {
                      const product = getProductById(item.productId);
                      return (
                        <div key={item.productId} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{product?.name}</span>
                          <span className="font-medium">{item.quantity} {product?.unit}</span>
                        </div>
                      );
                    })}
                    {Object.keys(stopItems).length === 0 && (
                      <p className="text-xs text-muted-foreground">No items</p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Consolidated Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                Total Items to Load
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {consolidatedList.length} products
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {consolidatedList.map((item, index) => {
              const product = getProductById(item.productId);
              
              return (
                <div 
                  key={item.productId}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product?.name}</p>
                      <p className="text-xs text-muted-foreground">{product?.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-accent">{item.quantity}</p>
                    <p className="text-xs text-muted-foreground">{product?.unit}</p>
                  </div>
                </div>
              );
            })}

            {consolidatedList.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No items in this trip
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
