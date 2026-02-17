import { MapPin, Truck, ChevronRight, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useBasePath } from '@/hooks/useBasePath';
import { getTripsByBranch, getRouteById, getUserById, getVendorById } from '@/data/mockData';
import { useDriverDeliveryState } from '@/hooks/useDriverDeliveryState';

export default function ManagerDeliveryMonitoringPage() {
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();
  const basePath = useBasePath();
  const { getStopStatus } = useDriverDeliveryState();

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

  // Calculate overall stats
  const totalStops = todayTrips.reduce((sum, t) => sum + t.stops.length, 0);
  const deliveredStops = todayTrips.reduce((sum, t) => {
    return sum + t.stops.filter(s => {
      const status = getStopStatus(s.id);
      return status === 'delivered' || status === 'partial';
    }).length;
  }, 0);
  const overallProgress = totalStops > 0 ? (deliveredStops / totalStops) * 100 : 0;

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Overall Progress Card */}
      <Card className="overflow-hidden">
        <div className="bg-primary p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Today's Delivery Progress</p>
              <h2 className="text-2xl font-bold">{deliveredStops}/{totalStops} stops</h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20">
              <Truck className="h-7 w-7" />
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <Progress value={overallProgress} className="h-3" />
          <p className="mt-2 text-sm text-muted-foreground">
            {Math.round(overallProgress)}% complete
          </p>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{todayTrips.length}</p>
            <p className="text-xs text-muted-foreground">Trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{deliveredStops}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{totalStops - deliveredStops}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Trips List */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Today's Trips</h2>
        <div className="space-y-3">
          {todayTrips.map((trip) => {
            const route = getRouteById(trip.routeId);
            const driver = trip.driverId ? getUserById(trip.driverId) : null;
            const tripDelivered = trip.stops.filter(s => {
              const status = getStopStatus(s.id);
              return status === 'delivered' || status === 'partial';
            }).length;
            const tripProgress = trip.stops.length > 0 ? (tripDelivered / trip.stops.length) * 100 : 0;

            return (
              <Card 
                key={trip.id} 
                className="cursor-pointer transition-all hover:border-accent active:scale-[0.99]"
                onClick={() => navigate(`${basePath}/monitoring/${trip.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <MapPin className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{route?.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{driver?.name || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={trip.status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {/* Trip Progress */}
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{tripDelivered}/{trip.stops.length} stops</span>
                    </div>
                    <Progress value={tripProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {todayTrips.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Truck className="mb-2 h-12 w-12 text-muted-foreground/50" />
                <p className="font-medium">No trips today</p>
                <p className="text-sm text-muted-foreground">Create a trip to start monitoring</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
