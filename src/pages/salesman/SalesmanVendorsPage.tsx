import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ChevronRight, Search, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSalesman } from '@/contexts/SalesmanContext';
import { getVendorsByBranch } from '@/data/mockData';
import { getVendorDues } from '@/data/salesmanMockData';

export default function SalesmanVendorsPage() {
  const { branch } = useAuth();
  const { visits } = useSalesman();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  if (!branch) return null;

  const vendors = getVendorsByBranch(branch.id);
  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visitedIds = new Set(visits.map(v => v.vendorId));

  return (
    <div className="space-y-4 p-4 pb-20">
      <div>
        <h2 className="text-lg font-semibold">Today's Beat</h2>
        <p className="text-sm text-muted-foreground">{vendors.length} outlets · {visitedIds.size} visited</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search outlets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((vendor) => {
          const dues = getVendorDues(vendor.id);
          const visited = visitedIds.has(vendor.id);
          return (
            <Card
              key={vendor.id}
              className="cursor-pointer transition-all hover:border-accent active:scale-[0.99]"
              onClick={() => navigate(`/salesman/vendors/${vendor.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Store className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{vendor.name}</p>
                      {visited && <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{vendor.address}</span>
                    </div>
                    {dues > 0 && (
                      <Badge variant="destructive" className="mt-1 text-[10px] gap-1">
                        <AlertCircle className="h-2.5 w-2.5" /> Dues ₹{dues.toLocaleString('en-IN')}
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Store className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No outlets found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
