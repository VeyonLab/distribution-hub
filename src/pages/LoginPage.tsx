import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, User, Users, ShieldCheck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { users } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const roleIcons = {
  super_admin: ShieldCheck,
  manager: Users,
  salesman: Package,
  driver: Truck,
};

const roleLabels = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  salesman: 'Salesman',
  driver: 'Driver',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(email)) {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        navigateToRoleHome(user.role);
      }
    } else {
      toast({
        title: 'Login Failed',
        description: 'User not found. Try one of the demo accounts below.',
        variant: 'destructive',
      });
    }
  };

  const navigateToRoleHome = (role: string) => {
    switch (role) {
      case 'super_admin':
        navigate('/admin');
        break;
      case 'manager':
        navigate('/manager');
        break;
      case 'salesman':
        navigate('/salesman');
        break;
      case 'driver':
        navigate('/driver');
        break;
      default:
        navigate('/');
    }
  };

  const quickLogin = (userEmail: string) => {
    if (login(userEmail)) {
      const user = users.find(u => u.email === userEmail);
      if (user) {
        navigateToRoleHome(user.role);
      }
    }
  };

  // Group users by role for quick login
  const demoUsers = users.filter(u => u.tenantId === 'tenant-1' || u.role === 'super_admin');

  return (
    <div className="flex min-h-screen flex-col bg-primary">
      {/* Header */}
      <div className="flex flex-col items-center justify-center px-6 pt-12 pb-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
          <Truck className="h-8 w-8 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-primary-foreground">Distribution System</h1>
        <p className="mt-1 text-sm text-primary-foreground/70">Streamline your delivery operations</p>
      </div>

      {/* Login Card */}
      <div className="flex-1 rounded-t-3xl bg-background px-6 pt-8 pb-8">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />
          </div>
          <Button type="submit" className="h-12 w-full text-base">
            Sign In
          </Button>
        </form>

        {/* Quick Login Section */}
        <div className="mt-8">
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Or try a demo account
          </p>
          <div className="space-y-3">
            {demoUsers.map((user) => {
              const Icon = roleIcons[user.role];
              return (
                <Card
                  key={user.id}
                  className="cursor-pointer transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
                  onClick={() => quickLogin(user.email)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {roleLabels[user.role]}
                        {user.tenantId && ' • Alpha Distributors'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
