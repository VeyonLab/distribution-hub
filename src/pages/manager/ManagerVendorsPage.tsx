import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ChevronRight, Search, Plus, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getVendorsByBranch } from '@/data/mockData';

export default function ManagerVendorsPage() {
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  if (!tenant || !branch) return null;

  const vendors = getVendorsByBranch(branch.id);

  const filteredVendors = vendors.filter(vendor => {
    return vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           vendor.address.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4 p-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {vendors.length} vendors
        </p>
        <Button size="sm" className="gap-1" onClick={() => navigate('/manager/vendors/add')}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Vendors List */}
      <div className="space-y-2">
        {filteredVendors.map((vendor) => (
          <Card 
            key={vendor.id}
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.99]"
            onClick={() => navigate(`/manager/vendors/${vendor.id}`)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Store className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{vendor.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{vendor.address}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}

        {filteredVendors.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Store className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No vendors found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
