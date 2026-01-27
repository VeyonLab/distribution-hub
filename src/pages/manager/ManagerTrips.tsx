import { Plus, MapPin, User, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getTripsByTenant, 
  getRouteById, 
  getUserById,
  getVendorById
} from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function ManagerTrips() {
  const { tenant } = useAuth();
  const { toast } = useToast();

  if (!tenant) return null;

  const trips = getTripsByTenant(tenant.id);

  const handleCreateTrip = () => {
    toast({
      title: 'Create Trip',
      description: 'Trip creation form would open here. This is a UI-only demo.',
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {trips.length} trips scheduled
        </p>
        <Button onClick={handleCreateTrip} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Create Trip
        </Button>
      </div>

      <div className="space-y-4">
        {trips.map((trip) => {
          const route = getRouteById(trip.routeId);
          const driver = getUserById(trip.driverId);
          const completedStops = trip.stops.filter(s => s.deliveryStatus === 'delivered').length;

          return (
            <Card key={trip.id} className="animate-slide-up overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{route?.name || 'Unknown Route'}</CardTitle>
                  <StatusBadge status={trip.status} />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {driver?.name || 'Unassigned'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {trip.scheduledDate.toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{completedStops}/{trip.stops.length} stops</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div 
                      className="h-full bg-accent transition-all"
                      style={{ width: `${(completedStops / trip.stops.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Stops list */}
                <div className="space-y-2">
                  {trip.stops.map((stop, index) => {
                    const vendor = getVendorById(stop.vendorId);
                    return (
                      <div 
                        key={stop.id}
                        className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{vendor?.name}</p>
                          <p className="text-xs text-muted-foreground">{vendor?.address}</p>
                        </div>
                        <StatusBadge status={stop.deliveryStatus} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {trips.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No trips scheduled</p>
              <p className="text-sm text-muted-foreground">
                Create a new trip to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
