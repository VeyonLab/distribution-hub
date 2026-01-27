import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Search, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getProductsByTenant } from '@/data/mockData';

export default function ManagerProductsPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!tenant) return null;

  const products = getProductsByTenant(tenant.id);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.unit.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = products.filter(p => p.status === 'active').length;
  const inactiveCount = products.filter(p => p.status === 'inactive').length;

  return (
    <div className="space-y-4 p-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {products.length} products
        </p>
        <Button size="sm" className="gap-1" onClick={() => navigate('/manager/products/add')}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-foreground">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-muted-foreground">{inactiveCount}</p>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <div className="space-y-2">
        {filteredProducts.map((product) => (
          <Card 
            key={product.id}
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.99]"
            onClick={() => navigate(`/manager/products/${product.id}`)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Package className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{product.name}</p>
                    <span className={`inline-flex h-2 w-2 rounded-full ${product.status === 'active' ? 'bg-status-success' : 'bg-muted-foreground'}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">Unit: {product.unit}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
