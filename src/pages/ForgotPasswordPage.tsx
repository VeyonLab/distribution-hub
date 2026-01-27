import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsLoading(false);
    
    toast({
      title: 'Reset Link Sent',
      description: 'If an account exists with this email, you will receive a reset link.',
    });
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col bg-primary">
        {/* Header */}
        <div className="flex flex-col items-center justify-center px-6 pt-16 pb-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            <Mail className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Check Your Email</h1>
          <p className="mt-1 text-sm text-primary-foreground/70">We've sent a password reset link</p>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-t-3xl bg-background px-6 pt-8 pb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="mb-4 text-muted-foreground">
                We sent a password reset link to:
              </p>
              <p className="mb-6 font-medium">{email}</p>
              <p className="mb-6 text-sm text-muted-foreground">
                Click the link in your email to reset your password. 
                If you don't see it, check your spam folder.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                Try a different email
              </Button>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-primary">
      {/* Header */}
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
          <Truck className="h-8 w-8 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-primary-foreground">Forgot Password?</h1>
        <p className="mt-1 text-sm text-primary-foreground/70">Enter your email to reset</p>
      </div>

      {/* Form */}
      <div className="flex-1 rounded-t-3xl bg-background px-6 pt-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <Button 
            type="submit" 
            className="h-12 w-full text-base"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
