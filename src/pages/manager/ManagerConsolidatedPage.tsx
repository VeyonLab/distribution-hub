import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, Store, ChevronDown, ChevronUp } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getVendorRequestsByBranch, 
  getVendorById, 
  getProductById,
  getUserById
} from '@/data/mockData';

export default function ManagerConsolidatedPage() {
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();
  
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set());
  const [showRequestSelector, setShowRequestSelector] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const allRequests = branch ? getVendorRequestsByBranch(branch.id) : [];

  // Filter requests by date (exclude drafts)
  const filteredRequests = useMemo(() => {
    return allRequests.filter(req => {
      if (req.status === 'draft') return false;

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

      return true;
    });
  }, [allRequests, dateFilter]);

  // Initialize selection when requests change
  useEffect(() => {
    if (!initialized && filteredRequests.length > 0) {
      setSelectedRequestIds(new Set(filteredRequests.map(r => r.id)));
      setInitialized(true);
    }
  }, [filteredRequests, initialized]);

  // Calculate consolidated totals
  const consolidatedItems = useMemo(() => {
    const totals: Record<string, { productId: string; quantity: number }> = {};

    filteredRequests
      .filter(req => selectedRequestIds.has(req.id))
      .forEach(req => {
        req.items.forEach(item => {
          if (!totals[item.productId]) {
            totals[item.productId] = { productId: item.productId, quantity: 0 };
          }
          totals[item.productId].quantity += item.quantity;
        });
      });

    return Object.values(totals).sort((a, b) => {
      const productA = getProductById(a.productId);
      const productB = getProductById(b.productId);
      return (productA?.name || '').localeCompare(productB?.name || '');
    });
  }, [filteredRequests, selectedRequestIds]);

  if (!tenant) return null;

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setSelectedRequestIds(new Set());
    setInitialized(false);
  };

  const toggleRequest = (requestId: string) => {
    const newSet = new Set(selectedRequestIds);
    if (newSet.has(requestId)) {
      newSet.delete(requestId);
    } else {
      newSet.add(requestId);
    }
    setSelectedRequestIds(newSet);
  };

  const selectAll = () => {
    setSelectedRequestIds(new Set(filteredRequests.map(r => r.id)));
  };

  const deselectAll = () => {
    setSelectedRequestIds(new Set());
  };

  const selectedCount = selectedRequestIds.size;
  const totalCount = filteredRequests.length;

  return (
    <MobileLayout
      header={<PageHeader title="Consolidated Items" subtitle={tenant?.name} showBack showLogout />}
    >
      <div className="space-y-4 p-4">
        {/* Date Filter */}
        <Select value={dateFilter} onValueChange={handleDateFilterChange}>
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

        {/* Request Selector */}
        <Card>
          <CardHeader 
            className="cursor-pointer pb-2"
            onClick={() => setShowRequestSelector(!showRequestSelector)}
          >
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4 text-accent" />
                Requests Included
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-normal text-muted-foreground">
                  {selectedCount} of {totalCount}
                </span>
                {showRequestSelector ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
          
          {showRequestSelector && (
            <CardContent className="space-y-3 pt-0">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>

              <div className="max-h-60 space-y-2 overflow-y-auto">
                {filteredRequests.map((request) => {
                  const vendor = getVendorById(request.vendorId);
                  const salesman = getUserById(request.salesmanId);
                  const isSelected = selectedRequestIds.has(request.id);
                  const itemCount = request.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <div 
                      key={request.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                        isSelected ? 'border-accent bg-accent/5' : 'hover:bg-secondary/50'
                      }`}
                      onClick={() => toggleRequest(request.id)}
                    >
                      <Checkbox 
                        checked={isSelected} 
                        onCheckedChange={() => toggleRequest(request.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{vendor?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          by {salesman?.name} • {itemCount} items
                        </p>
                      </div>
                    </div>
                  );
                })}

                {filteredRequests.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No requests for this period
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Consolidated Totals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                Product Totals
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {consolidatedItems.length} products
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {consolidatedItems.map((item, index) => {
              const product = getProductById(item.productId);
              
              return (
                <div 
                  key={item.productId}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{product?.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-accent">{item.quantity}</p>
                    <p className="text-xs text-muted-foreground">{product?.unit}</p>
                  </div>
                </div>
              );
            })}

            {consolidatedItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="mb-2 h-12 w-12 text-muted-foreground/50" />
                <p className="font-medium">No items to show</p>
                <p className="text-sm text-muted-foreground">
                  Select some requests above
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
