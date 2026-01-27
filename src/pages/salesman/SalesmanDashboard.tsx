import { useNavigate } from 'react-router-dom';
import { FileText, Store, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { getVendorRequestsBySalesman, getVendorById } from '@/data/mockData';

export default function SalesmanDashboard() {
  const { user, tenant } = useAuth();
  const navigate = useNavigate();

  if (!user || !tenant) return null;

  const myRequests = getVendorRequestsBySalesman(user.id);
  
  // Filter for today's requests
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRequests = myRequests.filter(r => {
    const reqDate = new Date(r.createdAt);
    reqDate.setHours(0, 0, 0, 0);
    return reqDate.getTime() === today.getTime();
  });

  const pendingCount = todayRequests.filter(r => r.status === 'pending').length;
  const draftCount = todayRequests.filter(r => r.status === 'draft').length;

  return (
    <div className="space-y-6 p-4">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold">Hello, {user.name.split(' ')[0]}!</h1>
        <p className="text-sm text-muted-foreground">Here's your activity for today</p>
      </div>

      {/* Quick Action */}
      <Button 
        className="w-full gap-2 h-14 text-base"
        onClick={() => navigate('/salesman/vendors')}
      >
        <Plus className="h-5 w-5" />
        Create New Request
      </Button>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{todayRequests.length}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{draftCount}</p>
            <p className="text-xs text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Requests */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Today's Requests</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/salesman/requests')}>
            View All
          </Button>
        </div>

        {todayRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-2 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">No requests yet</p>
              <p className="text-sm text-muted-foreground">
                Start by selecting a vendor
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {todayRequests.slice(0, 5).map((request) => {
              const vendor = getVendorById(request.vendorId);
              const itemCount = request.items.reduce((sum, item) => sum + item.quantity, 0);
              
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
                          {request.items.length} products • {itemCount} items
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={request.status} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
