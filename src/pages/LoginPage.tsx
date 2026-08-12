import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = login(email, password);
    
    if (result.success) {
      // Get the user to determine redirect
      const { user } = useAuth as any;
      navigateToRoleHome(email);
    } else {
      toast({
        title: 'Login Failed',
        description: result.error || 'Invalid credentials',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  };

  const navigateToRoleHome = (userEmail: string) => {
    if (userEmail === 'admin@system.com') {
      navigate('/admin');
    } else if (userEmail === 'anil@alpha.com') {
      navigate('/owner');
    } else if (userEmail.includes('rajesh') || userEmail.includes('vikram') || userEmail.includes('deepak')) {
      navigate('/manager');
    } else if (userEmail.includes('amit') || userEmail.includes('priya') || userEmail.includes('ravi')) {
      navigate('/salesman');
    } else if (userEmail.includes('suresh') || userEmail.includes('manoj')) {
      navigate('/driver');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-primary">
      {/* Header */}
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
          <Truck className="h-8 w-8 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-primary-foreground">Distribution System</h1>
        <p className="mt-1 text-sm text-primary-foreground/70">Streamline your delivery operations</p>
      </div>

      {/* Login Card */}
      <div className="flex-1 rounded-t-3xl bg-background px-6 pt-8 pb-8">
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link 
              to="/forgot-password" 
              className="text-sm text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="h-12 w-full text-base"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 rounded-lg bg-secondary p-4">
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            Demo Credentials
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Super Admin:</span>
              <span className="font-mono">admin@system.com / admin123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distributor Admin:</span>
              <span className="font-mono">anil@alpha.com / owner123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manager (Branch 1):</span>
              <span className="font-mono">rajesh@alpha.com / manager123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manager (Branch 2):</span>
              <span className="font-mono">deepak@alpha.com / manager123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Salesman (Branch 1):</span>
              <span className="font-mono">amit@alpha.com / sales123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Salesman (Branch 2):</span>
              <span className="font-mono">ravi@alpha.com / sales123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Driver (Branch 1):</span>
              <span className="font-mono">suresh@alpha.com / driver123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Driver (Branch 2):</span>
              <span className="font-mono">manoj@alpha.com / driver123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
