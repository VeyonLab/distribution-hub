import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, ShieldCheck, Truck } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useDriverDay } from '@/contexts/DriverContext';
import { driverVehicle } from '@/data/driverMockData';

export default function DriverGatePassPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { gatePassSignedAt, signGatePass } = useDriverDay();
  const [odometer, setOdometer] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleSimulateQrScan = () => {
    if (!odometer) {
      toast({ title: 'Enter odometer', description: 'Record start odometer reading.', variant: 'destructive' });
      return;
    }
    setScanning(true);
    setTimeout(() => {
      signGatePass(driverVehicle.warehouseManager, parseInt(odometer));
      toast({ title: 'Gate-pass approved', description: `Signed by ${driverVehicle.warehouseManager}.` });
      setScanning(false);
      navigate('/driver/route');
    }, 700);
  };

  return (
    <MobileLayout header={<PageHeader title="Vehicle Gate-Pass" subtitle={tenant?.name} showBack showLogout />}>
      <div className="p-4 pb-24 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-accent" /><span className="font-medium">{driverVehicle.registration}</span></div>
            <p className="text-sm text-muted-foreground">Driver: {driverVehicle.driver}</p>
            <p className="text-sm text-muted-foreground">Warehouse Mgr: {driverVehicle.warehouseManager}</p>
          </CardContent>
        </Card>

        {gatePassSignedAt ? (
          <Card className="border-emerald-300 bg-emerald-50">
            <CardContent className="p-4 flex items-center gap-3 text-emerald-900">
              <ShieldCheck className="h-6 w-6" />
              <div>
                <p className="font-medium">Gate-pass approved</p>
                <p className="text-xs">Signed {new Date(gatePassSignedAt).toLocaleTimeString()}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Start Odometer</CardTitle></CardHeader>
              <CardContent>
                <Label htmlFor="odo">Reading (km)</Label>
                <Input id="odo" type="number" inputMode="numeric" value={odometer} onChange={e => setOdometer(e.target.value)} placeholder="e.g. 48230" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Manager QR / Signature</CardTitle></CardHeader>
              <CardContent className="text-center space-y-3">
                <div className="mx-auto h-40 w-40 rounded-lg border-2 border-dashed flex items-center justify-center bg-secondary/50">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Ask the warehouse manager to scan / sign to release the vehicle.</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {!gatePassSignedAt && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
          <div className="mx-auto max-w-md">
            <Button className="w-full gap-2 h-12" disabled={scanning} onClick={handleSimulateQrScan}>
              <ShieldCheck className="h-5 w-5" />
              {scanning ? 'Verifying…' : 'Simulate manager approval'}
            </Button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
