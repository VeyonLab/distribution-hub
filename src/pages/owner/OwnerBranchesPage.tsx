import { useNavigate } from 'react-router-dom';
import { GitBranch, ChevronRight, Plus, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { getBranchesByTenant, getUsersByBranch } from '@/data/mockData';

export default function OwnerBranchesPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();

  if (!tenant) return null;

  const tenantBranches = getBranchesByTenant(tenant.id);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {tenantBranches.length} branch{tenantBranches.length !== 1 ? 'es' : ''}
        </p>
        <Button size="sm" onClick={() => navigate('/owner/branches/add')}>
          <Plus className="mr-1 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <div className="space-y-3">
        {tenantBranches.map(branch => {
          const branchMembers = getUsersByBranch(branch.id);
          return (
            <Card 
              key={branch.id}
              className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
              onClick={() => navigate(`/owner/branches/${branch.id}`)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <GitBranch className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{branch.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {branch.address}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {branchMembers.length} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={branch.status} />
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
