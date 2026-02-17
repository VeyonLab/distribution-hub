import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getUsersByBranch } from '@/data/mockData';
import { UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  tenant_owner: 'Distributor Admin',
  manager: 'Manager',
  salesman: 'Salesman',
  driver: 'Driver',
};

export default function ManagerTeamPage() {
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();

  if (!tenant || !branch) return null;

  const teamMembers = getUsersByBranch(branch.id);
  const activeCount = teamMembers.filter(u => u.status === 'active').length;
  const inactiveCount = teamMembers.filter(u => u.status === 'inactive').length;

  return (
    <div className="space-y-4 p-4">
      {/* Header with Invite Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {teamMembers.length} team members
        </p>
        <Button size="sm" className="gap-1" onClick={() => navigate('/manager/team/invite')}>
          <UserPlus className="h-4 w-4" />
          Invite
        </Button>
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

      {/* Team List */}
      <div className="space-y-2">
        {teamMembers.map((user) => (
          <Card 
            key={user.id}
            className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.99]"
            onClick={() => navigate(`/manager/team/${user.id}`)}
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
                  <span className="mt-0.5 inline-block rounded bg-secondary px-1.5 py-0.5 text-xs font-medium capitalize">
                    {roleLabels[user.role]}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}

        {teamMembers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="font-medium">No team members</p>
              <p className="text-sm text-muted-foreground">
                Invite your first team member
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
