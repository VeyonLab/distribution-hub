import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Save } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useBasePath } from '@/hooks/useBasePath';
import { useToast } from '@/hooks/use-toast';

export default function ManagerAddProductPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const basePath = useBasePath();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      title: 'Product Added',
      description: `${name} has been added. (UI demo only)`,
    });

    setIsLoading(false);
    navigate(`${basePath}/products`);
  };

  if (!tenant) return null;

  return (
    <MobileLayout
      header={<PageHeader title="Add Product" subtitle={tenant.name} showBack showLogout />}
    >
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
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
            {isLoading ? 'Adding Product...' : 'Add Product'}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}
