import { useState } from 'react';
import { ArrowLeft, Flame, PackageSearch, Truck, Warehouse, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { inventoryBatches, InventoryBatch, liveVans } from '@/data/adminMockData';

function ageColor(days: number) {
  if (days < 30) return 'bg-red-500 text-white';
  if (days < 60) return 'bg-amber-400 text-amber-950';
  if (days < 120) return 'bg-yellow-200 text-yellow-900';
  return 'bg-emerald-100 text-emerald-900';
}

export default function OwnerAgingStockPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pushSku, setPushSku] = useState<InventoryBatch | null>(null);
  const [pushDiscount, setPushDiscount] = useState('2');

  const warehouse = inventoryBatches.filter(b => b.location === 'warehouse');
  const onWheels = inventoryBatches.filter(b => b.location === 'van');
  const aging = [...inventoryBatches].sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  const pushSale = () => {
    toast({
      title: 'Push-Sale activated',
      description: `${pushSku?.productName} (Batch ${pushSku?.batchNo}) pushed to all salesmen with ${pushDiscount}% extra discount.`,
    });
    setPushSku(null);
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/owner')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold">Aging Stock Radar</h1>
          <p className="text-xs text-muted-foreground">FIFO • Push-Sale • Godown Sync</p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <Tabs defaultValue="heatmap">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="heatmap"><Flame className="mr-1 h-3 w-3" />Heatmap</TabsTrigger>
            <TabsTrigger value="push"><Zap className="mr-1 h-3 w-3" />Push-Sale</TabsTrigger>
            <TabsTrigger value="godown"><Warehouse className="mr-1 h-3 w-3" />Godown</TabsTrigger>
          </TabsList>

          {/* HEATMAP */}
          <TabsContent value="heatmap" className="space-y-3 pt-4">
            <Card>
              <CardContent className="p-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  <span className="font-medium text-foreground">Age legend:</span>
                  <Badge className="bg-red-500 text-white hover:bg-red-500">&lt;30d</Badge>
                  <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400">&lt;60d</Badge>
                  <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-200">&lt;120d</Badge>
                  <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">Fresh</Badge>
                </div>
              </CardContent>
            </Card>
            {aging.map(b => (
              <Card key={b.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="font-medium">{b.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      Batch {b.batchNo} • {b.qty} {b.unit} • {b.location === 'van' ? `On ${b.vanId}` : 'Warehouse'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={ageColor(b.daysToExpiry) + ' hover:opacity-100'}>
                      {b.daysToExpiry}d left
                    </Badge>
                    {b.daysToExpiry < 30 && (
                      <Button size="sm" variant="outline" onClick={() => setPushSku(b)}>
                        Push
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* PUSH-SALE */}
          <TabsContent value="push" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              Select an aging SKU and push it to all salesmen with an extra discount.
            </p>
            {aging.filter(b => b.daysToExpiry < 60).map(b => (
              <Card key={b.id} className="cursor-pointer hover:border-accent" onClick={() => setPushSku(b)}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <PackageSearch className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">{b.productName}</p>
                      <p className="text-xs text-muted-foreground">{b.qty} {b.unit} • {b.daysToExpiry}d</p>
                    </div>
                  </div>
                  <Zap className="h-4 w-4 text-amber-500" />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* VIRTUAL GODOWN */}
          <TabsContent value="godown" className="space-y-3 pt-4">
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-accent" />
                  <h3 className="font-semibold">Warehouse Stock</h3>
                </div>
                <div className="space-y-1 text-sm">
                  {warehouse.map(b => (
                    <div key={b.id} className="flex justify-between border-b py-1 last:border-0">
                      <span>{b.productName}</span>
                      <span className="font-medium">{b.qty} {b.unit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-accent" />
                  <h3 className="font-semibold">Van Stock (Stock-on-Wheels)</h3>
                </div>
                {liveVans.map(v => {
                  const items = onWheels.filter(b => b.vanId === v.id);
                  return (
                    <div key={v.id} className="mb-3 last:mb-0">
                      <p className="text-xs font-medium text-muted-foreground">{v.vehicleNo} • {v.driverName}</p>
                      {items.length === 0 ? (
                        <p className="py-1 text-xs italic text-muted-foreground">No tracked SKUs</p>
                      ) : items.map(b => (
                        <div key={b.id} className="flex justify-between py-1 text-sm">
                          <span>{b.productName}</span>
                          <span className="font-medium">{b.qty} {b.unit}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => toast({ title: 'Godown synced', description: 'Warehouse and Van stock reconciled successfully.' })}
                >
                  Reconcile Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!pushSku} onOpenChange={() => setPushSku(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Push-Sale: {pushSku?.productName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {pushSku?.qty} {pushSku?.unit} • Batch {pushSku?.batchNo} • {pushSku?.daysToExpiry}d to expiry
            </p>
            <div>
              <Label htmlFor="disc">Extra discount %</Label>
              <Input id="disc" type="number" value={pushDiscount} onChange={e => setPushDiscount(e.target.value)} />
            </div>
            <Button className="w-full" onClick={pushSale}>Push to all Salesmen</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
