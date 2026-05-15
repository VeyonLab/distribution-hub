import { Truck, Package } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useStockOnWheels, useDriverDay } from '@/contexts/DriverContext';
import { getProductById } from '@/data/mockData';

export default function DriverStockOnWheelsPage() {
  const { tenant } = useAuth();
  const stock = useStockOnWheels();
  const { loaded } = useDriverDay();

  const items = Object.entries(stock).map(([pid, remaining]) => {
    const p = getProductById(pid);
    return { pid, p, remaining, loaded: loaded[pid] || 0 };
  }).filter(x => x.loaded > 0);

  return (
    <MobileLayout header={<PageHeader title="Stock on Wheels" subtitle={tenant?.name} showBack showLogout />}>
      <div className="p-4 space-y-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Truck className="h-6 w-6 text-accent" />
            <div>
              <p className="font-medium">Live van inventory</p>
              <p className="text-xs text-muted-foreground">Updates as you complete deliveries.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4 text-accent" />Remaining stock</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nothing loaded yet.</p>}
            {items.map(({ pid, p, remaining, loaded }) => {
              const used = loaded - remaining;
              const pct = loaded ? (remaining / loaded) * 100 : 0;
              return (
                <div key={pid} className="rounded-lg border p-3">
                  <div className="flex justify-between mb-1">
                    <p className="font-medium">{p?.name}</p>
                    <p className={`font-bold ${remaining <= 0 ? 'text-destructive' : 'text-foreground'}`}>{remaining} {p?.unit}</p>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Loaded {loaded} · delivered {used}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
