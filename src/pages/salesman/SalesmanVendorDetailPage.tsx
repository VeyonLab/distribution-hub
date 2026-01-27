import { useParams, useNavigate } from 'react-router-dom';
import { Store, MapPin, Phone, Plus } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getVendorById } from '@/data/mockData';

export default function SalesmanVendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { tenant } = useAuth();
  const navigate = useNavigate();

  const vendor = vendorId ? getVendorById(vendorId) : null;

  if (!vendor || vendor.tenantId !== tenant?.id) {
    return (
      <MobileLayout
        header={<PageHeader title="Vendor Not Found" showBack showLogout />}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Store className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Vendor not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/salesman/vendors')}>
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

        {/* Contact Info */}
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

        {/* Create Request Button */}
        <Button 
          className="w-full gap-2 h-14 text-base"
          onClick={() => navigate(`/salesman/create/${vendor.id}`)}
        >
          <Plus className="h-5 w-5" />
          Create Request for this Vendor
        </Button>
      </div>
    </MobileLayout>
  );
}
