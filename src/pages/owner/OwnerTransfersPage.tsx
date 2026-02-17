import { ArrowLeftRight, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getStockTransfersByTenant, getBranchById } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export default function OwnerTransfersPage() {
  const { tenant } = useAuth();
  const { toast } = useToast();

  if (!tenant) return null;

  const transfers = getStockTransfersByTenant(tenant.id);

  const handleApprove = (id: string) => {
    toast({ title: 'Transfer approved', description: 'Stock transfer request has been approved.' });
  };

  const handleReject = (id: string) => {
    toast({ title: 'Transfer rejected', description: 'Stock transfer request has been rejected.' });
  };

  return (
    <div className="space-y-4 p-4">
      <p className="text-sm text-muted-foreground">
        {transfers.length} transfer request{transfers.length !== 1 ? 's' : ''}
      </p>

      {transfers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ArrowLeftRight className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">No stock transfer requests</p>
          <p className="text-sm text-muted-foreground">Transfer requests between branches will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map(transfer => {
            const fromBranch = getBranchById(transfer.fromBranchId);
            const toBranch = getBranchById(transfer.toBranchId);
            return (
              <Card key={transfer.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{fromBranch?.name || 'Unknown'}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{toBranch?.name || 'Unknown'}</span>
                    </div>
                    <StatusBadge status={transfer.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    {transfer.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.productName}</span>
                        <span className="font-medium">{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                  {transfer.note && (
                    <p className="text-xs text-muted-foreground italic">"{transfer.note}"</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Requested: {transfer.requestedAt.toLocaleDateString('en-IN')}
                  </p>
                  {transfer.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="flex-1" onClick={() => handleApprove(transfer.id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleReject(transfer.id)}>
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
