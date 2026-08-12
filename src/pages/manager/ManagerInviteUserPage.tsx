import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Shield } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useBasePath } from '@/hooks/useBasePath';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

const invitableRoles: { value: UserRole; label: string; description: string }[] = [
  { value: 'manager', label: 'Manager', description: 'Can manage requests, trips, and team' },
  { value: 'salesman', label: 'Salesman', description: 'Can create vendor requests' },
  { value: 'driver', label: 'Driver', description: 'Can view and complete deliveries' },
];

export default function ManagerInviteUserPage() {
  const { tenant } = useAuth();
  const navigate = useNavigate();
  const basePath = useBasePath();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !selectedRole) {
      toast({
        title: 'Missing Information',
        description: 'Please enter an email and select a role.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Invitation Sent',
      description: `Invitation sent to ${email} (UI demo only)`,
    });

    setIsLoading(false);
    navigate(`${basePath}/team`);
  };

  if (!tenant) return null;

  return (
    <MobileLayout
      header={<PageHeader title="Invite User" subtitle={tenant.name} showBack showLogout />}
    >
      <div className="p-4">
        <form onSubmit={handleInvite} className="space-y-6">
          {/* Email Input */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-accent" />
                Email Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
              <p className="mt-2 text-xs text-muted-foreground">
                An invitation email will be sent to this address
              </p>
            </CardContent>
          </Card>

          {/* Role Picker */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-accent" />
                Select Role
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invitableRoles.map((role) => (
                <div
                  key={role.value}
                  className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    selectedRole === role.value 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  onClick={() => setSelectedRole(role.value)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      selectedRole === role.value 
                        ? 'border-accent bg-accent' 
                        : 'border-muted-foreground'
                    }`}>
                      {selectedRole === role.value && (
                        <div className="h-2 w-2 rounded-full bg-accent-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{role.label}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={isLoading || !email || !selectedRole}
          >
            <UserPlus className="h-4 w-4" />
            {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
}
