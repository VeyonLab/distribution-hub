import { useParams, useNavigate } from 'react-router-dom';
import { Store, MapPin, Phone, Navigation, Edit } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { useAuth } from '@/contexts/AuthContext';
import { useBasePath } from '@/hooks/useBasePath';
import { getVendorById } from '@/data/mockData';

export default function ManagerVendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const basePath = useBasePath();

  const vendor = vendorId ? getVendorById(vendorId) : null;

  if (!vendor || vendor.tenantId !== tenant?.id) {
    return (
      <MobileLayout
        header={<PageHeader title="Vendor Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Store className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Vendor not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(`${basePath}/vendors`)}>
            Go Back
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      header={<PageHeader title="Vendor Details" subtitle={tenant?.name} showBack showLogout />}
    >
      <div className="space-y-4 p-4">
        {/* Vendor Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <Store className="h-10 w-10 text-secondary-foreground" />
              </div>
              <h2 className="text-xl font-bold">{vendor.name}</h2>
            </div>
          </CardContent>
        </Card>

        {/* Map Preview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-4 w-4 text-accent" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MapPlaceholder 
              latitude={vendor.latitude} 
              longitude={vendor.longitude}
              name={vendor.name}
            />
          </CardContent>
        </Card>

        {/* Contact & Address */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="font-medium">{vendor.address}</p>
              </div>
            </div>
            
            {vendor.contactPhone && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{vendor.contactPhone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coordinates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Geo Coordinates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary p-3 text-center">
                <p className="text-xs text-muted-foreground">Latitude</p>
                <p className="font-mono font-medium">{vendor.latitude.toFixed(6)}</p>
              </div>
              <div className="rounded-lg bg-secondary p-3 text-center">
                <p className="text-xs text-muted-foreground">Longitude</p>
                <p className="font-mono font-medium">{vendor.longitude.toFixed(6)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Button */}
        <Button 
          className="w-full gap-2"
          onClick={() => navigate(`/manager/vendors/${vendor.id}/edit`)}
        >
          <Edit className="h-4 w-4" />
          Edit Vendor
        </Button>
      </div>
    </MobileLayout>
  );
}
