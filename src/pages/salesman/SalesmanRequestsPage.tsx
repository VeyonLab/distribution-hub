import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Store, ChevronRight, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { getVendorRequestsBySalesman, getVendorById } from '@/data/mockData';
import { VendorRequest } from '@/types';

export default function SalesmanRequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!user) return null;

  const myRequests = getVendorRequestsBySalesman(user.id);

  const filteredRequests = myRequests.filter(request => {
    return statusFilter === 'all' || request.status === statusFilter;
  });

  // Sort by date, newest first
  const sortedRequests = [...filteredRequests].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const statusCounts = {
    all: myRequests.length,
    draft: myRequests.filter(r => r.status === 'draft').length,
    pending: myRequests.filter(r => r.status === 'pending').length,
    batched: myRequests.filter(r => r.status === 'batched').length,
    in_transit: myRequests.filter(r => r.status === 'in_transit').length,
    delivered: myRequests.filter(r => r.status === 'delivered').length,
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">My Requests</h2>
          <p className="text-sm text-muted-foreground">
            {myRequests.length} total requests
          </p>
        </div>
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All ({statusCounts.all})</SelectItem>
          <SelectItem value="draft">Draft ({statusCounts.draft})</SelectItem>
          <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
          <SelectItem value="batched">Batched ({statusCounts.batched})</SelectItem>
          <SelectItem value="in_transit">In Transit ({statusCounts.in_transit})</SelectItem>
          <SelectItem value="delivered">Delivered ({statusCounts.delivered})</SelectItem>
        </SelectContent>
      </Select>

      {/* Requests List */}
      <div className="space-y-2">
        {sortedRequests.map((request) => {
          const vendor = getVendorById(request.vendorId);
          const itemCount = request.items.reduce((sum, item) => sum + item.quantity, 0);
          const dateStr = new Date(request.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          });
          
          return (
            <Card 
              key={request.id}
              className="cursor-pointer transition-all hover:border-accent active:scale-[0.99]"
              onClick={() => navigate(`/salesman/requests/${request.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Store className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{vendor?.name || 'Unknown Vendor'}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.items.length} products • {itemCount} items • {dateStr}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
              <FileText className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No requests found</p>
              <p className="text-sm text-muted-foreground">
                {statusFilter !== 'all' ? 'Try a different filter' : 'Create your first request'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
