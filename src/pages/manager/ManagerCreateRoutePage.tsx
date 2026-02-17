import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route as RouteIcon, Save, MapPin, GripVertical, ArrowUp, ArrowDown, Plus, X } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getVendorsByBranch, getVendorById } from '@/data/mockData';

export default function ManagerCreateRoutePage() {
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (!tenant || !branch) return null;

  const allVendors = getVendorsByBranch(branch.id);
  const availableVendors = allVendors.filter(v => !selectedVendorIds.includes(v.id));

  const toggleVendor = (vendorId: string) => {
    if (selectedVendorIds.includes(vendorId)) {
      setSelectedVendorIds(selectedVendorIds.filter(id => id !== vendorId));
    } else {
      setSelectedVendorIds([...selectedVendorIds, vendorId]);
    }
  };

  const removeVendor = (vendorId: string) => {
    setSelectedVendorIds(selectedVendorIds.filter(id => id !== vendorId));
  };

  const moveStop = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= selectedVendorIds.length) return;
    
    const newOrder = [...selectedVendorIds];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setSelectedVendorIds(newOrder);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a route name.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedVendorIds.length < 2) {
      toast({
        title: 'Not Enough Stops',
        description: 'Please select at least 2 vendors for the route.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    toast({
      title: 'Route Created',
      description: `${name} has been created with ${selectedVendorIds.length} stops. (UI demo only)`,
    });

    setIsLoading(false);
    navigate('/manager/routes');
  };

  return (
    <MobileLayout
      header={<PageHeader title="Create Route" subtitle={tenant.name} showBack showLogout />}
    >
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route Name */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <RouteIcon className="h-4 w-4 text-accent" />
                Route Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Route C - East"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Stops (Reorderable) */}
          {selectedVendorIds.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    Stop Order
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {selectedVendorIds.length} stops
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedVendorIds.map((vendorId, index) => {
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
                      <div className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </div>

                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{vendor.name}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === 0}
                          onClick={() => moveStop(index, index - 1)}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === selectedVendorIds.length - 1}
                          onClick={() => moveStop(index, index + 1)}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeVendor(vendorId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Available Vendors */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4 text-accent" />
                Add Vendors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableVendors.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  All vendors have been added to the route
                </p>
              ) : (
                availableVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => toggleVendor(vendor.id)}
                  >
                    <Checkbox
                      checked={selectedVendorIds.includes(vendor.id)}
                      onCheckedChange={() => toggleVendor(vendor.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{vendor.address}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={isLoading || !name.trim() || selectedVendorIds.length < 2}
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Creating Route...' : 'Create Route'}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}
