import { FileText, Truck, Package, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getVendorRequestsByTenant, 
  getTripsByTenant, 
  getVendorsByTenant,
  getUsersByTenant
} from '@/data/mockData';

export default function ManagerDashboard() {
  const { tenant } = useAuth();
  const navigate = useNavigate();

  if (!tenant) return null;

  const requests = getVendorRequestsByTenant(tenant.id);
  const trips = getTripsByTenant(tenant.id);
  const vendors = getVendorsByTenant(tenant.id);
  const teamMembers = getUsersByTenant(tenant.id);

  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const todayRequests = requests.length;
  const activeTrips = trips.filter(t => t.status !== 'completed').length;

  const stats = [
    { 
      label: 'Pending Requests', 
      value: pendingRequests, 
      icon: FileText, 
      color: 'bg-amber-500',
      onClick: () => navigate('/manager/requests')
    },
    { 
      label: "Today's Requests", 
      value: todayRequests, 
      icon: Package, 
      color: 'bg-blue-500',
      onClick: () => navigate('/manager/requests')
    },
    { 
      label: 'Active Trips', 
      value: activeTrips, 
      icon: Truck, 
      color: 'bg-emerald-500',
      onClick: () => navigate('/manager/trips')
    },
    { 
      label: 'Team Members', 
      value: teamMembers.length, 
      icon: Users, 
      color: 'bg-purple-500',
      onClick: undefined
    },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label} 
            className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98] animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={stat.onClick}
          >
            <CardContent className="p-4">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
        <div className="space-y-3">
          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/manager/requests')}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-medium">Review Requests</p>
                <p className="text-sm text-muted-foreground">
                  {pendingRequests} pending for batching
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
            onClick={() => navigate('/manager/trips')}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <Truck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Manage Trips</p>
                <p className="text-sm text-muted-foreground">
                  Create and assign delivery trips
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-2 font-medium">Today's Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Vendors</span>
              <span className="font-medium">{vendors.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requests Created</span>
              <span className="font-medium">{todayRequests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deliveries Completed</span>
              <span className="font-medium">
                {trips.filter(t => t.status === 'completed').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
