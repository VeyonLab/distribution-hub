import { MapPin, Check, ChevronRight, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { getTripsByDriver, getRouteById, getVendorById } from '@/data/mockData';
import { useDriverDeliveryState } from '@/hooks/useDriverDeliveryState';

export default function DriverRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getStopStatus } = useDriverDeliveryState();

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

  const route = getRouteById(todayTrip.routeId);

  const handleOpenInMaps = () => {
    // Build waypoints URL for Google Maps
    const waypoints = todayTrip.stops
      .map(stop => {
        const vendor = getVendorById(stop.vendorId);
        return vendor ? `${vendor.latitude},${vendor.longitude}` : null;
      })
      .filter(Boolean);

    if (waypoints.length > 0) {
      const origin = waypoints[0];
      const destination = waypoints[waypoints.length - 1];
      const waypointsMiddle = waypoints.slice(1, -1).join('|');
      
      let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
      if (waypointsMiddle) {
        url += `&waypoints=${waypointsMiddle}`;
      }
      url += '&travelmode=driving';
      
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Route Header */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-muted-foreground">Route</p>
            <p className="font-semibold">{route?.name}</p>
            <p className="text-sm text-muted-foreground">{todayTrip.stops.length} stops</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleOpenInMaps}>
            <Navigation className="h-4 w-4" />
            Open in Maps
          </Button>
        </CardContent>
      </Card>

      {/* Stops List */}
      <div className="space-y-2">
        {todayTrip.stops.map((stop, index) => {
          const vendor = getVendorById(stop.vendorId);
          const status = getStopStatus(stop.id);
          const isDelivered = status === 'delivered' || status === 'partial';

          return (
            <Card 
              key={stop.id} 
              className={`cursor-pointer transition-all hover:border-accent active:scale-[0.99] ${isDelivered ? 'opacity-60' : ''}`}
              onClick={() => navigate(`/driver/stop/${stop.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isDelivered ? 'bg-emerald-500' : 'bg-primary'} text-sm font-medium text-primary-foreground`}>
                    {isDelivered ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{vendor?.name}</p>
                    <p className="text-xs text-muted-foreground">{vendor?.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
