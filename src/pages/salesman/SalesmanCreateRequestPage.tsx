import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, Package, Plus, Minus, Trash2, Save, Send } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getVendorById, getProductsByBranch, getProductById } from '@/data/mockData';
import { Product } from '@/types';

interface CartItem {
  productId: string;
  quantity: number;
}

export default function SalesmanCreateRequestPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { user, tenant, branch } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const vendor = vendorId ? getVendorById(vendorId) : null;
  const allProducts = branch ? getProductsByBranch(branch.id).filter(p => p.status === 'active') : [];

  if (!vendor || vendor.tenantId !== tenant?.id) {
    return (
      <MobileLayout
        header={<PageHeader title="Vendor Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Store className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Vendor not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/salesman/vendors')}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const addProduct = (productId: string) => {
    const existing = cartItems.find(item => item.productId === productId);
    if (existing) {
      setCartItems(cartItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { productId, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter(item => item.productId !== productId));
    } else {
      setCartItems(cartItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeProduct = (productId: string) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };

  const getCartItemQuantity = (productId: string): number => {
    return cartItems.find(item => item.productId === productId)?.quantity || 0;
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate line item total (price × quantity)
  const getLineTotal = (productId: string, quantity: number): number => {
    const product = getProductById(productId);
    return product ? product.price * quantity : 0;
  };

  // Calculate grand total
  const grandTotal = cartItems.reduce((sum, item) => sum + getLineTotal(item.productId, item.quantity), 0);

  const handleSaveDraft = async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Empty Request',
        description: 'Please add at least one product.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({
      title: 'Draft Saved',
      description: 'Your request has been saved as a draft. (UI demo only)',
    });

    setIsLoading(false);
    navigate('/salesman/requests');
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Empty Request',
        description: 'Please add at least one product.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast({
      title: 'Request Submitted',
      description: `Request for ${vendor.name} has been submitted. (UI demo only)`,
    });

    setIsLoading(false);
    navigate('/salesman/requests');
  };

  return (
    <MobileLayout
      header={<PageHeader title="Create Request" subtitle={vendor.name} showBack showLogout />}
    >
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="flex-1 space-y-4 p-4 pb-32">
          {/* Vendor Info */}
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Store className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-medium">{vendor.name}</p>
                <p className="text-xs text-muted-foreground">{vendor.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Cart Summary */}
          {cartItems.length > 0 && (
            <Card className="border-accent">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>Selected Products</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {cartItems.length} products • {totalItems} items
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cartItems.map((item) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;

                  return (
                    <div key={item.productId} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{product.price.toLocaleString('en-IN')} × {item.quantity} = <span className="text-accent font-semibold">₹{getLineTotal(item.productId, item.quantity).toLocaleString('en-IN')}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                          className="h-8 w-16 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeProduct(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {/* Grand Total */}
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-lg font-bold text-accent">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Picker */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-accent" />
                Add Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {allProducts.map((product) => {
                const inCart = getCartItemQuantity(product.id) > 0;
                
                return (
                  <div 
                    key={product.id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      inCart ? 'border-accent bg-accent/5' : 'hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.unit} • <span className="font-medium">₹{product.price.toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                    {inCart ? (
                      <span className="text-xs font-medium text-accent">
                        Added ({getCartItemQuantity(product.id)})
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => addProduct(product.id)}
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
          <div className="mx-auto max-w-md space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="gap-2"
                disabled={isLoading || cartItems.length === 0}
                onClick={handleSaveDraft}
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button
                className="gap-2"
                disabled={isLoading || cartItems.length === 0}
                onClick={handleSubmit}
              >
                <Send className="h-4 w-4" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
