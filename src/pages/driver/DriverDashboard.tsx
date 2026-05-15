import { Truck, MapPin, ChevronRight, ScanLine, ShieldCheck, Wallet, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { getTripsByDriver, getRouteById, getVendorById } from '@/data/mockData';
import { useDriverDay, useCashInBag } from '@/contexts/DriverContext';
import { fmtINR } from '@/data/driverMockData';

export default function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loaded, gatePassSignedAt, deliveries, incidents } = useDriverDay();
  const cash = useCashInBag();

  if (!user) return null;

  const trips = getTripsByDriver(user.id);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const activeTrip = trips.find(t => {
    const d = new Date(t.scheduledDate); d.setHours(0,0,0,0);
    return d.getTime() === today.getTime() && t.status !== 'completed';
  });

  if (!activeTrip) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Truck className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">No Trips Today</h2>
        <p className="text-muted-foreground">You don't have any trips scheduled for today.</p>
      </div>
    );
  }

  const route = getRouteById(activeTrip.routeId);
  const completedStops = activeTrip.stops.filter(s => deliveries[s.id]).length;
  const totalStops = activeTrip.stops.length;
  const loadedAny = Object.keys(loaded).length > 0;
  const gatePassed = !!gatePassSignedAt;
  const nextStop = activeTrip.stops.find(s => !deliveries[s.id]);
  const nextVendor = nextStop ? getVendorById(nextStop.vendorId) : null;

  // Stage progress: Load -> Gate-pass -> Route -> EOD
  type Stage = { key: string; label: string; icon: typeof Truck; done: boolean; to: string };
  const stages: Stage[] = [
    { key: 'load', label: 'Load van', icon: ScanLine, done: loadedAny, to: '/driver/loading' },
    { key: 'gate', label: 'Gate-pass', icon: ShieldCheck, done: gatePassed, to: '/driver/gate-pass' },
    { key: 'deliver', label: `Deliver (${completedStops}/${totalStops})`, icon: MapPin, done: completedStops === totalStops, to: '/driver/route' },
    { key: 'eod', label: 'EOD handover', icon: ClipboardCheck, done: false, to: '/driver/eod' },
  ];
  const nextStage = stages.find(s => !s.done) || stages[stages.length - 1];

  return (
    <div className="space-y-4 p-4">
      {/* Trip card */}
      <Card className="overflow-hidden">
        <div className="bg-primary p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Today's Route</p>
              <h2 className="text-xl font-bold">{route?.name}</h2>
            </div>
            <StatusBadge status={activeTrip.status} />
          </div>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-xl font-bold text-accent">{totalStops}</p><p className="text-xs text-muted-foreground">Stops</p></div>
            <div><p className="text-xl font-bold text-emerald-600">{completedStops}</p><p className="text-xs text-muted-foreground">Done</p></div>
            <div><p className="text-xl font-bold text-amber-600">{fmtINR(cash)}</p><p className="text-xs text-muted-foreground">Cash bag</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Stage progress */}
      <Card>
        <CardContent className="p-3 space-y-2">
          {stages.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.key} onClick={() => navigate(s.to)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center ${s.done ? 'bg-emerald-600 text-white' : 'bg-secondary text-foreground'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{s.label}</p>
                </div>
                {s.done ? <Badge className="bg-emerald-600">Done</Badge> : s.key === nextStage.key ? <Badge>Next</Badge> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick action */}
      <Button onClick={() => navigate(nextStage.to)} className="w-full gap-2" size="lg">
        Continue: {nextStage.label}
      </Button>

      {/* Next stop preview */}
      {gatePassed && nextStop && nextVendor && (
        <Card className="cursor-pointer hover:border-accent" onClick={() => navigate(`/driver/stop/${nextStop.id}`)}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Stop</p>
                <p className="font-medium">{nextVendor.name}</p>
                <p className="text-xs text-muted-foreground">{nextVendor.address}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* Incident shortcut */}
      <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/driver/incident')}>
        <AlertTriangle className="h-4 w-4" /> Report incident {incidents.length > 0 && <Badge variant="secondary">{incidents.length}</Badge>}
      </Button>
    </div>
  );
}
