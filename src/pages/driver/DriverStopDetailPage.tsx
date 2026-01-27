import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Package, Phone, Navigation, Check, MessageSquare } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  getTripsByDriver, 
  getVendorById,
  getVendorRequestById,
  getProductById 
} from '@/data/mockData';
import { useDriverDeliveryState } from '@/hooks/useDriverDeliveryState';

export default function DriverStopDetailPage() {
  const { stopId } = useParams<{ stopId: string }>();
  const { user, tenant } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getStopStatus, markDelivered } = useDriverDeliveryState();
  
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const trips = getTripsByDriver(user.id);
  const todayTrip = trips.find(t => t.status !== 'completed');
  const stop = todayTrip?.stops.find(s => s.id === stopId);
  const vendor = stop ? getVendorById(stop.vendorId) : null;

  if (!stop || !vendor || !todayTrip) {
    return (
      <MobileLayout
        header={<PageHeader title="Stop Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <MapPin className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Stop not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/driver/route')}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const status = getStopStatus(stop.id);
  const isDelivered = status === 'delivered' || status === 'partial';
  const stopIndex = todayTrip.stops.findIndex(s => s.id === stopId);

  // Get items for this stop
  const stopItems: { productId: string; quantity: number; productName: string; unit: string }[] = [];
  stop.vendorRequestIds.forEach(reqId => {
    const request = getVendorRequestById(reqId);
    if (request) {
      request.items.forEach(item => {
        const product = getProductById(item.productId);
        const existing = stopItems.find(si => si.productId === item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          stopItems.push({
            productId: item.productId,
            quantity: item.quantity,
            productName: product?.name || 'Unknown',
            unit: product?.unit || '',
          });
        }
      });
    }
  });

  const handleOpenNavigation = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}&travelmode=driving`, '_blank');
  };

  const handleCall = () => {
    if (vendor.contactPhone) {
      window.open(`tel:${vendor.contactPhone}`);
    }
  };

  const handleMarkDelivered = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    markDelivered(stop.id, note || undefined);
    
    toast({
      title: 'Marked as Delivered',
      description: `Delivery to ${vendor.name} completed.`,
    });

    setIsLoading(false);
    navigate('/driver/route');
  };

  return (
    <MobileLayout
      header={<PageHeader title={`Stop ${stopIndex + 1}`} subtitle={tenant?.name} showBack showLogout />}
    >
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="flex-1 space-y-4 p-4 pb-32">
          {/* Status */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Delivery Status</p>
            <StatusBadge status={status} />
          </div>

          {/* Vendor Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <MapPin className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{vendor.name}</p>
                  <p className="text-sm text-muted-foreground">{vendor.address}</p>
                  {vendor.contactPhone && (
                    <p className="text-sm text-muted-foreground mt-1">{vendor.contactPhone}</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={handleCall} disabled={!vendor.contactPhone}>
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={handleOpenNavigation}>
                  <Navigation className="h-4 w-4" />
                  Navigate
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-accent" />
                  Items to Deliver
                </span>
                <span className="text-sm font-normal text-muted-foreground">
                  {stopItems.length} products
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stopItems.map((item, index) => (
                <div 
                  key={item.productId}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{item.quantity}</p>
                    <p className="text-xs text-muted-foreground">{item.unit}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Note */}
          {!isDelivered && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-accent" />
                  Delivery Note (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add a note (e.g., 'Left with security', 'Partial delivery - item X out of stock')"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fixed Bottom Actions */}
        {!isDelivered && (
          <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
            <div className="mx-auto max-w-md">
              <Button
                className="w-full gap-2 h-14 text-base"
                disabled={isLoading}
                onClick={handleMarkDelivered}
              >
                <Check className="h-5 w-5" />
                Mark as Delivered
              </Button>
            </div>
          </div>
        )}

        {/* Already Delivered Message */}
        {isDelivered && (
          <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
            <div className="mx-auto max-w-md text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">Delivery Completed</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
