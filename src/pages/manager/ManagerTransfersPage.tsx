import { ArrowLeftRight, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { getStockTransfersByBranch, getBranchById } from '@/data/mockData';

export default function ManagerTransfersPage() {
  const { branch } = useAuth();
  const navigate = useNavigate();

  if (!branch) return null;

  const transfers = getStockTransfersByBranch(branch.id);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {transfers.length} transfer{transfers.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => navigate('/manager/transfers/create')}>
          <Plus className="mr-1 h-4 w-4" />
          New Request
        </Button>
      </div>

      {transfers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ArrowLeftRight className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">No stock transfers</p>
          <p className="text-sm text-muted-foreground">Request stock from another branch when you're running low</p>
          <Button className="mt-4" onClick={() => navigate('/manager/transfers/create')}>
            Request Stock
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map(transfer => {
            const fromBranch = getBranchById(transfer.fromBranchId);
            const toBranch = getBranchById(transfer.toBranchId);
            const isOutgoing = transfer.fromBranchId === branch.id;
            
            return (
              <Card key={transfer.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{isOutgoing ? 'To' : 'From'}:</span>
                      <span>{isOutgoing ? toBranch?.name : fromBranch?.name}</span>
                    </div>
                    <StatusBadge status={transfer.status} />
                  </div>
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
                    {transfer.requestedAt.toLocaleDateString('en-IN')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
