import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Camera, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSalesman } from '@/contexts/SalesmanContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function SalesmanCheckInPage() {
  const { user } = useAuth();
  const { doCheckIn } = useSalesman();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [gpsCaptured, setGpsCaptured] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const captureGps = () => {
    setGpsLoading(true);
    // simulated GPS — defaults near branch coordinates
    setTimeout(() => {
      setGpsCaptured({ lat: 19.1365 + (Math.random() - 0.5) * 0.001, lng: 72.8296 + (Math.random() - 0.5) * 0.001 });
      setGpsLoading(false);
    }, 800);
  };

  const captureSelfie = () => {
    // simulated selfie — emoji on canvas
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 200;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 200, 200);
    ctx.font = '120px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🤳', 100, 110);
    setSelfie(canvas.toDataURL('image/png'));
  };

  const handleSubmit = async () => {
    if (!gpsCaptured) {
      toast({ title: 'GPS required', description: 'Please capture GPS location to check in.', variant: 'destructive' });
      return;
    }
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1200));
    doCheckIn({
      date: new Date().toISOString().slice(0, 10),
      time: Date.now(),
      lat: gpsCaptured.lat,
      lng: gpsCaptured.lng,
      selfie: selfie || undefined,
    });
    setSyncing(false);
    toast({ title: 'Checked in!', description: 'Latest stock, prices and dues synced.' });
    navigate('/salesman', { replace: true });
  };

  return (
    <MobileLayout header={<PageHeader title="Daily Check-in" subtitle={user?.name} showLogout />}>
      <div className="space-y-4 p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-accent" />
            <p className="font-semibold">Start your day</p>
            <p className="text-sm text-muted-foreground">Check in with GPS to unlock orders and sync data</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> GPS Check-in</span>
              <span className="text-xs font-normal text-destructive">Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gpsCaptured ? (
              <div className="rounded-lg bg-accent/10 p-3 text-sm">
                <p className="font-medium text-accent">✓ Location captured</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {gpsCaptured.lat.toFixed(5)}, {gpsCaptured.lng.toFixed(5)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Tap to capture your current location.</p>
            )}
            <Button variant={gpsCaptured ? 'outline' : 'default'} className="w-full gap-2" onClick={captureGps} disabled={gpsLoading}>
              {gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {gpsCaptured ? 'Recapture GPS' : 'Capture GPS'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><Camera className="h-4 w-4" /> Selfie</span>
              <span className="text-xs font-normal text-muted-foreground">Optional</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selfie ? (
              <div className="flex items-center gap-3">
                <img src={selfie} alt="selfie" className="h-16 w-16 rounded-lg border object-cover" />
                <p className="text-sm text-accent">✓ Selfie captured</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Add a selfie for attendance.</p>
            )}
            <Button variant="outline" className="w-full gap-2" onClick={captureSelfie}>
              <Camera className="h-4 w-4" />
              {selfie ? 'Retake Selfie' : 'Take Selfie'}
            </Button>
          </CardContent>
        </Card>

        <Button className="w-full h-12 gap-2" onClick={handleSubmit} disabled={syncing || !gpsCaptured}>
          {syncing ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Syncing latest data...</>
          ) : (
            <>Check in & Sync</>
          )}
        </Button>
      </div>
    </MobileLayout>
  );
}
