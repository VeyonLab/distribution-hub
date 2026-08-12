import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Upload, Save } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function OwnerSettingsPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState(tenant?.name || '');
  const [address, setAddress] = useState(tenant?.address || '');
  const [gstNumber, setGstNumber] = useState(tenant?.gstNumber || '');
  const [panNumber, setPanNumber] = useState(tenant?.panNumber || '');
  const [logoPreview, setLogoPreview] = useState<string | null>(tenant?.logo || null);
  const [isLoading, setIsLoading] = useState(false);

  if (!tenant) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Logo must be under 2MB', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ title: 'Name required', description: 'Distributor name cannot be empty', variant: 'destructive' });
      return;
    }
    if (gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.trim())) {
      toast({ title: 'Invalid GST', description: 'Please enter a valid 15-digit GSTIN', variant: 'destructive' });
      return;
    }
    if (panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.trim())) {
      toast({ title: 'Invalid PAN', description: 'Please enter a valid 10-character PAN', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: 'Settings saved', description: 'Distributor details updated successfully. (UI demo only)' });
    }, 500);
  };

  return (
    <MobileLayout
      header={<PageHeader title="Business Settings" subtitle={tenant.name} showBack showLogout />}
    >
      <form onSubmit={handleSave} className="space-y-4 p-4">
        {/* Logo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-accent" />
              Company Logo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-secondary">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </div>
                </Label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG or WebP. Max 2MB.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter company name"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Registered Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter registered address"
                rows={3}
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tax & Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gst">GSTIN</Label>
              <Input
                id="gst"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 27AABCT1234F1ZH"
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground">15-digit GST Identification Number</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan">PAN</Label>
              <Input
                id="pan"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="e.g. AABCT1234F"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">10-character Permanent Account Number</p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full gap-2" disabled={isLoading}>
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </MobileLayout>
  );
}