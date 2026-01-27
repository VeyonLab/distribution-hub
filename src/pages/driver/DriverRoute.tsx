import { useState } from 'react';
import { MapPin, Package, Check, Phone, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getTripsByDriver, 
  getVendorById, 
  getVendorRequestById,
  getProductById 
} from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { TripStop } from '@/types';

export default function DriverRoute() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deliveredStops, setDeliveredStops] = useState<Set<string>>(new Set());

  if (!user) return null;

  const trips = getTripsByDriver(user.id);
  const todayTrip = trips.find(t => t.status !== 'completed');

  if (!todayTrip) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <MapPin className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <p className="font-medium">No active route</p>
        <p className="text-sm text-muted-foreground">Check back later</p>
      </div>
    );
  }

  const handleMarkDelivered = (stopId: string) => {
    setDeliveredStops(prev => new Set([...prev, stopId]));
    toast({
      title: 'Marked as Delivered',
      description: 'Stop has been marked as delivered.',
    });
  };

  const getStopStatus = (stop: TripStop): 'pending' | 'delivered' => {
    if (deliveredStops.has(stop.id)) return 'delivered';
    return stop.deliveryStatus as 'pending' | 'delivered';
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      <p className="text-sm text-muted-foreground">
        {todayTrip.stops.length} stops on your route
      </p>

      <div className="space-y-4">
        {todayTrip.stops.map((stop, index) => {
          const vendor = getVendorById(stop.vendorId);
          const status = getStopStatus(stop);
          const isDelivered = status === 'delivered';

          // Get items for this stop
          const items = stop.vendorRequestIds.flatMap(reqId => {
            const request = getVendorRequestById(reqId);
            return request?.items || [];
          });

          return (
            <Card 
              key={stop.id} 
              className={`animate-slide-up overflow-hidden ${isDelivered ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isDelivered ? 'bg-status-success' : 'bg-primary'} text-sm font-medium text-primary-foreground`}>
                    {isDelivered ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{vendor?.name}</CardTitle>
                      <StatusBadge status={status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{vendor?.address}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {/* Items */}
                <div className="mb-4 space-y-1 rounded-lg bg-secondary/50 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Items to Deliver</p>
                  {items.map((item, itemIndex) => {
                    const product = getProductById(item.productId);
                    return (
                      <div 
                        key={`${item.id}-${itemIndex}`}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span>{product?.name}</span>
                        </div>
                        <span className="font-medium">
                          {item.quantity} {product?.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                {!isDelivered && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => {
                        if (vendor?.contactPhone) {
                          window.open(`tel:${vendor.contactPhone}`);
                        }
                      }}
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => {
                        if (vendor) {
                          window.open(`https://maps.google.com/?q=${vendor.latitude},${vendor.longitude}`);
                        }
                      }}
                    >
                      <Navigation className="h-4 w-4" />
                      Navigate
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleMarkDelivered(stop.id)}
                    >
                      <Check className="h-4 w-4" />
                      Delivered
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
