import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ScanLine, CheckCircle2, AlertCircle } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getTripsByDriver, getVendorRequestById, getProductById } from '@/data/mockData';
import { getCaseSize } from '@/data/driverMockData';
import { useDriverDay } from '@/contexts/DriverContext';

export default function DriverLoadingPage() {
  const { user, tenant } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loaded, scannedCases, setLoadedQty, scanCase } = useDriverDay();
  const [activeScan, setActiveScan] = useState<string | null>(null);

  if (!user) return null;
  const trip = getTripsByDriver(user.id).find(t => t.status !== 'completed');

  // Consolidated pick-list across all stops
  const pickList = useMemo(() => {
    if (!trip) return [];
    const totals: Record<string, number> = {};
    trip.stops.forEach(stop => {
      stop.vendorRequestIds.forEach(reqId => {
        const r = getVendorRequestById(reqId);
        r?.items.forEach(it => {
          totals[it.productId] = (totals[it.productId] || 0) + it.quantity;
        });
      });
    });
    return Object.entries(totals).map(([productId, required]) => {
      const product = getProductById(productId);
      const caseSize = getCaseSize(productId);
      const requiredCases = Math.ceil(required / caseSize);
      const scanned = scannedCases[productId] || 0;
      const loadedUnits = loaded[productId] ?? 0;
      return { productId, product, required, requiredCases, caseSize, scanned, loadedUnits };
    });
  }, [trip, scannedCases, loaded]);

  if (!trip) {
    return (
      <MobileLayout header={<PageHeader title="Loading" subtitle={tenant?.name} showBack showLogout />}>
        <div className="p-8 text-center text-muted-foreground">No active trip.</div>
      </MobileLayout>
    );
  }

  const totalRequired = pickList.reduce((s, p) => s + p.required, 0);
  const totalLoaded = pickList.reduce((s, p) => s + p.loadedUnits, 0);
  const progress = totalRequired ? (totalLoaded / totalRequired) * 100 : 0;
  const allLoaded = pickList.every(p => p.loadedUnits >= p.required);

  const handleSimulateScan = (productId: string) => {
    setActiveScan(productId);
    setTimeout(() => {
      const p = pickList.find(x => x.productId === productId);
      if (!p) return;
      scanCase(productId);
      const newCases = (scannedCases[productId] || 0) + 1;
      const newUnits = Math.min(newCases * p.caseSize, p.required);
      setLoadedQty(productId, newUnits);
      toast({ title: 'Case scanned', description: `${p.product?.name} – case ${newCases}/${p.requiredCases}` });
      setActiveScan(null);
    }, 350);
  };

  const handleMarkAllLoaded = () => {
    pickList.forEach(p => setLoadedQty(p.productId, p.required));
    toast({ title: 'All items loaded', description: 'Pick-list confirmed (simulated full scan).' });
  };

  return (
    <MobileLayout header={<PageHeader title="Warehouse Loading" subtitle={tenant?.name} showBack showLogout />}>
      <div className="p-4 pb-32 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Load progress</span>
              <span className="font-medium">{totalLoaded}/{totalRequired} units</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              Scan each case to verify the right stock is on the vehicle.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-accent" />
              Consolidated Pick-List
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pickList.map(p => {
              const done = p.loadedUnits >= p.required;
              return (
                <div key={p.productId} className={`rounded-lg border p-3 ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-secondary/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{p.product?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.requiredCases} case{p.requiredCases !== 1 ? 's' : ''} ({p.caseSize}/case) · need {p.required} {p.product?.unit}
                      </p>
                    </div>
                    {done ? (
                      <Badge className="bg-emerald-600">Loaded</Badge>
                    ) : (
                      <Badge variant="outline">{p.scanned}/{p.requiredCases}</Badge>
                    )}
                  </div>
                  {!done && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-2"
                      disabled={activeScan === p.productId}
                      onClick={() => handleSimulateScan(p.productId)}
                    >
                      <ScanLine className="h-4 w-4" />
                      {activeScan === p.productId ? 'Scanning…' : 'Scan next case'}
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {!allLoaded && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-3 flex items-start gap-2 text-sm text-amber-900">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              Scan every case before requesting the gate-pass.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
        <div className="mx-auto max-w-md flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleMarkAllLoaded}>
            Skip / Mark all
          </Button>
          <Button className="flex-1 gap-2" disabled={!allLoaded} onClick={() => navigate('/driver/gate-pass')}>
            <CheckCircle2 className="h-4 w-4" />
            Request gate-pass
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
