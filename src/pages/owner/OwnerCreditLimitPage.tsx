import { useState } from 'react';
import { ArrowLeft, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { creditOutlets as initial, CreditOutlet, formatINR } from '@/data/adminMockData';

export default function OwnerCreditLimitPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [outlets, setOutlets] = useState<CreditOutlet[]>(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const bulkLock = () => {
    setOutlets(o => o.map(x => selected.has(x.id) ? { ...x, locked: true } : x));
    toast({ title: 'Bulk lock applied', description: `${selected.size} outlets locked. Salesmen blocked from taking new orders.` });
    setSelected(new Set());
  };

  const toggleLock = (id: string) => {
    setOutlets(o => o.map(x => x.id === id ? { ...x, locked: !x.locked } : x));
  };

  const totalOverdue = outlets.reduce((s, o) => s + o.outstanding, 0);

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/owner')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold">Credit Limit Manager</h1>
          <p className="text-xs text-muted-foreground">Bad Payers • Bulk Lock</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{formatINR(totalOverdue)}</p>
              <p className="text-sm text-muted-foreground">Total overdue across {outlets.length} outlets</p>
            </div>
          </CardContent>
        </Card>

        {outlets.map(o => (
          <Card key={o.id}>
            <CardContent className="flex items-start gap-3 p-3">
              <Checkbox
                checked={selected.has(o.id)}
                onCheckedChange={() => toggle(o.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{o.name}</p>
                  {o.locked ? (
                    <Badge variant="destructive"><Lock className="mr-1 h-3 w-3" />Locked</Badge>
                  ) : (
                    <Badge className="bg-amber-500 hover:bg-amber-500">{o.daysOverdue}d overdue</Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Outstanding</p>
                    <p className="font-semibold">{formatINR(o.outstanding)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Limit</p>
                    <p className="font-semibold">{formatINR(o.creditLimit)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Terms</p>
                    <p className="font-semibold">{o.creditDays}d</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={() => toggleLock(o.id)}
                >
                  {o.locked ? <><Unlock className="mr-1 h-3 w-3" />Unlock</> : <><Lock className="mr-1 h-3 w-3" />Lock</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-3 shadow-lg">
          <Button variant="destructive" className="w-full" onClick={bulkLock}>
            <Lock className="mr-2 h-4 w-4" /> Bulk Lock {selected.size} Outlet{selected.size > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}
