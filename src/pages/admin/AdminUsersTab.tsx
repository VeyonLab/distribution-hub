import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { tenants, getAllTenantUsers, getTenantById } from '@/data/mockData';
import { UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  tenant_owner: 'Distributor Admin',
  manager: 'Manager',
  salesman: 'Salesman',
  driver: 'Driver',
};

export default function AdminUsersTab() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const allUsers = getAllTenantUsers();

  const filteredUsers = allUsers.filter(user => {
    return user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeCount = filteredUsers.filter(u => u.status === 'active').length;
  const inactiveCount = filteredUsers.filter(u => u.status === 'inactive').length;

  return (
    <div className="space-y-4 p-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-foreground">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-muted-foreground">{inactiveCount}</p>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {filteredUsers.length} users found
        </p>
        {filteredUsers.map((user) => {
          const tenant = getTenantById(user.tenantId);
          return (
            <Card 
              key={user.id}
              className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.99]"
              onClick={() => navigate(`/admin/users/${user.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <Users className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name}</p>
                      <span className={`inline-flex h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-status-success' : 'bg-muted-foreground'}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded bg-secondary px-1.5 py-0.5 font-medium capitalize">
                        {roleLabels[user.role]}
                      </span>
                      {tenant && <span>• {tenant.name}</span>}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          );
        })}

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No users found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
