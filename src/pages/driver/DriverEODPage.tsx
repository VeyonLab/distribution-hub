import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, FileText, RotateCcw, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  useDriverDay, useCashInBag, useChequesCollected, useReturnsCollected, useStockOnWheels,
} from '@/contexts/DriverContext';
import { cashDenominations, fmtINR } from '@/data/driverMockData';
import { getProductById } from '@/data/mockData';

export default function DriverEODPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cashDenominations: denomMap, setDenomCount, finalizeEOD, startOdometer, eodHandedOverAt, loaded } = useDriverDay();
  const cash = useCashInBag();
  const cheques = useChequesCollected();
  const returns = useReturnsCollected();
  const stock = useStockOnWheels();
  const [endOdo, setEndOdo] = useState('');

  const denomTotal = useMemo(
    () => cashDenominations.reduce((s, d) => s + d * (denomMap[d] || 0), 0),
    [denomMap]
  );
  const cashMatches = denomTotal === cash;

  const missingStock = Object.entries(stock).filter(([pid, qty]) => {
    const expected = (loaded[pid] || 0);
    // expected to leftover should be: loaded - sum delivered = stock value already
    return qty < 0;
  });

  const km = startOdometer && endOdo ? Math.max(0, parseInt(endOdo) - startOdometer) : 0;

  const submit = () => {
    if (!endOdo) { toast({ title: 'Enter end odometer', variant: 'destructive' }); return; }
    finalizeEOD(parseInt(endOdo));
    toast({ title: 'EOD submitted', description: 'Handover summary sent to accounts.' });
  };

  return (
    <MobileLayout header={<PageHeader title="End-of-Day Handover" subtitle={tenant?.name} showBack showLogout />}>
      <div className="p-4 pb-32 space-y-4">
        {eodHandedOverAt && (
          <Card className="border-emerald-300 bg-emerald-50">
            <CardContent className="p-3 flex items-center gap-2 text-emerald-900">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium">EOD submitted</p>
                <p className="text-xs">{new Date(eodHandedOverAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cash + denomination */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4 text-accent" />Cash collected</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between font-semibold">
              <span>Total cash from sales</span><span>{fmtINR(cash)}</span>
            </div>
            <div className="space-y-1 pt-2 border-t">
              {cashDenominations.map(d => (
                <div key={d} className="flex items-center gap-2 text-sm">
                  <span className="w-16">₹{d}</span>
                  <span className="text-muted-foreground">×</span>
                  <Input type="number" min={0} value={denomMap[d] || ''} onChange={e => setDenomCount(d, parseInt(e.target.value) || 0)}
                    className="h-8 w-20" placeholder="0" />
                  <span className="ml-auto font-mono text-sm">{fmtINR(d * (denomMap[d] || 0))}</span>
                </div>
              ))}
            </div>
            <div className={`flex justify-between pt-2 border-t font-semibold ${cashMatches ? 'text-emerald-700' : 'text-amber-700'}`}>
              <span>Counted</span>
              <span>{fmtINR(denomTotal)} {cashMatches ? '✓' : `· diff ${fmtINR(denomTotal - cash)}`}</span>
            </div>
          </CardContent>
        </Card>

        {/* Cheques */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-accent" />Cheques ({cheques.length})</CardTitle></CardHeader>
          <CardContent>
            {cheques.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cheques collected.</p>
            ) : cheques.map((c, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                <span>{c.bank} · #{c.chequeNo}</span>
                <span className="font-medium">{fmtINR(c.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Returns */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><RotateCcw className="h-4 w-4 text-accent" />Returns ({returns.length})</CardTitle></CardHeader>
          <CardContent>
            {returns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No returns picked up.</p>
            ) : returns.map((r, i) => {
              const p = getProductById(r.productId);
              return (
                <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                  <span>{p?.name} – {r.qty} {p?.unit}</span>
                  <Badge variant="outline">{r.reason}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Inventory reco */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4 text-accent" />Inventory reconciliation</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {Object.entries(loaded).map(([pid, qty]) => {
              const p = getProductById(pid);
              const remaining = stock[pid] || 0;
              return (
                <div key={pid} className="flex justify-between">
                  <span>{p?.name}</span>
                  <span className="text-muted-foreground">Loaded {qty} · returning {remaining}</span>
                </div>
              );
            })}
            {missingStock.length > 0 && (
              <div className="mt-2 p-2 rounded bg-destructive/10 text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Missing stock detected. Please verify before handover.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Performance</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label>End odometer</Label>
              <Input type="number" value={endOdo} onChange={e => setEndOdo(e.target.value)} placeholder={startOdometer ? String(startOdometer + 50) : 'e.g. 48280'} />
            </div>
            {startOdometer && endOdo && (
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div><p className="text-2xl font-bold text-accent">{km}</p><p className="text-xs text-muted-foreground">KM today</p></div>
                <div><p className="text-2xl font-bold text-accent">{Object.keys(useDriverDay.getState().deliveries).length}</p><p className="text-xs text-muted-foreground">Deliveries</p></div>
                <div><p className="text-2xl font-bold text-accent">{km ? (km / 12).toFixed(1) : 0}</p><p className="text-xs text-muted-foreground">L est.</p></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!eodHandedOverAt && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
          <div className="mx-auto max-w-md">
            <Button className="w-full h-12 gap-2" onClick={submit}>
              <CheckCircle2 className="h-5 w-5" /> Submit handover to accountant
            </Button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
