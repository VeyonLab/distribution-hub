import { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { eodRecords as initialRecords, formatINR, EODRecord } from '@/data/adminMockData';

export default function OwnerReconciliationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [records, setRecords] = useState<EODRecord[]>(initialRecords);
  const [discRecord, setDiscRecord] = useState<EODRecord | null>(null);
  const [reason, setReason] = useState('');

  const approve = (driverId: string) => {
    setRecords(r => r.map(x => x.driverId === driverId ? { ...x, status: 'approved' } : x));
    toast({ title: 'Day closed', description: 'Driver EOD approved.' });
  };

  const submitDiscrepancy = () => {
    if (!discRecord || !reason.trim()) return;
    setRecords(r => r.map(x => x.driverId === discRecord.driverId ? { ...x, status: 'approved' } : x));
    toast({ title: 'Discrepancy logged', description: 'Day closed with discrepancy entry.' });
    setDiscRecord(null);
    setReason('');
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/owner')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold">EOD Reconciliation</h1>
          <p className="text-xs text-muted-foreground">3-way match • Cash • Digital QR</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {records.map(r => {
          const cashGap = r.physicalCash - r.expectedCash;
          const qrGap = r.digitalQrSuccess - r.digitalQrExpected;
          const hasDiscrepancy = cashGap !== 0 || qrGap !== 0;

          return (
            <Card key={r.driverId}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{r.driverName}</p>
                    <p className="text-xs text-muted-foreground">{r.routeName}</p>
                  </div>
                  {r.status === 'approved' ? (
                    <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">Approved</Badge>
                  ) : hasDiscrepancy ? (
                    <Badge variant="destructive">Discrepancy</Badge>
                  ) : r.status === 'matched' ? (
                    <Badge className="bg-blue-500 text-white hover:bg-blue-500">Matched</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded bg-secondary/60 p-2">
                    <p className="text-[10px] uppercase text-muted-foreground">Expected Cash</p>
                    <p className="text-sm font-semibold">{formatINR(r.expectedCash)}</p>
                  </div>
                  <div className={`rounded p-2 ${cashGap !== 0 ? 'bg-destructive/10' : 'bg-secondary/60'}`}>
                    <p className="text-[10px] uppercase text-muted-foreground">Physical</p>
                    <p className="text-sm font-semibold">{formatINR(r.physicalCash)}</p>
                    {cashGap !== 0 && (
                      <p className="text-[10px] text-destructive">{cashGap > 0 ? '+' : ''}{formatINR(cashGap)}</p>
                    )}
                  </div>
                  <div className={`rounded p-2 ${qrGap !== 0 ? 'bg-destructive/10' : 'bg-secondary/60'}`}>
                    <p className="text-[10px] uppercase text-muted-foreground">QR Success</p>
                    <p className="text-sm font-semibold">{formatINR(r.digitalQrSuccess)}</p>
                    {qrGap !== 0 && (
                      <p className="text-[10px] text-destructive">of {formatINR(r.digitalQrExpected)}</p>
                    )}
                  </div>
                </div>

                {r.status !== 'approved' && (
                  hasDiscrepancy ? (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setDiscRecord(r)}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" /> Enter Discrepancy & Close
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => approve(r.driverId)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Approve & Close Day
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!discRecord} onOpenChange={() => setDiscRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discrepancy Entry — {discRecord?.driverName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Explain the mismatch. Day cannot close without this entry.
            </p>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Driver short by ₹900 — to deduct from salary"
              rows={4}
            />
            <Button className="w-full" disabled={!reason.trim()} onClick={submitDiscrepancy}>
              Submit & Close Day
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
