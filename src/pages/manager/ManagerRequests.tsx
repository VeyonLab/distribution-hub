import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, Filter, Calendar, User, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getVendorRequestsByBranch, 
  getVendorById, 
  getUserById,
  getUsersByBranch,
  getProductById
} from '@/data/mockData';

export default function ManagerRequests() {
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();
  
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [salesmanFilter, setSalesmanFilter] = useState<string>('all');

  if (!tenant || !branch) return null;

  const allRequests = getVendorRequestsByBranch(branch.id);
  const salesmen = getUsersByBranch(branch.id).filter(u => u.role === 'salesman');

  // Filter requests (exclude drafts - only show submitted)
  const filteredRequests = useMemo(() => {
    return allRequests.filter(req => {
      // Only show submitted requests (not drafts)
      if (req.status === 'draft') return false;

      // Date filter
      const reqDate = new Date(req.createdAt);
      reqDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today' && reqDate.getTime() !== today.getTime()) {
        return false;
      }
      if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (reqDate < weekAgo) return false;
      }

      // Salesman filter
      if (salesmanFilter !== 'all' && req.salesmanId !== salesmanFilter) {
        return false;
      }

      return true;
    });
  }, [allRequests, dateFilter, salesmanFilter]);

  // Sort by date, newest first
  const sortedRequests = [...filteredRequests].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4 p-4">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/manager/requests/consolidated')}
        >
          View Consolidated
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2">
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
          <SelectTrigger>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Salesmen</SelectItem>
            {salesmen.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-2">
        {sortedRequests.map((request) => {
          const vendor = getVendorById(request.vendorId);
          const salesman = getUserById(request.salesmanId);
          const totalItems = request.items.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = request.items.reduce((sum, item) => {
            const product = getProductById(item.productId);
            return sum + (product ? product.price * item.quantity : 0);
          }, 0);

          return (
            <Card 
              key={request.id}
              className="cursor-pointer transition-all hover:border-accent active:scale-[0.99]"
              onClick={() => navigate(`/manager/requests/${request.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <MapPin className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{vendor?.name || 'Unknown Vendor'}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      by {salesman?.name || 'Unknown'} • {request.items.length} products • {totalItems} items
                    </p>
                    <p className="text-sm font-semibold text-accent">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={request.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {sortedRequests.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No requests found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
