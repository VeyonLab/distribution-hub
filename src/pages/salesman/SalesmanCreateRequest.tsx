import { useState } from 'react';
import { Plus, Minus, Check, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getVendorsByTenant, getProductsByTenant } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  productId: string;
  quantity: number;
}

export default function SalesmanCreateRequest() {
  const { tenant } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  if (!tenant) return null;

  const vendors = getVendorsByTenant(tenant.id);
  const products = getProductsByTenant(tenant.id);

  const updateQuantity = (productId: string, delta: number) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter(i => i.productId !== productId);
        }
        return prev.map(i => 
          i.productId === productId ? { ...i, quantity: newQty } : i
        );
      } else if (delta > 0) {
        return [...prev, { productId, quantity: delta }];
      }
      return prev;
    });
  };

  const getQuantity = (productId: string) => {
    return orderItems.find(i => i.productId === productId)?.quantity || 0;
  };

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = () => {
    if (!selectedVendor) {
      toast({
        title: 'Select Vendor',
        description: 'Please select a vendor for this request.',
        variant: 'destructive',
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: 'Add Items',
        description: 'Please add at least one item to the request.',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, this would save to backend
    toast({
      title: 'Request Created',
      description: `Order with ${totalItems} items sent successfully!`,
    });

    setSelectedVendor('');
    setOrderItems([]);
    navigate('/salesman/requests');
  };

  const selectedVendorData = vendors.find(v => v.id === selectedVendor);

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Vendor Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-accent" />
            Select Vendor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedVendor} onValueChange={setSelectedVendor}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map(vendor => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedVendorData && (
            <p className="mt-2 text-xs text-muted-foreground">
              {selectedVendorData.address}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Products List */}
      <div>
        <Label className="mb-3 block text-base font-semibold">Products</Label>
        <div className="space-y-2">
          {products.map(product => {
            const qty = getQuantity(product.id);
            return (
              <Card 
                key={product.id} 
                className={qty > 0 ? 'border-accent bg-accent/5' : ''}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, -1)}
                      disabled={qty === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{qty}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(product.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="fixed bottom-20 left-0 right-0 border-t bg-card p-4 shadow-lg">
        <Button 
          onClick={handleSubmit} 
          className="w-full gap-2"
          disabled={!selectedVendor || orderItems.length === 0}
        >
          <Check className="h-4 w-4" />
          Create Request ({totalItems} items)
        </Button>
      </div>
    </div>
  );
}
