import { useState } from 'react';
import { Store, Search, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getBranchesByTenant,
  getVendorsByBranch,
  getVendorsByTenant,
  getBranchById
} from '@/data/mockData';

export default function OwnerVendorsPage() {
  const { tenant } = useAuth();
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!tenant) return null;

  const branches = getBranchesByTenant(tenant.id);
  const allVendors = branchFilter === 'all' 
    ? getVendorsByTenant(tenant.id) 
    : getVendorsByBranch(branchFilter);

  const filtered = allVendors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.address.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Input placeholder="Search vendors..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} vendor{filtered.length !== 1 ? 's' : ''}</p>

      <div className="space-y-2">
        {filtered.map(vendor => {
          const branch = getBranchById(vendor.branchId);
          return (
            <Card key={vendor.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Store className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {vendor.address}
                    </div>
                    {branch && <p className="text-xs text-accent">{branch.name}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
