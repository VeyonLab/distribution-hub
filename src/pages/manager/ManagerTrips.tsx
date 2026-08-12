import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, User, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { useBasePath } from '@/hooks/useBasePath';
import { 
  getTripsByBranch, 
  getRouteById, 
  getUserById
} from '@/data/mockData';

export default function ManagerTrips() {
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();
  const basePath = useBasePath();

  if (!tenant || !branch) return null;

  const trips = getTripsByBranch(branch.id);

  // Filter for today's trips
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTrips = trips.filter(t => {
    const tripDate = new Date(t.scheduledDate);
    tripDate.setHours(0, 0, 0, 0);
    return tripDate.getTime() === today.getTime();
  });

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {todayTrips.length} trip{todayTrips.length !== 1 ? 's' : ''} for today
        </p>
        <Button onClick={() => navigate(`${basePath}/trips/create`)} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Create Trip
        </Button>
      </div>

      <div className="space-y-2">
        {todayTrips.map((trip) => {
          const route = getRouteById(trip.routeId);
          const driver = trip.driverId ? getUserById(trip.driverId) : null;
          const completedStops = trip.stops.filter(s => s.deliveryStatus === 'delivered' || s.deliveryStatus === 'partial').length;

          return (
            <Card 
              key={trip.id} 
              className="cursor-pointer transition-all hover:border-accent active:scale-[0.99]"
              onClick={() => navigate(`${basePath}/trips/${trip.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <MapPin className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{route?.name || 'Unknown Route'}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {driver?.name || 'Unassigned'}
                      </span>
                      <span>{completedStops}/{trip.stops.length} stops</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={trip.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {todayTrips.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No trips for today</p>
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
