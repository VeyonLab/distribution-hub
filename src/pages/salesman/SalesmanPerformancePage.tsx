import { useAuth } from '@/contexts/AuthContext';
import { useSalesman } from '@/contexts/SalesmanContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSalesmanTarget } from '@/data/salesmanMockData';
import { getVendorById } from '@/data/mockData';
import { Trophy, MapPin } from 'lucide-react';

export default function SalesmanPerformancePage() {
  const { user } = useAuth();
  const { visits } = useSalesman();
  if (!user) return null;
  const target = getSalesmanTarget(user.id);

  const productive = visits.filter(v => v.productive);
  const best = [...productive].sort((a, b) => b.orderValue - a.orderValue)[0];
  const bestVendor = best ? getVendorById(best.vendorId) : null;

  return (
    <div className="space-y-4 p-4 pb-24">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Achieved</span><span className="font-semibold">₹{target.achieved.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Target</span><span>₹{target.monthlyTarget.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Commission</span><span className="font-semibold text-accent">₹{target.commissionEarned.toLocaleString('en-IN')}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Today</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-center text-sm">
          <div className="rounded-lg bg-secondary/40 p-3">
            <p className="text-2xl font-bold">{visits.length}</p>
            <p className="text-xs text-muted-foreground">Visits</p>
          </div>
          <div className="rounded-lg bg-secondary/40 p-3">
            <p className="text-2xl font-bold text-green-600">{productive.length}</p>
            <p className="text-xs text-muted-foreground">Productive</p>
          </div>
          <div className="rounded-lg bg-secondary/40 p-3">
            <p className="text-2xl font-bold">₹{productive.reduce((s, v) => s + v.orderValue, 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground">Order Value</p>
          </div>
          <div className="rounded-lg bg-secondary/40 p-3">
            <p className="text-2xl font-bold">{visits.filter(v => v.mode === 'field').length} / {visits.filter(v => v.mode === 'tele').length}</p>
            <p className="text-xs text-muted-foreground">Field / Tele</p>
          </div>
        </CardContent>
      </Card>

      {best && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-yellow-500" /> Best Outlet Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{bestVendor?.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {bestVendor?.address}
            </p>
            <p className="mt-1 text-sm text-accent">₹{best.orderValue.toLocaleString('en-IN')} · {best.linesCount} lines</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
