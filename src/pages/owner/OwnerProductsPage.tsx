import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getBranchesByTenant,
  getProductsByBranch,
  getProductsByTenant,
  getBranchById
} from '@/data/mockData';

export default function OwnerProductsPage() {
  const { tenant } = useAuth();
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!tenant) return null;

  const branches = getBranchesByTenant(tenant.id);
  const allProducts = branchFilter === 'all' 
    ? getProductsByTenant(tenant.id) 
    : getProductsByBranch(branchFilter);

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4">
      <Select value={branchFilter} onValueChange={setBranchFilter}>
        <SelectTrigger>
          <SelectValue placeholder="All Branches" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Branches</SelectItem>
          {branches.map(b => (
            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>

      <div className="space-y-2">
        {filtered.map(product => {
          const branch = getBranchById(product.branchId);
          return (
            <Card key={product.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Package className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{product.price.toLocaleString('en-IN')} per {product.unit}
                    </p>
                    {branch && <p className="text-xs text-accent">{branch.name}</p>}
                  </div>
                </div>
                <StatusBadge status={product.status} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
