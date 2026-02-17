import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function OwnerAddBranchPage() {
  const navigate = useNavigate();
  const { tenant } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    toast({ title: 'Branch created', description: `${name} has been added successfully.` });
    navigate('/owner/branches');
  };

  return (
    <MobileLayout header={<PageHeader title="Add Branch" subtitle={tenant?.name || ''} showBack showLogout />}>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input id="name" placeholder="e.g. Andheri Depot" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Full address" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
          </CardContent>
        </Card>
        <Button type="submit" className="w-full">Create Branch</Button>
      </form>
    </MobileLayout>
  );
}
