import { ArrowLeft, Trophy, Target, Clock, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { staffKPIs } from '@/data/adminMockData';

export default function OwnerScorecardPage() {
  const navigate = useNavigate();
  const sorted = [...staffKPIs].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/owner')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold">KPI Scorecard</h1>
          <p className="text-xs text-muted-foreground">Live staff leaderboard</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {sorted.map((s, idx) => (
          <Card key={s.id} className={idx === 0 ? 'border-amber-400 bg-amber-50/50' : ''}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    idx === 0 ? 'bg-amber-400 text-amber-950' :
                    idx === 1 ? 'bg-slate-300 text-slate-800' :
                    idx === 2 ? 'bg-orange-300 text-orange-950' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {idx === 0 ? <Trophy className="h-4 w-4" /> : `#${idx + 1}`}
                  </div>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <Badge variant="outline" className="text-[10px] capitalize">{s.role}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{s.score}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Score</p>
                </div>
              </div>
              <Progress value={s.score} className="h-1.5" />
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded bg-secondary/50 p-2 text-center">
                  <Target className="mx-auto mb-1 h-3 w-3 text-emerald-600" />
                  <p className="font-semibold">{s.strikeRate}%</p>
                  <p className="text-[10px] text-muted-foreground">Strike Rate</p>
                </div>
                <div className="rounded bg-secondary/50 p-2 text-center">
                  <Clock className="mx-auto mb-1 h-3 w-3 text-blue-600" />
                  <p className="font-semibold">+{s.punctualityMin}m</p>
                  <p className="text-[10px] text-muted-foreground">First Drop</p>
                </div>
                <div className="rounded bg-secondary/50 p-2 text-center">
                  <Wallet className="mx-auto mb-1 h-3 w-3 text-amber-600" />
                  <p className="font-semibold">{s.cashAccuracy}%</p>
                  <p className="text-[10px] text-muted-foreground">{s.discrepancies} disc.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
