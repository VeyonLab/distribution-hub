import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Route as RouteIcon, MapPin, GripVertical, ArrowUp, ArrowDown, Edit, Store } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getRouteById, getVendorById } from '@/data/mockData';

export default function ManagerRouteDetailPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const route = routeId ? getRouteById(routeId) : null;
  
  const [vendorIds, setVendorIds] = useState<string[]>(route?.vendorIds || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  if (!route || route.tenantId !== tenant?.id) {
    return (
      <MobileLayout
        header={<PageHeader title="Route Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <RouteIcon className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Route not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/manager/routes')}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const moveStop = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= vendorIds.length) return;
    
    const newOrder = [...vendorIds];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setVendorIds(newOrder);
    setHasChanges(true);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    moveStop(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
      title: 'Route Updated',
      description: 'Stop order has been saved. (UI demo only)',
    });
    setHasChanges(false);
  };

  return (
    <MobileLayout
      header={<PageHeader title="Route Details" subtitle={tenant?.name} showBack showLogout />}
    >
      <div className="space-y-4 p-4">
        {/* Route Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                <RouteIcon className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{route.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {vendorIds.length} vendor stops
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ordered Stops */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                Vendor Stops
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                Drag or use arrows to reorder
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {vendorIds.map((vendorId, index) => {
              const vendor = getVendorById(vendorId);
              if (!vendor) return null;

              return (
                <div
                  key={vendorId}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-2 rounded-lg border bg-card p-3 transition-all ${
                    draggedIndex === index ? 'opacity-50 ring-2 ring-accent' : ''
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Stop Number */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {index + 1}
                  </div>

                  {/* Vendor Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{vendor.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{vendor.address}</p>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === 0}
                      onClick={() => moveStop(index, index - 1)}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={index === vendorIds.length - 1}
                      onClick={() => moveStop(index, index + 1)}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Save Button (shows when changes made) */}
        {hasChanges && (
          <Button className="w-full" onClick={handleSave}>
            Save Changes
          </Button>
        )}

        {/* Edit Route Button */}
        <Button 
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate(`/manager/routes/${route.id}/edit`)}
        >
          <Edit className="h-4 w-4" />
          Edit Route
        </Button>
      </div>
    </MobileLayout>
  );
}
