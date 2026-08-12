import { useNavigate } from 'react-router-dom';
import { AlertCircle, Banknote, Clock, FileWarning, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LiveVanMap } from '@/components/LiveVanMap';
import { dailyPulse, activeTickets, liveVans, formatINR } from '@/data/adminMockData';

const ticketLabel = {
  payment_disputed: 'Payment Disputed',
  missing_sku: 'Missing SKU',
  damaged: 'Damaged Goods',
  refused: 'Order Refused',
} as const;

export default function OwnerPulsePage() {
  const navigate = useNavigate();
  const targetPct = Math.round((dailyPulse.salesAchieved / dailyPulse.salesTarget) * 100);

  return (
    <div className="space-y-4 p-4">
      {/* Live Van Telematics */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Live Van Telematics</h3>
              <p className="text-xs text-muted-foreground">Real-time fleet location</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/owner/monitoring')}>
              Details
            </Button>
          </div>
          <LiveVanMap />
        </CardContent>
      </Card>

      {/* Daily Pulse */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h3 className="font-semibold">Daily Pulse</h3>
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Sales Goal</span>
              <span className="text-sm font-semibold">
                {formatINR(dailyPulse.salesAchieved)} / {formatINR(dailyPulse.salesTarget)}
              </span>
            </div>
            <Progress value={targetPct} className="h-2" />
            <p className="mt-1 text-right text-xs text-muted-foreground">{targetPct}% achieved</p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-lg bg-secondary/50 p-3 text-center">
              <p className="text-xl font-bold">{dailyPulse.productivity}%</p>
              <p className="text-[10px] uppercase text-muted-foreground">Productivity</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 text-center">
              <p className="text-xl font-bold">{dailyPulse.skuPerCall}</p>
              <p className="text-[10px] uppercase text-muted-foreground">SKU / Call</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 text-center">
              <p className="text-xl font-bold">{formatINR(dailyPulse.valuePerCall)}</p>
              <p className="text-[10px] uppercase text-muted-foreground">Value / Call</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash-in-Transit */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <Wallet className="mb-2 h-5 w-5 text-amber-600" />
            <p className="text-2xl font-bold">{formatINR(dailyPulse.cashInTransit)}</p>
            <p className="text-xs text-muted-foreground">Cash-in-Transit</p>
            <p className="mt-1 text-[10px] text-muted-foreground">across {liveVans.length} vans</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4">
            <Banknote className="mb-2 h-5 w-5 text-emerald-600" />
            <p className="text-2xl font-bold">{formatINR(dailyPulse.digitalCollected)}</p>
            <p className="text-xs text-muted-foreground">Digital Collected</p>
            <p className="mt-1 text-[10px] text-muted-foreground">UPI / QR / cards</p>
          </CardContent>
        </Card>
      </div>

      {/* Active tickets triage */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-destructive" />
              <h3 className="font-semibold">Active Tickets</h3>
            </div>
            <Badge variant="destructive">{activeTickets.length} open</Badge>
          </div>
          <div className="space-y-2">
            {activeTickets.map(t => (
              <div
                key={t.id}
                className={`flex items-start justify-between gap-2 rounded-lg border-l-4 bg-secondary/40 p-3 ${
                  t.severity === 'high' ? 'border-destructive' : t.severity === 'medium' ? 'border-amber-500' : 'border-muted-foreground'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <p className="truncate text-sm font-medium">{ticketLabel[t.type]}</p>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{t.outlet}</p>
                  <p className="text-[11px] text-muted-foreground">by {t.raisedBy}</p>
                </div>
                <div className="text-right">
                  {t.amount && <p className="text-sm font-semibold">{formatINR(t.amount)}</p>}
                  <p className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" /> {t.ageMinutes}m
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
