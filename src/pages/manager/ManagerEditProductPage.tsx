import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useBasePath } from '@/hooks/useBasePath';
import { useToast } from '@/hooks/use-toast';
import { getProductById } from '@/data/mockData';

export default function ManagerEditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const basePath = useBasePath();
  const { toast } = useToast();

  const product = productId ? getProductById(productId) : null;

  const [name, setName] = useState(product?.name || '');
  const [unit, setUnit] = useState(product?.unit || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(product?.status || 'active');
  const [isLoading, setIsLoading] = useState(false);

  if (!product || product.tenantId !== tenant?.id) {
    return (
      <MobileLayout
        header={<PageHeader title="Product Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Package className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Product not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(`${basePath}/products`)}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !unit.trim() || !price.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter name, unit, and price.',
        variant: 'destructive',
      });
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    toast({
      title: 'Product Updated',
      description: `${name} has been updated. (UI demo only)`,
    });

    setIsLoading(false);
    navigate(`${basePath}/products`);
  };

  const handleToggleStatus = () => {
    const newStatus = status === 'active' ? 'inactive' : 'active';
    setStatus(newStatus);
    toast({
      title: newStatus === 'active' ? 'Product Activated' : 'Product Deactivated',
      description: `${name} is now ${newStatus}. (UI demo only)`,
    });
  };

  return (
    <MobileLayout
      header={<PageHeader title="Edit Product" subtitle={tenant?.name} showBack showLogout />}
    >
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Toggle */}
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">Product Status</p>
                <p className="text-sm text-muted-foreground">
                  {status === 'active' ? 'Product is active and visible' : 'Product is inactive and hidden'}
                </p>
              </div>
              <Button
                type="button"
                variant={status === 'active' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={handleToggleStatus}
              >
                {status === 'active' ? (
                  <>
                    <ToggleRight className="h-4 w-4" />
                    Active
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-4 w-4" />
                    Inactive
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Product Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-accent" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Rice 25kg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="e.g., bags, packs, cans"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="h-12"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The measurement unit for this product
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 250"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-12"
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Price per unit in rupees
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={isLoading || !name.trim() || !unit.trim() || !price.trim()}
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}
