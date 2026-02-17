import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Save, MapPin, Phone } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { useAuth } from '@/contexts/AuthContext';
import { useBasePath } from '@/hooks/useBasePath';
import { useToast } from '@/hooks/use-toast';

export default function ManagerAddVendorPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const basePath = useBasePath();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState('19.0760');
  const [longitude, setLongitude] = useState('72.8777');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !address.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter vendor name and address.',
        variant: 'destructive',
      });
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({
        title: 'Invalid Coordinates',
        description: 'Please enter valid latitude (-90 to 90) and longitude (-180 to 180).',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    toast({
      title: 'Vendor Added',
      description: `${name} has been added. (UI demo only)`,
    });

    setIsLoading(false);
    navigate(`${basePath}/vendors`);
  };

  if (!tenant) return null;

  const lat = parseFloat(latitude) || 19.0760;
  const lng = parseFloat(longitude) || 72.8777;

  return (
    <MobileLayout
      header={<PageHeader title="Add Vendor" subtitle={tenant.name} showBack showLogout />}
    >
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Store className="h-4 w-4 text-accent" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vendor Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sharma General Store"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., 12 MG Road, Andheri West"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+91 22 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-accent" />
                Location Coordinates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="19.0760"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="h-12 font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="72.8777"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="h-12 font-mono"
                    required
                  />
                </div>
              </div>
              <MapPlaceholder latitude={lat} longitude={lng} name={name || 'New Vendor'} />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={isLoading || !name.trim() || !address.trim()}
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Adding Vendor...' : 'Add Vendor'}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}
