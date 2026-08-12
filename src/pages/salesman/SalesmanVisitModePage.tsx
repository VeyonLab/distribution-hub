import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Loader2, CheckCircle2, AlertTriangle, Phone, Store } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSalesman } from '@/contexts/SalesmanContext';
import { getVendorById } from '@/data/mockData';
import { distanceMeters, teleCallReasons } from '@/data/salesmanMockData';

const FIELD_FENCE_M = 50;

export default function SalesmanVisitModePage() {
  const { vendorId, mode } = useParams<{ vendorId: string; mode: 'field' | 'tele' }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setDraft } = useSalesman();

  const vendor = vendorId ? getVendorById(vendorId) : null;
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [shelfStock, setShelfStock] = useState('');
  const [reason, setReason] = useState<string>('');
  const [reasonOther, setReasonOther] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [calling, setCalling] = useState(false);

  const distance = useMemo(() => {
    if (!coords || !vendor) return null;
    return distanceMeters(coords.lat, coords.lng, vendor.latitude, vendor.longitude);
  }, [coords, vendor]);

  useEffect(() => {
    if (mode === 'field') captureLocation(true);
  }, [mode]);

  const captureLocation = (initial = false) => {
    if (!vendor) return;
    setLocating(true);
    setTimeout(() => {
      // Simulated: ~70% within fence, 30% outside (so users can test both states)
      const within = initial ? Math.random() > 0.3 : true;
      const offset = within ? 0.0002 : 0.002;
      setCoords({
        lat: vendor.latitude + (Math.random() - 0.5) * offset,
        lng: vendor.longitude + (Math.random() - 0.5) * offset,
      });
      setLocating(false);
    }, 700);
  };

  const startCall = () => {
    setCalling(true);
    const start = Date.now();
    const t = setInterval(() => setCallDuration(Math.floor((Date.now() - start) / 1000)), 1000);
    setTimeout(() => {
      clearInterval(t);
      setCalling(false);
      toast({ title: 'Call ended', description: `Logged ${Math.floor((Date.now() - start) / 1000)}s call.` });
    }, 4000);
  };

  if (!vendor) {
    return (
      <MobileLayout header={<PageHeader title="Outlet Not Found" showBack showLogout />}>
        <div className="p-8 text-center"><Store className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" /></div>
      </MobileLayout>
    );
  }

  const withinFence = distance !== null && distance <= FIELD_FENCE_M;
  const canProceed =
    mode === 'field'
      ? withinFence
      : !!reason && (reason !== 'Other' || reasonOther.trim().length > 0);

  const proceed = () => {
    if (!canProceed) return;
    setDraft({
      vendorId: vendor.id,
      mode: mode!,
      shelfStock: mode === 'field' ? shelfStock : undefined,
      teleReason: mode === 'tele' ? reason : undefined,
      teleReasonOther: mode === 'tele' && reason === 'Other' ? reasonOther : undefined,
      cart: [],
      returns: [],
    });
    navigate(`/salesman/create/${vendor.id}`);
  };

  return (
    <MobileLayout header={<PageHeader title={mode === 'field' ? 'Physical Visit' : 'Tele-Call Order'} subtitle={vendor.name} showBack showLogout />}>
      <div className="space-y-4 p-4 pb-32">
        {mode === 'field' ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" /> Geo-fence Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {locating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Capturing location...
                  </div>
                )}
                {distance !== null && (
                  <div
                    className={`rounded-lg p-3 text-sm ${withinFence ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-destructive/10 text-destructive'}`}
                  >
                    {withinFence ? (
                      <p className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Within fence — {distance}m from outlet
                      </p>
                    ) : (
                      <p className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="h-4 w-4" /> Outside fence — {distance}m away (max {FIELD_FENCE_M}m)
                      </p>
                    )}
                  </div>
                )}
                <Button variant="outline" className="w-full gap-2" onClick={() => captureLocation()} disabled={locating}>
                  <MapPin className="h-4 w-4" /> Recheck Location
                </Button>
                <Badge variant="secondary" className="w-full justify-center py-2">
                  ⭐ Eligible for 100% Field Visit Bonus
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Shelf Check (optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="e.g. 12 bags rice, 4 oil cans..."
                  value={shelfStock}
                  onChange={(e) => setShelfStock(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">Saved for analytics</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Reason for Tele-Call</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger><SelectValue placeholder="Select a reason..." /></SelectTrigger>
                  <SelectContent>
                    {teleCallReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                {reason === 'Other' && (
                  <Input placeholder="Specify reason" value={reasonOther} onChange={(e) => setReasonOther(e.target.value)} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Call Outlet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full gap-2"
                  variant={calling ? 'secondary' : 'outline'}
                  onClick={() => {
                    if (vendor.contactPhone) window.location.href = `tel:${vendor.contactPhone.replace(/\s/g, '')}`;
                    startCall();
                  }}
                  disabled={calling}
                >
                  <Phone className="h-4 w-4" />
                  {calling ? `Call in progress... ${callDuration}s` : `Call ${vendor.contactPhone ?? 'Outlet'}`}
                </Button>
                {callDuration > 0 && !calling && (
                  <p className="text-xs text-muted-foreground">Last call: {callDuration}s · auto-logged</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
          <div className="mx-auto max-w-md">
            <Button className="w-full h-12" onClick={proceed} disabled={!canProceed}>
              Continue to Order →
            </Button>
            {!canProceed && mode === 'field' && (
              <p className="mt-2 text-center text-xs text-destructive">Move within {FIELD_FENCE_M}m of outlet to continue</p>
            )}
            {!canProceed && mode === 'tele' && (
              <p className="mt-2 text-center text-xs text-muted-foreground">Pick a reason to continue</p>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
