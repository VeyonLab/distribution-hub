import { useState } from 'react';
import { MapPin, Truck, ChevronRight, User, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getBranchesByTenant,
  getTripsByBranch, 
  getTripsByTenant,
  getRouteById, 
  getUserById, 
  getVendorById,
  getBranchById
} from '@/data/mockData';

export default function OwnerMonitoringPage() {
  const { tenant } = useAuth();
  const [branchFilter, setBranchFilter] = useState<string>('all');

  if (!tenant) return null;

  const branches = getBranchesByTenant(tenant.id);
  const allTrips = branchFilter === 'all' 
    ? getTripsByTenant(tenant.id) 
    : getTripsByBranch(branchFilter);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTrips = allTrips.filter(t => {
    const tripDate = new Date(t.scheduledDate);
    tripDate.setHours(0, 0, 0, 0);
    return tripDate.getTime() === today.getTime();
  });

  const activeTrips = todayTrips.filter(t => t.status === 'in_progress' || t.status === 'scheduled');

  return (
    <div className="space-y-4 p-4">
      <Select value={branchFilter} onValueChange={setBranchFilter}>
        <SelectTrigger>
          <SelectValue placeholder="All Branches" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Branches</SelectItem>
          {branches.map(b => (
            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{todayTrips.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-accent">{activeTrips.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{todayTrips.filter(t => t.status === 'completed').length}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Trip Cards */}
      {todayTrips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Truck className="mb-2 h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium">No trips to monitor</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {todayTrips.map(trip => {
            const route = getRouteById(trip.routeId);
            const driver = trip.driverId ? getUserById(trip.driverId) : null;
            const branch = getBranchById(trip.branchId);
            const completedStops = trip.stops.filter(s => s.deliveryStatus === 'delivered' || s.deliveryStatus === 'partial').length;
            const progress = (completedStops / trip.stops.length) * 100;

            return (
              <Card key={trip.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{route?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        <User className="mr-1 inline h-3 w-3" />
                        {driver?.name || 'Unassigned'}
                      </p>
                      {branch && <p className="text-xs text-accent">{branch.name}</p>}
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{completedStops}/{trip.stops.length} stops</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
