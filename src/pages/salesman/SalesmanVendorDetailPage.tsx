import { useParams, useNavigate } from 'react-router-dom';
import { Store, MapPin, Phone, AlertCircle, History, Truck, PhoneCall } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getVendorById } from '@/data/mockData';
import { getVendorDues, lastOrders } from '@/data/salesmanMockData';
import { getProductById } from '@/data/mockData';

export default function SalesmanVendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { tenant } = useAuth();
  const navigate = useNavigate();

  const vendor = vendorId ? getVendorById(vendorId) : null;

  if (!vendor || vendor.tenantId !== tenant?.id) {
    return (
      <MobileLayout header={<PageHeader title="Outlet Not Found" showBack showLogout />}>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Store className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <p className="font-medium">Outlet not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/salesman/vendors')}>Go Back</Button>
        </div>
      </MobileLayout>
    );
  }

  const dues = getVendorDues(vendor.id);
  const last = lastOrders[vendor.id] ?? [];

  return (
    <MobileLayout header={<PageHeader title="Outlet" subtitle={vendor.name} showBack showLogout />}>
      <div className="space-y-4 p-4 pb-32">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Store className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold truncate">{vendor.name}</h2>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {vendor.address}
                </p>
                {vendor.contactPhone && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {vendor.contactPhone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {dues > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Outstanding Dues</p>
                  <p className="text-xs text-muted-foreground">Collect during visit</p>
                </div>
              </div>
              <p className="text-xl font-bold text-destructive">₹{dues.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4" /> Last Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            {last.length === 0 ? (
              <p className="text-sm text-muted-foreground">No previous orders</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {last.map((i, idx) => {
                  const p = getProductById(i.productId);
                  return (
                    <li key={idx} className="flex justify-between">
                      <span>{p?.name ?? '—'}</span>
                      <span className="text-muted-foreground">x{i.quantity}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Choose Visit Mode</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button
              size="lg"
              className="h-auto justify-start gap-3 py-4"
              onClick={() => navigate(`/salesman/visit/${vendor.id}/field`)}
            >
              <Truck className="h-6 w-6" />
              <div className="text-left">
                <p className="font-semibold">Physical Visit</p>
                <p className="text-xs opacity-90">GPS verified · 100% incentive</p>
              </div>
              <Badge variant="secondary" className="ml-auto">+Bonus</Badge>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-auto justify-start gap-3 py-4"
              onClick={() => navigate(`/salesman/visit/${vendor.id}/tele`)}
            >
              <PhoneCall className="h-6 w-6" />
              <div className="text-left">
                <p className="font-semibold">Tele-Call Order</p>
                <p className="text-xs text-muted-foreground">Reason code required</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
