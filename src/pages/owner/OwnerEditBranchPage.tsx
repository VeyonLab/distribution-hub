import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getBranchById } from '@/data/mockData';

export default function OwnerEditBranchPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const branch = branchId ? getBranchById(branchId) : null;

  const [name, setName] = useState(branch?.name || '');
  const [address, setAddress] = useState(branch?.address || '');

  if (!branch) {
    return (
      <MobileLayout header={<PageHeader title="Branch Not Found" showBack showLogout />}>
        <div className="p-8 text-center">
          <p>Branch not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/owner/branches')}>Go Back</Button>
        </div>
      </MobileLayout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Branch updated', description: `${name} has been updated.` });
    navigate(`/owner/branches/${branch.id}`);
  };

  return (
    <MobileLayout header={<PageHeader title="Edit Branch" subtitle={branch.name} showBack showLogout />}>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
          </CardContent>
        </Card>
        <Button type="submit" className="w-full">Save Changes</Button>
      </form>
    </MobileLayout>
  );
}
