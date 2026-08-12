import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Package, Phone, Navigation, Check, MessageSquare, AlertTriangle,
  CreditCard, Wallet, QrCode as QrCodeIcon, FileText, RotateCcw, Pen, Camera, Tag,
} from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  getTripsByDriver, getVendorById, getVendorRequestById, getProductById,
} from '@/data/mockData';
import {
  computeInvoiceLines, getFreeGoodsForVendor, vendorOutstanding, fmtINR, issueReasons,
} from '@/data/driverMockData';
import { useDriverDay, PaymentMode, ChequeDetails } from '@/contexts/DriverContext';
import { useDriverDeliveryState } from '@/hooks/useDriverDeliveryState';

export default function DriverStopDetailPage() {
  const { stopId } = useParams<{ stopId: string }>();
  const { user, tenant } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { markDelivered } = useDriverDeliveryState();
  const { recordDelivery, deliveries } = useDriverDay();

  const trips = user ? getTripsByDriver(user.id) : [];
  const trip = trips.find(t => t.status !== 'completed');
  const stop = trip?.stops.find(s => s.id === stopId);
  const vendor = stop ? getVendorById(stop.vendorId) : null;

  const orderedItems = useMemo(() => {
    if (!stop) return [];
    const acc: Record<string, number> = {};
    stop.vendorRequestIds.forEach(rid => {
      const r = getVendorRequestById(rid);
      r?.items.forEach(it => { acc[it.productId] = (acc[it.productId] || 0) + it.quantity; });
    });
    return Object.entries(acc).map(([productId, quantity]) => ({ productId, quantity }));
  }, [stop]);

  // delivered qty edits
  const [deliveredQty, setDeliveredQty] = useState<Record<string, number>>({});
  useEffect(() => {
    const init: Record<string, number> = {};
    orderedItems.forEach(it => { init[it.productId] = it.quantity; });
    setDeliveredQty(init);
  }, [orderedItems.length]);

  // returns
  const [returns, setReturns] = useState<{ productId: string; qty: number; reason: string }[]>([]);
  const [retProd, setRetProd] = useState('');
  const [retQty, setRetQty] = useState('');
  const [retReason, setRetReason] = useState('Bad goods');

  // payments
  const [payMode, setPayMode] = useState<PaymentMode>('cash');
  const [payAmount, setPayAmount] = useState('');
  const [chequeBank, setChequeBank] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const [chequeDate, setChequeDate] = useState(new Date().toISOString().slice(0,10));
  const [payments, setPayments] = useState<{ mode: PaymentMode; amount: number; cheque?: ChequeDetails }[]>([]);

  // outstanding clearance
  const outstanding = vendor ? vendorOutstanding[vendor.id] : undefined;
  const [clearOld, setClearOld] = useState(0);

  // issue tag
  const [issueTag, setIssueTag] = useState<string>('');
  const [note, setNote] = useState('');

  // signature
  const sigRef = useRef<HTMLCanvasElement>(null);
  const [sigData, setSigData] = useState<string>('');
  const drawing = useRef(false);

  const startDraw = (e: React.PointerEvent) => {
    drawing.current = true;
    const c = sigRef.current!; const r = c.getBoundingClientRect();
    const ctx = c.getContext('2d')!;
    ctx.beginPath(); ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
  };
  const moveDraw = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const c = sigRef.current!; const r = c.getBoundingClientRect();
    const ctx = c.getContext('2d')!; ctx.lineWidth = 2; ctx.strokeStyle = '#0f172a';
    ctx.lineTo(e.clientX - r.left, e.clientY - r.top); ctx.stroke();
  };
  const endDraw = () => {
    drawing.current = false;
    if (sigRef.current) setSigData(sigRef.current.toDataURL('image/png'));
  };
  const clearSig = () => {
    if (!sigRef.current) return;
    const c = sigRef.current; c.getContext('2d')!.clearRect(0,0,c.width,c.height); setSigData('');
  };

  if (!stop || !vendor || !trip) {
    return (
      <MobileLayout header={<PageHeader title="Stop Not Found" showBack showLogout />}>
        <div className="p-8 text-center">
          <p>Stop not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/driver/route')}>Back</Button>
        </div>
      </MobileLayout>
    );
  }

  const lines = computeInvoiceLines(vendor.id, orderedItems, deliveredQty);
  const newBillTotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const totalDue = newBillTotal + (clearOld || 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = totalDue - totalPaid;
  const isCompleted = !!deliveries[stop.id];

  const addPayment = () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) { toast({ title: 'Enter a valid amount', variant: 'destructive' }); return; }
    if (payMode === 'cheque' && (!chequeBank || !chequeNo)) {
      toast({ title: 'Cheque details required', variant: 'destructive' }); return;
    }
    setPayments([
      ...payments,
      {
        mode: payMode,
        amount: amt,
        cheque: payMode === 'cheque'
          ? { bank: chequeBank, chequeNo, date: chequeDate, amount: amt }
          : undefined,
      },
    ]);
    setPayAmount(''); setChequeBank(''); setChequeNo('');
  };

  const handleComplete = () => {
    if (!issueTag && balance > 0 && payMode !== 'credit') {
      // OK to leave on credit if no payments at all? require explicit
    }
    recordDelivery({
      stopId: stop.id,
      vendorId: vendor.id,
      delivered: deliveredQty,
      returns,
      freeGoods: lines.reduce((acc, l) => { if (l.freeGoods) acc[l.productId] = l.freeGoods; return acc; }, {} as Record<string, number>),
      payments: balance > 0 ? [...payments, { mode: 'credit' as PaymentMode, amount: balance }] : payments,
      outstandingCleared: clearOld,
      invoiceTotal: newBillTotal,
      signatureDataUrl: sigData,
      note,
      issueTag,
      completedAt: new Date().toISOString(),
    });
    markDelivered(stop.id, note);
    toast({ title: 'Delivery recorded', description: `${vendor.name} – ${fmtINR(newBillTotal)}` });
    navigate('/driver/route');
  };

  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=distrib@upi&pn=Distributor&am=${balance.toFixed(2)}&cu=INR&tn=${vendor.id}`)}`;

  return (
    <MobileLayout header={<PageHeader title={vendor.name} subtitle={tenant?.name} showBack showLogout />}>
      <div className="p-4 pb-32 space-y-4">
        {/* Outstanding alert */}
        {outstanding && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Outstanding {fmtINR(outstanding.amount)}</p>
                <p className="text-xs text-muted-foreground">Bill {outstanding.billRef} · {outstanding.agingDays} days old. Collect before dropping new stock.</p>
                <div className="mt-2 flex items-center gap-2">
                  <Label className="text-xs">Collecting now:</Label>
                  <Input type="number" value={clearOld || ''} onChange={e => setClearOld(parseFloat(e.target.value) || 0)}
                    className="h-8 w-28" placeholder="0" />
                  <Button size="sm" variant="outline" onClick={() => setClearOld(outstanding.amount)}>Full</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendor card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center"><MapPin className="h-5 w-5" /></div>
              <div className="flex-1">
                <p className="font-semibold">{vendor.name}</p>
                <p className="text-xs text-muted-foreground">{vendor.address}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => vendor.contactPhone && window.open(`tel:${vendor.contactPhone}`)}>
                <Phone className="h-4 w-4" /> Call
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}`, '_blank')}>
                <Navigation className="h-4 w-4" /> Navigate
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="invoice">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invoice">Invoice</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          {/* Invoice tab — interactive with partial delivery */}
          <TabsContent value="invoice" className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-accent" />Interactive Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {lines.map(l => {
                  const ordered = orderedItems.find(o => o.productId === l.productId)?.quantity || 0;
                  const free = getFreeGoodsForVendor(vendor.id, l.productId, l.delivered);
                  return (
                    <div key={l.productId} className="rounded-lg border p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{l.name}</p>
                          <p className="text-xs text-muted-foreground">Ordered {ordered} {l.unit} · {fmtINR(l.unitPrice)}/{l.unit}</p>
                          {free > 0 && <Badge className="mt-1 bg-emerald-600">+{free} FREE</Badge>}
                        </div>
                        <p className="font-semibold">{fmtINR(l.lineTotal)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Delivered:</Label>
                        <Button variant="outline" size="icon" className="h-8 w-8"
                          onClick={() => setDeliveredQty(d => ({ ...d, [l.productId]: Math.max(0, (d[l.productId] ?? ordered) - 1) }))}>−</Button>
                        <Input type="number" value={deliveredQty[l.productId] ?? ordered} max={ordered}
                          onChange={e => setDeliveredQty(d => ({ ...d, [l.productId]: Math.min(ordered, parseInt(e.target.value) || 0) }))}
                          className="h-8 w-16 text-center" />
                        <Button variant="outline" size="icon" className="h-8 w-8"
                          onClick={() => setDeliveredQty(d => ({ ...d, [l.productId]: Math.min(ordered, (d[l.productId] ?? ordered) + 1) }))}>+</Button>
                        <span className="text-xs text-muted-foreground">/ {ordered}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>New bill total</span>
                  <span>{fmtINR(newBillTotal)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Issue tag */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4 text-accent" />Quick issue tag (optional)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {issueReasons.map(r => (
                  <Button key={r} type="button" variant={issueTag === r ? 'default' : 'outline'} size="sm"
                    onClick={() => setIssueTag(issueTag === r ? '' : r)}>{r}</Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4 text-accent" />Note</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note for this stop" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Returns tab */}
          <TabsContent value="returns" className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><RotateCcw className="h-4 w-4 text-accent" />Pick-up returns / bad goods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Select value={retProd} onValueChange={setRetProd}>
                    <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
                    <SelectContent>
                      {orderedItems.map(it => {
                        const p = getProductById(it.productId);
                        return <SelectItem key={it.productId} value={it.productId}>{p?.name}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Qty" value={retQty} onChange={e => setRetQty(e.target.value)} />
                </div>
                <Select value={retReason} onValueChange={setRetReason}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bad goods">Bad goods</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                    <SelectItem value="Wrong item">Wrong item</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="w-full" disabled={!retProd || !retQty}
                  onClick={() => {
                    setReturns([...returns, { productId: retProd, qty: parseInt(retQty), reason: retReason }]);
                    setRetProd(''); setRetQty('');
                  }}>Add return</Button>

                {returns.length > 0 && (
                  <div className="space-y-1 pt-2 border-t">
                    {returns.map((r, i) => {
                      const p = getProductById(r.productId);
                      return (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{p?.name} – {r.qty} {p?.unit}</span>
                          <span className="text-muted-foreground">{r.reason}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment tab */}
          <TabsContent value="payment" className="space-y-3">
            <Card>
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>New bill</span><span>{fmtINR(newBillTotal)}</span></div>
                {clearOld > 0 && <div className="flex justify-between text-destructive"><span>Old dues clearing</span><span>{fmtINR(clearOld)}</span></div>}
                <div className="flex justify-between font-semibold border-t pt-2"><span>Total due</span><span>{fmtINR(totalDue)}</span></div>
                <div className="flex justify-between text-emerald-700"><span>Paid</span><span>{fmtINR(totalPaid)}</span></div>
                <div className="flex justify-between font-bold"><span>Balance</span><span className={balance > 0 ? 'text-amber-600' : 'text-emerald-600'}>{fmtINR(balance)}</span></div>
              </CardContent>
            </Card>

            {balance > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2"><QrCodeIcon className="h-4 w-4 text-accent" />Dynamic QR (UPI/Fonepay/eSewa)</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <img src={dynamicQrUrl} alt="Dynamic QR" className="mx-auto h-40 w-40" />
                  <p className="mt-2 text-sm font-medium">{fmtINR(balance)}</p>
                  <p className="text-xs text-muted-foreground">Scan to pay exact amount</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Add payment</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-4 gap-1">
                  {([
                    { v: 'cash', l: 'Cash', i: Wallet },
                    { v: 'qr', l: 'QR', i: QrCodeIcon },
                    { v: 'cheque', l: 'Cheque', i: CreditCard },
                    { v: 'credit', l: 'Credit', i: FileText },
                  ] as const).map(o => (
                    <Button key={o.v} variant={payMode === o.v ? 'default' : 'outline'} size="sm" className="gap-1"
                      onClick={() => setPayMode(o.v)}>
                      <o.i className="h-3 w-3" />{o.l}
                    </Button>
                  ))}
                </div>
                <Input type="number" placeholder="Amount ₹" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
                {payMode === 'cheque' && (
                  <div className="space-y-2 rounded-lg bg-secondary/40 p-2">
                    <Input placeholder="Bank name" value={chequeBank} onChange={e => setChequeBank(e.target.value)} />
                    <Input placeholder="Cheque number" value={chequeNo} onChange={e => setChequeNo(e.target.value)} />
                    <Input type="date" value={chequeDate} onChange={e => setChequeDate(e.target.value)} />
                    <Button variant="outline" size="sm" className="w-full gap-1"
                      onClick={() => toast({ title: 'Photo captured', description: 'Cheque image attached (simulated).' })}>
                      <Camera className="h-3 w-3" /> Capture cheque photo
                    </Button>
                  </div>
                )}
                <Button size="sm" className="w-full" onClick={addPayment}>Add</Button>

                {payments.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm pt-1 border-t">
                    <span className="capitalize">{p.mode}{p.cheque ? ` · ${p.cheque.bank} #${p.cheque.chequeNo}` : ''}</span>
                    <span className="font-medium">{fmtINR(p.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Signature */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Pen className="h-4 w-4 text-accent" />Shopkeeper signature</CardTitle>
              </CardHeader>
              <CardContent>
                <canvas ref={sigRef} width={320} height={120}
                  className="w-full rounded border bg-white touch-none"
                  onPointerDown={startDraw} onPointerMove={moveDraw} onPointerUp={endDraw} onPointerLeave={endDraw} />
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearSig}>Clear</Button>
                  {sigData && <Badge variant="outline" className="self-center">Captured</Badge>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
          <div className="mx-auto max-w-md">
            <Button className="w-full h-12 gap-2" onClick={handleComplete}>
              <Check className="h-5 w-5" />
              Complete delivery {balance > 0 && `· ${fmtINR(balance)} on credit`}
            </Button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
