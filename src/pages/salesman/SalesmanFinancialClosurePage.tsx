import { useMemo, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { IndianRupee, ArrowRight, Wallet } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSalesman } from '@/contexts/SalesmanContext';
import { getVendorById, getProductById } from '@/data/mockData';
import { calculateScheme, getVendorDues } from '@/data/salesmanMockData';

export default function SalesmanFinancialClosurePage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { draft, updateDraft } = useSalesman();

  const vendor = vendorId ? getVendorById(vendorId) : null;

  if (!vendor || !draft || draft.vendorId !== vendor.id) {
    return <Navigate to="/salesman/vendors" replace />;
  }

  const oldDues = getVendorDues(vendor.id);

  const totals = useMemo(() => {
    let subtotal = 0; let savings = 0;
    draft.cart.forEach(i => {
      const p = getProductById(i.productId); if (!p) return;
      subtotal += p.price * i.quantity;
      const sch = calculateScheme(i.productId, i.quantity);
      if (sch) savings += sch.discount;
    });
    return { subtotal, savings, net: subtotal - savings };
  }, [draft.cart]);

  const grand = oldDues + totals.net;

  const [pay, setPay] = useState<string>(String(draft.payAmount ?? ''));
  const [mode, setMode] = useState<string>(draft.payMode ?? 'Cash');
  const [date, setDate] = useState(draft.collectionDate ?? '');
  const [remarks, setRemarks] = useState(draft.remarks ?? '');

  const payNum = Number(pay) || 0;
  const partial = payNum < grand;
  const valid = pay.trim() !== '' && payNum >= 0 && payNum <= grand && (!partial || date);

  const proceed = () => {
    if (!valid) {
      toast({ title: 'Fill required fields', description: 'Enter payment promise (and collection date if partial).', variant: 'destructive' });
      return;
    }
    updateDraft({
      payAmount: payNum,
      payMode: mode as 'Cash' | 'QR Code' | 'Cheque',
      collectionDate: partial ? date : undefined,
      remarks,
    });
    navigate(`/salesman/invoice/${vendor.id}`);
  };

  return (
    <MobileLayout header={<PageHeader title="Financial Closure" subtitle={vendor.name} showBack showLogout />}>
      <div className="space-y-4 p-4 pb-32">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Wallet className="h-4 w-4" /> Balance Awareness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Old Dues</span><span className={oldDues > 0 ? 'font-semibold text-destructive' : ''}>₹{oldDues.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">New Order</span><span>₹{totals.net.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Grand Total</span><span>₹{grand.toLocaleString('en-IN')}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><IndianRupee className="h-4 w-4" /> Payment Promise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="pay">Amount to be paid (to driver) *</Label>
              <Input id="pay" type="number" min={0} max={grand} value={pay} onChange={(e) => setPay(e.target.value)} placeholder="0" />
              <p className="mt-1 text-xs text-muted-foreground">Enter 0 if no payment will be collected today</p>
            </div>
            <div>
              <Label>Payment Mode *</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="QR Code">QR Code</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {partial && (
              <div>
                <Label htmlFor="date">Balance Collection Date *</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <p className="mt-1 text-xs text-amber-600">Outstanding ₹{(grand - payNum).toLocaleString('en-IN')} to be collected later</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Remarks for Driver / Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder='e.g. "Owner will pay only half tomorrow", "Will settle full amount on Friday"'
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
          <div className="mx-auto max-w-md">
            <Button className="w-full h-12 gap-2" onClick={proceed} disabled={!valid}>
              Generate Invoice <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
