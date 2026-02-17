import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, MapPin, User, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getBranchesByTenant,
  getTripsByBranch,
  getTripsByTenant,
  getRouteById, 
  getUserById,
  getBranchById
} from '@/data/mockData';

export default function OwnerTripsPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
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

      <p className="text-sm text-muted-foreground">{todayTrips.length} trip{todayTrips.length !== 1 ? 's' : ''} today</p>

      {todayTrips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Truck className="mb-2 h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium">No trips scheduled</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {todayTrips.map(trip => {
            const route = getRouteById(trip.routeId);
            const driver = trip.driverId ? getUserById(trip.driverId) : null;
            const branch = getBranchById(trip.branchId);
            const completedStops = trip.stops.filter(s => s.deliveryStatus === 'delivered' || s.deliveryStatus === 'partial').length;

            return (
              <Card key={trip.id} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{route?.name || 'Unknown Route'}</p>
                      <p className="text-xs text-muted-foreground">
                        {driver?.name || 'Unassigned'} • {completedStops}/{trip.stops.length} stops
                      </p>
                      {branch && (
                        <p className="text-xs text-accent">{branch.name}</p>
                      )}
                    </div>
                    <StatusBadge status={trip.status} />
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
