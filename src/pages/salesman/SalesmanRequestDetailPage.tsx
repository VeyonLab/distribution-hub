import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Store, Package, Edit, Send } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getVendorRequestById, getVendorById, getProductById } from '@/data/mockData';

export default function SalesmanRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { user, tenant } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const request = requestId ? getVendorRequestById(requestId) : null;
  const vendor = request ? getVendorById(request.vendorId) : null;

  if (!request || request.salesmanId !== user?.id) {
    return (
      <MobileLayout
        header={<PageHeader title="Request Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <FileText className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Request not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/salesman/requests')}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const totalItems = request.items.reduce((sum, item) => sum + item.quantity, 0);
  const dateStr = new Date(request.createdAt).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSubmitDraft = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
      title: 'Request Submitted',
      description: 'Your draft has been submitted. (UI demo only)',
    });
    navigate('/salesman/requests');
  };

  return (
    <MobileLayout
      header={<PageHeader title="Request Details" subtitle={tenant?.name} showBack showLogout />}
    >
      <div className="space-y-4 p-4">
        {/* Status and Date */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={request.status} className="mt-1" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{dateStr}</p>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Info */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <Store className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vendor</p>
              <p className="font-medium">{vendor?.name || 'Unknown Vendor'}</p>
              <p className="text-xs text-muted-foreground">{vendor?.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                Items
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {request.items.length} products • {totalItems} items
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {request.items.map((item, index) => {
              const product = getProductById(item.productId);
              
              return (
                <div 
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-muted-foreground">{product?.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{item.quantity}</p>
                    <p className="text-xs text-muted-foreground">{product?.unit}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions for Draft */}
        {request.status === 'draft' && (
          <div className="space-y-2">
            <Button 
              className="w-full gap-2"
              onClick={handleSubmitDraft}
            >
              <Send className="h-4 w-4" />
              Submit Request
            </Button>
            <Button 
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate(`/salesman/create/${request.vendorId}`)}
            >
              <Edit className="h-4 w-4" />
              Edit Request
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
