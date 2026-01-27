import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, User, Check, Clock, Truck } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { trips, getRouteById, getUserById, getVendorById } from '@/data/mockData';
import { useDriverDeliveryState } from '@/hooks/useDriverDeliveryState';

export default function ManagerTripMonitoringDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const { getStopStatus, getDeliveryNote } = useDriverDeliveryState();

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
          <Button variant="outline" className="mt-4" onClick={() => navigate('/manager/monitoring')}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const deliveredStops = trip.stops.filter(s => {
    const status = getStopStatus(s.id);
    return status === 'delivered' || status === 'partial';
  }).length;
  const progress = trip.stops.length > 0 ? (deliveredStops / trip.stops.length) * 100 : 0;

  return (
    <MobileLayout
      header={<PageHeader title="Trip Monitoring" subtitle={tenant?.name} showBack showLogout />}
    >
      <div className="space-y-4 p-4 pb-8">
        {/* Trip Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Route</p>
                <p className="font-semibold text-lg">{route?.name}</p>
              </div>
              <StatusBadge status={trip.status} />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <User className="h-4 w-4" />
              <span>Driver: {driver?.name || 'Unassigned'}</span>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Progress</span>
                <span className="font-medium">{deliveredStops}/{trip.stops.length} stops</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Stops Status List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-accent" />
              Stop Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trip.stops.map((stop, index) => {
              const vendor = getVendorById(stop.vendorId);
              const status = getStopStatus(stop.id);
              const isDelivered = status === 'delivered' || status === 'partial';
              const note = getDeliveryNote(stop.id);

              return (
                <div 
                  key={stop.id} 
                  className={`rounded-lg border p-3 ${isDelivered ? 'bg-emerald-50 border-emerald-200' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isDelivered ? 'bg-emerald-500' : 'bg-primary'} text-sm font-medium text-primary-foreground`}>
                        {isDelivered ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{vendor?.name}</p>
                        <p className="text-xs text-muted-foreground">{vendor?.address}</p>
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  
                  {/* Show delivery note if exists */}
                  {note && (
                    <div className="mt-2 ml-11 text-sm text-muted-foreground italic">
                      Note: {note}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
