import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Package, Store, ChevronDown, ChevronUp } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  getRoutesByBranch,
  getUsersByBranch,
  getVendorRequestsByBranch,
  getVendorById,
  getProductById,
  getUserById
} from '@/data/mockData';

export default function ManagerCreateTripPage() {
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set());
  const [showRequestSelector, setShowRequestSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const routes = branch ? getRoutesByBranch(branch.id) : [];
  const drivers = branch ? getUsersByBranch(branch.id).filter(u => u.role === 'driver' && u.status === 'active') : [];
  const availableRequests = branch ? getVendorRequestsByBranch(branch.id).filter(
    r => r.status === 'pending' || r.status === 'batched'
  ) : [];

  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  // Group requests by vendor for the summary
  const vendorBreakdown = useMemo(() => {
    const breakdown: Record<string, { 
      vendorId: string; 
      vendorName: string;
      requestIds: string[];
      items: Record<string, { productId: string; quantity: number }>;
    }> = {};

    availableRequests
      .filter(req => selectedRequestIds.has(req.id))
      .forEach(req => {
        const vendor = getVendorById(req.vendorId);
        if (!vendor) return;

        if (!breakdown[vendor.id]) {
          breakdown[vendor.id] = {
            vendorId: vendor.id,
            vendorName: vendor.name,
            requestIds: [],
            items: {},
          };
        }
        breakdown[vendor.id].requestIds.push(req.id);

        req.items.forEach(item => {
          if (!breakdown[vendor.id].items[item.productId]) {
            breakdown[vendor.id].items[item.productId] = { productId: item.productId, quantity: 0 };
          }
          breakdown[vendor.id].items[item.productId].quantity += item.quantity;
        });
      });

    return Object.values(breakdown);
  }, [availableRequests, selectedRequestIds]);

  // Consolidated items
  const consolidatedItems = useMemo(() => {
    const totals: Record<string, { productId: string; quantity: number }> = {};

    vendorBreakdown.forEach(vendor => {
      Object.values(vendor.items).forEach(item => {
        if (!totals[item.productId]) {
          totals[item.productId] = { productId: item.productId, quantity: 0 };
        }
        totals[item.productId].quantity += item.quantity;
      });
    });

    return Object.values(totals).sort((a, b) => {
      const productA = getProductById(a.productId);
      const productB = getProductById(b.productId);
      return (productA?.name || '').localeCompare(productB?.name || '');
    });
  }, [vendorBreakdown]);

  if (!tenant) return null;

  const toggleRequest = (requestId: string) => {
    const newSet = new Set(selectedRequestIds);
    if (newSet.has(requestId)) {
      newSet.delete(requestId);
    } else {
      newSet.add(requestId);
    }
    setSelectedRequestIds(newSet);
  };

  const handleSaveDraft = async () => {
    if (!selectedRouteId) {
      toast({ title: 'Select Route', description: 'Please select a route first.', variant: 'destructive' });
      return;
    }
    if (selectedRequestIds.size === 0) {
      toast({ title: 'Select Requests', description: 'Please select at least one request.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({ title: 'Draft Saved', description: 'Trip saved as draft. (UI demo only)' });
    setIsLoading(false);
    navigate('/manager/trips');
  };

  const handleCreateTrip = async () => {
    if (!selectedRouteId) {
      toast({ title: 'Select Route', description: 'Please select a route first.', variant: 'destructive' });
      return;
    }
    if (!selectedDriverId) {
      toast({ title: 'Assign Driver', description: 'Please assign a driver to schedule the trip.', variant: 'destructive' });
      return;
    }
    if (selectedRequestIds.size === 0) {
      toast({ title: 'Select Requests', description: 'Please select at least one request.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast({ title: 'Trip Created', description: 'Trip has been scheduled and assigned. (UI demo only)' });
    setIsLoading(false);
    navigate('/manager/trips');
  };

  return (
    <MobileLayout
      header={<PageHeader title="Create Trip" subtitle={tenant?.name} showBack showLogout />}
    >
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="flex-1 space-y-4 p-4 pb-32">
          {/* Route Selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-accent" />
                Select Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a route..." />
                </SelectTrigger>
                <SelectContent>
                  {routes.map(route => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name} ({route.vendorIds.length} stops)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Driver Assignment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-accent" />
                Assign Driver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver (optional for draft)..." />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Request Selection */}
          <Card>
            <CardHeader 
              className="cursor-pointer pb-2"
              onClick={() => setShowRequestSelector(!showRequestSelector)}
            >
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-accent" />
                  Include Requests
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-normal text-muted-foreground">
                    {selectedRequestIds.size} selected
                  </span>
                  {showRequestSelector ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            {showRequestSelector && (
              <CardContent className="space-y-2 pt-0">
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {availableRequests.map((request) => {
                    const vendor = getVendorById(request.vendorId);
                    const salesman = getUserById(request.salesmanId);
                    const isSelected = selectedRequestIds.has(request.id);
                    const itemCount = request.items.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                      <div 
                        key={request.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                          isSelected ? 'border-accent bg-accent/5' : 'hover:bg-secondary/50'
                        }`}
                        onClick={() => toggleRequest(request.id)}
                      >
                        <Checkbox 
                          checked={isSelected} 
                          onCheckedChange={() => toggleRequest(request.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{vendor?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            by {salesman?.name} • {itemCount} items
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {availableRequests.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No pending requests available
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Vendor Breakdown Summary */}
          {vendorBreakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-accent" />
                    Vendor Breakdown
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {vendorBreakdown.length} vendors
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vendorBreakdown.map((vendor) => (
                  <div key={vendor.vendorId} className="rounded-lg border p-3">
                    <p className="font-medium mb-2">{vendor.vendorName}</p>
                    <div className="space-y-1">
                      {Object.values(vendor.items).map((item) => {
                        const product = getProductById(item.productId);
                        return (
                          <div key={item.productId} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{product?.name}</span>
                            <span className="font-medium">{item.quantity} {product?.unit}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Consolidated Items Snapshot */}
          {consolidatedItems.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-accent" />
                    Total to Load
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {consolidatedItems.length} products
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {consolidatedItems.map((item, index) => {
                  const product = getProductById(item.productId);
                  
                  return (
                    <div 
                      key={item.productId}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product?.name}</p>
                          <p className="text-xs text-muted-foreground">{product?.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-accent">{item.quantity}</p>
                        <p className="text-xs text-muted-foreground">{product?.unit}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fixed Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
          <div className="mx-auto max-w-md space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="gap-2"
                disabled={isLoading}
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
              <Button
                className="gap-2"
                disabled={isLoading}
                onClick={handleCreateTrip}
              >
                Schedule Trip
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
