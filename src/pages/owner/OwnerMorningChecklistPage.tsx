import { useState } from 'react';
import { ArrowLeft, Package, Truck, FileWarning, ThumbsUp, CheckCircle2, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: typeof Package;
  action: string;
  route: string;
}

const steps: Step[] = [
  { id: 'stock', title: 'Check Stock', description: 'Are we low on top-sellers? Order from company.', icon: Package, action: 'View Inventory', route: '/owner/aging-stock' },
  { id: 'route', title: 'Review Routes', description: 'Are all vans loaded and moving?', icon: Truck, action: 'Open Live Map', route: '/owner/pulse' },
  { id: 'tickets', title: 'Resolve Tickets', description: 'Any issues from yesterday needing a phone call?', icon: FileWarning, action: 'View Tickets', route: '/owner/pulse' },
  { id: 'overrides', title: 'Approve Overrides', description: 'Salesmen waiting for discount approvals.', icon: ThumbsUp, action: 'Review Requests', route: '/owner/requests' },
];

export default function OwnerMorningChecklistPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [done, setDone] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const s = new Set(done);
    s.has(id) ? s.delete(id) : s.add(id);
    setDone(s);
    if (s.size === steps.length) {
      toast({ title: 'Morning routine complete!', description: 'You\'re ready to coordinate the day. ☕' });
    }
  };

  const pct = (done.size / steps.length) * 100;

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/owner')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold">Morning Checklist</h1>
          <p className="text-xs text-muted-foreground">5-min coordinator routine</p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <Card className="bg-gradient-to-br from-accent/20 to-accent/5">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Coffee className="h-5 w-5 text-accent" />
              <p className="font-semibold">Good morning, Admin ☀️</p>
            </div>
            <Progress value={pct} className="h-2" />
            <p className="mt-1 text-xs text-muted-foreground">{done.size} of {steps.length} done</p>
          </CardContent>
        </Card>

        {steps.map((step, idx) => {
          const isDone = done.has(step.id);
          return (
            <Card key={step.id} className={isDone ? 'border-emerald-300 bg-emerald-50/40' : ''}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    isDone ? 'bg-emerald-500' : 'bg-accent/15'
                  }`}>
                    {isDone ? <CheckCircle2 className="h-5 w-5 text-white" /> : <step.icon className="h-5 w-5 text-accent" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{idx + 1}. {step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(step.route)}>
                    {step.action}
                  </Button>
                  <Button
                    size="sm"
                    variant={isDone ? 'secondary' : 'default'}
                    onClick={() => toggle(step.id)}
                  >
                    {isDone ? 'Undo' : 'Mark done'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
