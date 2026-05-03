import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Clock, Target, TrendingUp, AlertTriangle, Sparkles, IndianRupee, RefreshCw, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSalesman } from '@/contexts/SalesmanContext';
import {
  getSalesmanTarget,
  focusSKUs,
  getVendorDues,
} from '@/data/salesmanMockData';
import { getProductById, getVendorsByBranch, getVendorById } from '@/data/mockData';

export default function SalesmanDashboard() {
  const { user, branch } = useAuth();
  const { checkIn, visits, resetCheckIn } = useSalesman();
  const navigate = useNavigate();

  if (!user || !branch) return null;

  const target = getSalesmanTarget(user.id);
  const targetPct = Math.min(100, Math.round((target.achieved / target.monthlyTarget) * 100));
  const commissionPct = Math.min(100, Math.round((target.commissionEarned / target.commissionTarget) * 100));

  const routeVendors = getVendorsByBranch(branch.id);
  const totalOutlets = routeVendors.length;
  const visitedIds = new Set(visits.map(v => v.vendorId));
  const visited = visitedIds.size;
  const productive = visits.filter(v => v.productive).length;
  const fieldOrders = visits.filter(v => v.mode === 'field' && v.productive).length;
  const teleOrders = visits.filter(v => v.mode === 'tele' && v.productive).length;
  const orderTotal = visits.reduce((s, v) => s + v.orderValue, 0);
  const linesTotal = visits.reduce((s, v) => s + v.linesCount, 0);
  const lpc = productive ? (linesTotal / productive).toFixed(1) : '0';
  const strikeRate = visited ? Math.round((productive / visited) * 100) : 0;

  // Bonus today (mock): base 2% commission + ₹50 per field visit
  const baseCommission = Math.round(orderTotal * 0.02);
  const fieldBonus = fieldOrders * 50;
  const schemeBonus = Math.round(orderTotal * 0.005);
  const bonusToday = baseCommission + fieldBonus + schemeBonus;

  // Red flag list
  const dueOutlets = routeVendors
    .map(v => ({ vendor: v, dues: getVendorDues(v.id) }))
    .filter(x => x.dues > 0)
    .sort((a, b) => b.dues - a.dues);
  const totalDues = dueOutlets.reduce((s, x) => s + x.dues, 0);

  const targetColor = targetPct >= 75 ? 'bg-green-500' : targetPct >= 40 ? 'bg-yellow-500' : 'bg-destructive';

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Welcome + check-in pill */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Hi, {user.name.split(' ')[0]}</h1>
          <p className="text-xs text-muted-foreground">Let's hit today's target 🎯</p>
        </div>
        {checkIn && (
          <button
            onClick={resetCheckIn}
            className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-700 dark:text-green-400"
            title="Reset check-in (demo)"
          >
            <MapPin className="h-3 w-3" />
            Checked in {new Date(checkIn.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </button>
        )}
      </div>

      {/* Quick action */}
      <Button className="w-full gap-2 h-12" onClick={() => navigate('/salesman/vendors')}>
        <Plus className="h-5 w-5" />
        Start New Order
      </Button>

      {/* Earnings tracker */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-accent" /> Commission</span>
            <span className="text-sm font-normal text-muted-foreground">
              ₹{target.commissionEarned.toLocaleString('en-IN')} / ₹{target.commissionTarget.toLocaleString('en-IN')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className={`h-full ${targetColor} transition-all`} style={{ width: `${commissionPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{commissionPct}% of monthly commission target</p>
        </CardContent>
      </Card>

      {/* Today's beat progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-accent" /> Today's Beat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-lg font-bold">{totalOutlets}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Route</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">{visited}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Visited</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">{productive}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Orders</p>
            </div>
            <div>
              <p className="text-lg font-bold text-accent">{strikeRate}%</p>
              <p className="text-[10px] text-muted-foreground uppercase">Strike</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">LPC: <span className="font-semibold text-foreground">{lpc}</span></span>
            <span className="text-muted-foreground">Today's value: <span className="font-semibold text-foreground">₹{orderTotal.toLocaleString('en-IN')}</span></span>
          </div>
        </CardContent>
      </Card>

      {/* Target gauge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-accent" /> Monthly Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex justify-between text-sm">
            <span>₹{target.achieved.toLocaleString('en-IN')}</span>
            <span className="text-muted-foreground">₹{target.monthlyTarget.toLocaleString('en-IN')}</span>
          </div>
          <Progress value={targetPct} className="h-3" />
          <p className="mt-2 text-xs text-muted-foreground">
            {targetPct}% achieved · ₹{Math.max(0, Math.round((target.monthlyTarget - target.achieved) / 20)).toLocaleString('en-IN')}/day to hit target
          </p>
        </CardContent>
      </Card>

      {/* Field vs tele */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-accent" /> Field vs Tele-Call
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-green-500" style={{ width: `${(fieldOrders + teleOrders) ? (fieldOrders / (fieldOrders + teleOrders)) * 100 : 0}%` }} />
            <div className="h-full bg-blue-500" style={{ width: `${(fieldOrders + teleOrders) ? (teleOrders / (fieldOrders + teleOrders)) * 100 : 0}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Field {fieldOrders}</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Tele {teleOrders}</span>
          </div>
        </CardContent>
      </Card>

      {/* Bonus today */}
      <Card className="bg-accent/5 border-accent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-accent" /> Bonus Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-accent">₹{bonusToday.toLocaleString('en-IN')}</p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Base commission (2%)</span><span>₹{baseCommission.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span>Field visit bonus</span><span>₹{fieldBonus.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span>Scheme achievement</span><span>₹{schemeBonus.toLocaleString('en-IN')}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Top focus SKUs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🔥 Top 5 Focus SKUs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {focusSKUs.map(f => {
              const p = getProductById(f.productId);
              if (!p) return null;
              return (
                <div key={f.productId} className="min-w-[180px] rounded-lg border bg-card p-3">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">₹{p.price}</p>
                  <Badge variant="secondary" className="mt-2 text-[10px] whitespace-normal">{f.bonus}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Red flag list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Collection Today</span>
            <span className="text-sm font-bold text-destructive">₹{totalDues.toLocaleString('en-IN')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dueOutlets.length === 0 && <p className="text-sm text-muted-foreground">No outstanding collections 🎉</p>}
          {dueOutlets.slice(0, 4).map(({ vendor, dues }) => (
            <button
              key={vendor.id}
              onClick={() => navigate(`/salesman/vendors/${vendor.id}`)}
              className="flex w-full items-center justify-between rounded-lg border p-2 text-left text-sm hover:bg-secondary/50"
            >
              <span className="truncate">{vendor.name}</span>
              <span className="font-semibold text-destructive">₹{dues.toLocaleString('en-IN')}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
