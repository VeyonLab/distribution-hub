import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MapPin, Package, Filter, Calendar, User, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getBranchesByTenant,
  getVendorRequestsByBranch,
  getVendorRequestsByTenant,
  getVendorById, 
  getUserById,
  getProductById,
  getBranchById
} from '@/data/mockData';

export default function OwnerRequestsPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const [branchFilter, setBranchFilter] = useState<string>('all');

  if (!tenant) return null;

  const branches = getBranchesByTenant(tenant.id);
  const allRequests = branchFilter === 'all' 
    ? getVendorRequestsByTenant(tenant.id) 
    : getVendorRequestsByBranch(branchFilter);

  const requests = allRequests.filter(r => r.status !== 'draft');

  return (
    <div className="space-y-4 p-4">
      {/* Branch Filter */}
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

      <p className="text-sm text-muted-foreground">{requests.length} request{requests.length !== 1 ? 's' : ''}</p>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-2 h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium">No requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {requests.map(request => {
            const vendor = getVendorById(request.vendorId);
            const salesman = getUserById(request.salesmanId);
            const branch = getBranchById(request.branchId);
            const totalAmount = request.items.reduce((sum, item) => {
              const product = getProductById(item.productId);
              return sum + (product ? product.price * item.quantity : 0);
            }, 0);

            return (
              <Card 
                key={request.id}
                className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
                onClick={() => navigate(`/owner/requests/${request.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{vendor?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {salesman?.name} • {request.items.length} items
                        </p>
                        {branch && (
                          <p className="text-xs text-accent">{branch.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={request.status} />
                      <p className="mt-1 text-sm font-semibold text-accent">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
