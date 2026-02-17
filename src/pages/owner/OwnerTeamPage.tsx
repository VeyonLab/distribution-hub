import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getUsersByTenant, getBranchById } from '@/data/mockData';
import { UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  tenant_owner: 'Distributor Admin',
  manager: 'Manager',
  salesman: 'Salesman',
  driver: 'Driver',
};

export default function OwnerTeamPage() {
  const { tenant, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  if (!tenant) return null;

  const allMembers = getUsersByTenant(tenant.id).filter(u => u.id !== user?.id);
  const filtered = allMembers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4">
      <Input
        placeholder="Search by name, email or role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <p className="text-sm text-muted-foreground">
        {filtered.length} member{filtered.length !== 1 ? 's' : ''} across all branches
      </p>

      <div className="space-y-2">
        {filtered.map(member => {
          const branch = member.branchId ? getBranchById(member.branchId) : null;
          return (
            <Card 
              key={member.id}
              className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
              onClick={() => navigate(`/owner/team/${member.id}`)}
            >
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                    {branch && (
                      <p className="text-xs text-accent">{branch.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                    {roleLabels[member.role]}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
