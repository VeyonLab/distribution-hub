import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Camera } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDriverDay } from '@/contexts/DriverContext';
import { incidentTypes } from '@/data/driverMockData';

export default function DriverIncidentPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addIncident, incidents } = useDriverDay();
  const [type, setType] = useState<string>(incidentTypes[0]);
  const [desc, setDesc] = useState('');
  const [photoCaptured, setPhotoCaptured] = useState(false);

  const submit = () => {
    addIncident({
      id: `inc-${Date.now()}`,
      type,
      description: desc,
      gps: { lat: 19.1365, lng: 72.8296 }, // simulated
      photoData: photoCaptured ? 'captured' : undefined,
      reportedAt: new Date().toISOString(),
    });
    toast({ title: 'Incident reported', description: 'Manager has been notified.' });
    setDesc(''); setPhotoCaptured(false);
    navigate('/driver');
  };

  return (
    <MobileLayout header={<PageHeader title="Report incident" subtitle={tenant?.name} showBack showLogout />}>
      <div className="p-4 pb-24 space-y-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />New incident</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{incidentTypes.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="What happened?" />
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 text-xs flex items-center gap-2">
              <MapPin className="h-3 w-3" /> GPS auto-attached: 19.1365, 72.8296
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={() => { setPhotoCaptured(true); toast({ title: 'Photo captured (simulated)' }); }}>
              <Camera className="h-4 w-4" /> {photoCaptured ? 'Photo attached ✓' : 'Capture photo evidence'}
            </Button>
            <Button className="w-full" disabled={!desc} onClick={submit}>Submit report</Button>
          </CardContent>
        </Card>

        {incidents.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Today's reports</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {incidents.map(i => (
                <div key={i.id} className="rounded-lg border p-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{i.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(i.reportedAt).toLocaleTimeString()}</p>
                  </div>
                  <p className="text-sm mt-1">{i.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}
