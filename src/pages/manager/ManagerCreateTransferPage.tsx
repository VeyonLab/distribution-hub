import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Plus, Minus, Send } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useBasePath } from '@/hooks/useBasePath';
import { useToast } from '@/hooks/use-toast';
import { getBranchesByTenant, getProductsByBranch, getBranchById } from '@/data/mockData';

interface TransferItem {
  productName: string;
  quantity: number;
  unit: string;
}

export default function ManagerCreateTransferPage() {
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();
  const basePath = useBasePath();
  const { toast } = useToast();

  const [toBranchId, setToBranchId] = useState<string>('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<TransferItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!tenant || !branch) return null;

  // Get other branches in the same tenant
  const otherBranches = getBranchesByTenant(tenant.id).filter(b => b.id !== branch.id && b.status === 'active');
  
  // Products from the selected target branch (what they might have)
  const toBranch = toBranchId ? getBranchById(toBranchId) : null;
  // Products from our branch (what we need)
  const ourProducts = getProductsByBranch(branch.id).filter(p => p.status === 'active');

  const addItem = () => {
    setItems([...items, { productName: '', quantity: 1, unit: '' }]);
  };

  const updateItem = (index: number, field: keyof TransferItem, value: string | number) => {
    const updated = [...items];
    if (field === 'productName') {
      const product = ourProducts.find(p => p.name === value);
      updated[index] = { ...updated[index], productName: value as string, unit: product?.unit || '' };
    } else {
      (updated[index] as any)[field] = value;
    }
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!toBranchId || items.length === 0 || items.some(i => !i.productName || i.quantity <= 0)) {
      toast({ title: 'Incomplete form', description: 'Please select a branch, add items, and fill all fields.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    
    toast({ 
      title: 'Transfer request sent', 
      description: `Request sent to ${toBranch?.name} for ${items.length} item(s).` 
    });
    setIsLoading(false);
    navigate(`${basePath}`);
  };

  return (
    <MobileLayout
      header={
        <PageHeader 
          title="Request Stock Transfer" 
          subtitle={`From: ${branch.name}`}
          showBack 
          showLogout 
        />
      }
    >
      <div className="space-y-4 p-4">
        {/* Target Branch */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transfer From Branch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Select Source Branch</Label>
              <Select value={toBranchId} onValueChange={setToBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a branch to request from..." />
                </SelectTrigger>
                <SelectContent>
                  {otherBranches.map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} — {b.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {otherBranches.length === 0 && (
              <p className="text-sm text-muted-foreground">No other branches available in your distributor.</p>
            )}
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              Items Needed
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No items added yet. Click "Add Item" to start.
              </p>
            ) : (
              items.map((item, index) => (
                <div key={index} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeItem(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select value={item.productName} onValueChange={v => updateItem(index, 'productName', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ourProducts.map(p => (
                        <SelectItem key={p.id} value={p.name}>{p.name} ({p.unit})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs whitespace-nowrap">Qty:</Label>
                    <Input 
                      type="number" 
                      min={1} 
                      value={item.quantity} 
                      onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} 
                      className="h-9"
                    />
                    {item.unit && <span className="text-xs text-muted-foreground whitespace-nowrap">{item.unit}</span>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Note */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Note (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="e.g. Running low on rice, need urgent restock..." 
              value={note} 
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <Button 
          className="w-full gap-2" 
          size="lg"
          disabled={isLoading || !toBranchId || items.length === 0}
          onClick={handleSubmit}
        >
          <Send className="h-5 w-5" />
          {isLoading ? 'Sending...' : 'Send Transfer Request'}
        </Button>
      </div>
    </MobileLayout>
  );
}
