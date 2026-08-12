import { useEffect, useState } from 'react';
import { Truck, User } from 'lucide-react';
import { liveVans, liveSalesmen, VanTelematic, SalesmanPing } from '@/data/adminMockData';

export function LiveVanMap() {
  const [vans, setVans] = useState<VanTelematic[]>(liveVans);
  const [salesmen, setSalesmen] = useState<SalesmanPing[]>(liveSalesmen);

  useEffect(() => {
    const t = setInterval(() => {
      setVans(prev => prev.map(v => v.status === 'at_stop' ? v : ({
        ...v,
        latPct: Math.max(5, Math.min(95, v.latPct + (Math.random() * 4 - 2))),
        lngPct: Math.max(5, Math.min(95, v.lngPct + (Math.random() * 4 - 2))),
      })));
      setSalesmen(prev => prev.map(s => s.status === 'idle' ? s : ({
        ...s,
        latPct: Math.max(5, Math.min(95, s.latPct + (Math.random() * 3 - 1.5))),
        lngPct: Math.max(5, Math.min(95, s.lngPct + (Math.random() * 3 - 1.5))),
      })));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg border bg-secondary/30">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--muted-foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--muted-foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />
      {/* Hub marker */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground shadow-md">
          DEPOT
        </div>
      </div>

      {/* Vans */}
      {vans.map(v => (
        <div
          key={v.id}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
          style={{ left: `${v.lngPct}%`, top: `${v.latPct}%` }}
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg ring-2 ring-background ${
            v.status === 'at_stop' ? 'bg-amber-500' : v.status === 'returning' ? 'bg-emerald-500' : 'bg-accent'
          }`}>
            <Truck className="h-4 w-4 text-white" />
          </div>
          <p className="mt-1 whitespace-nowrap rounded bg-background/90 px-1.5 py-0.5 text-[9px] font-medium shadow">
            {v.vehicleNo.slice(-4)}
          </p>
        </div>
      ))}

      {/* Salesmen */}
      {salesmen.map(s => (
        <div
          key={s.id}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
          style={{ left: `${s.lngPct}%`, top: `${s.latPct}%` }}
        >
          <div className={`flex h-6 w-6 items-center justify-center rounded-full shadow-lg ring-2 ring-background ${
            s.status === 'visiting' ? 'bg-blue-500' : s.status === 'tele' ? 'bg-purple-500' : 'bg-slate-400'
          }`}>
            <User className="h-3 w-3 text-white" />
          </div>
        </div>
      ))}

      <div className="absolute bottom-2 left-2 flex gap-2 text-[10px]">
        <span className="rounded bg-background/90 px-2 py-0.5 shadow">🚚 {vans.length} vans</span>
        <span className="rounded bg-background/90 px-2 py-0.5 shadow">👤 {salesmen.length} salesmen</span>
      </div>
      <div className="absolute right-2 top-2">
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          LIVE
        </span>
      </div>
    </div>
  );
}
