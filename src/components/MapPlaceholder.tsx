import { MapPin } from 'lucide-react';

interface MapPlaceholderProps {
  latitude: number;
  longitude: number;
  name?: string;
}

export function MapPlaceholder({ latitude, longitude, name }: MapPlaceholderProps) {
  return (
    <div className="relative flex h-48 w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-secondary/50">
      {/* Grid pattern for map feel */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--muted-foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--muted-foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Center marker */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent shadow-lg">
          <MapPin className="h-6 w-6 text-accent-foreground" />
        </div>
        {name && (
          <p className="mb-1 text-sm font-medium">{name}</p>
        )}
        <p className="rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      </div>

      {/* Map placeholder label */}
      <p className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm">
        Map Preview
      </p>
    </div>
  );
}
