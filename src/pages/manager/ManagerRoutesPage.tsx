import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route as RouteIcon, ChevronRight, Plus, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getRoutesByTenant, getVendorById } from '@/data/mockData';

export default function ManagerRoutesPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();

  if (!tenant) return null;

  const routes = getRoutesByTenant(tenant.id);

  return (
    <div className="space-y-4 p-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {routes.length} routes
        </p>
        <Button size="sm" className="gap-1" onClick={() => navigate('/manager/routes/create')}>
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </div>

      {/* Routes List */}
      <div className="space-y-3">
        {routes.map((route) => {
          const vendorNames = route.vendorIds
            .map(id => getVendorById(id)?.name || 'Unknown')
            .slice(0, 3);
          
          return (
            <Card 
              key={route.id}
              className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.99]"
              onClick={() => navigate(`/manager/routes/${route.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <RouteIcon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">{route.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {route.vendorIds.length} stops
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                
                {/* Vendor stops preview */}
                <div className="mt-3 space-y-1">
                  {vendorNames.map((name, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium">
                        {index + 1}
                      </div>
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{name}</span>
                    </div>
                  ))}
                  {route.vendorIds.length > 3 && (
                    <p className="pl-7 text-xs text-muted-foreground">
                      +{route.vendorIds.length - 3} more stops
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {routes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <RouteIcon className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No routes created</p>
              <p className="text-sm text-muted-foreground">
                Create your first delivery route
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
