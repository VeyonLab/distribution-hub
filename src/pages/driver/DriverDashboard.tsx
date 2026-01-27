import { Truck, MapPin, Package, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { getTripsByDriver, getRouteById, getVendorById } from '@/data/mockData';

export default function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const trips = getTripsByDriver(user.id);
  const todayTrip = trips.find(t => t.status !== 'completed');

  if (!todayTrip) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Truck className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">No Trips Today</h2>
        <p className="text-muted-foreground">
          You don't have any trips scheduled for today.
        </p>
      </div>
    );
  }

  const route = getRouteById(todayTrip.routeId);
  const completedStops = todayTrip.stops.filter(s => s.deliveryStatus === 'delivered').length;
  const totalStops = todayTrip.stops.length;
  const progress = (completedStops / totalStops) * 100;

  return (
    <div className="space-y-6 p-4">
      {/* Trip Card */}
      <Card className="overflow-hidden">
        <div className="bg-primary p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Today's Route</p>
              <h2 className="text-xl font-bold">{route?.name}</h2>
            </div>
            <StatusBadge status={todayTrip.status} />
          </div>
        </div>
        <CardContent className="p-4">
          {/* Progress */}
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Progress</span>
              <span className="font-medium">{completedStops}/{totalStops} stops</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <div 
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-accent">{totalStops}</p>
              <p className="text-xs text-muted-foreground">Total Stops</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{completedStops}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{totalStops - completedStops}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action */}
      <Button 
        onClick={() => navigate('/driver/route')} 
        className="w-full gap-2"
        size="lg"
      >
        <MapPin className="h-5 w-5" />
        View Route Details
      </Button>

      {/* Next Stop Preview */}
      {todayTrip.stops.find(s => s.deliveryStatus === 'pending') && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Next Stop</p>
            {(() => {
              const nextStop = todayTrip.stops.find(s => s.deliveryStatus === 'pending');
              const vendor = nextStop ? getVendorById(nextStop.vendorId) : null;
              return vendor ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    <p className="text-sm text-muted-foreground">{vendor.address}</p>
                  </div>
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
