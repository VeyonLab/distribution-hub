import { useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Share2, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSalesman } from '@/contexts/SalesmanContext';
import { getVendorById, getProductById } from '@/data/mockData';
import { calculateScheme, getVendorDues } from '@/data/salesmanMockData';

export default function SalesmanInvoicePage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, tenant } = useAuth();
  const { draft, addVisit, setDraft } = useSalesman();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState(false);

  const vendor = vendorId ? getVendorById(vendorId) : null;
  if (!vendor || !draft || draft.vendorId !== vendor.id) {
    return <Navigate to="/salesman/vendors" replace />;
  }

  const oldDues = getVendorDues(vendor.id);
  const lines = draft.cart.map(i => {
    const p = getProductById(i.productId)!;
    const sch = calculateScheme(i.productId, i.quantity);
    return { p, qty: i.quantity, line: p.price * i.quantity, sch };
  });
  const subtotal = lines.reduce((s, l) => s + l.line, 0);
  const savings = lines.reduce((s, l) => s + (l.sch?.discount ?? 0), 0);
  const net = subtotal - savings;
  const grand = oldDues + net;
  const balance = grand - (draft.payAmount ?? 0);

  const shareInvoice = async () => {
    if (!invoiceRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(invoiceRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `invoice-${vendor.name}-${Date.now()}.png`, { type: 'image/png' });

      const text = `*Provisional Invoice*\n${tenant?.name}\nOutlet: ${vendor.name}\nMode: ${draft.mode === 'field' ? 'Order Taken at Shop' : 'Order Confirmed via Phone'}\n\nNet Order: ₹${net.toLocaleString('en-IN')}\nOld Dues: ₹${oldDues.toLocaleString('en-IN')}\nGrand Total: ₹${grand.toLocaleString('en-IN')}\nPayment Promise: ₹${(draft.payAmount ?? 0).toLocaleString('en-IN')} (${draft.payMode})\n\nSalesman: ${user?.name}`;

      // Try Web Share with file
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: 'Provisional Invoice' });
      } else {
        // Fallback: download image + open WhatsApp with text
        const a = document.createElement('a');
        a.href = dataUrl; a.download = file.name; a.click();
        const phone = (vendor.contactPhone ?? '').replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
      }
      setShared(true);
      toast({ title: 'Invoice shared', description: 'Visit can now be marked complete.' });
    } catch (e) {
      toast({ title: 'Share failed', description: 'Try downloading instead.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const completeVisit = () => {
    addVisit({
      id: `v-${Date.now()}`,
      vendorId: vendor.id,
      mode: draft.mode,
      productive: draft.cart.length > 0,
      orderValue: net,
      linesCount: draft.cart.length,
      timestamp: Date.now(),
      remarks: draft.remarks,
    });
    setDraft(null);
    toast({ title: 'Visit completed ✓', description: 'Order synced to admin.' });
    navigate('/salesman', { replace: true });
  };

  return (
    <MobileLayout header={<PageHeader title="Provisional Invoice" subtitle={vendor.name} showBack showLogout />}>
      <div className="space-y-4 p-4 pb-32">
        <Card>
          <CardContent className="p-0">
            <div ref={invoiceRef} className="space-y-3 bg-white p-5 text-black">
              <div className="border-b pb-3">
                <p className="text-lg font-bold">{tenant?.name}</p>
                <p className="text-xs text-gray-600">Provisional Invoice · {new Date().toLocaleString('en-IN')}</p>
                <p className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase">
                  {draft.mode === 'field' ? '📍 Order Taken at Shop' : '📞 Order Confirmed via Phone'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Outlet</p>
                <p className="font-semibold">{vendor.name}</p>
                <p className="text-xs text-gray-600">{vendor.address}</p>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-right">Qty</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, idx) => (
                    <tr key={idx} className="border-b border-dashed">
                      <td className="py-1">
                        {l.p.name}
                        {l.sch && <div className="text-[10px] text-green-700">★ {l.sch.description}</div>}
                      </td>
                      <td className="py-1 text-right">{l.qty}</td>
                      <td className="py-1 text-right">₹{l.p.price}</td>
                      <td className="py-1 text-right">₹{l.line.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {draft.returns.length > 0 && (
                <div>
                  <p className="text-xs font-semibold">Returns / GSA</p>
                  <ul className="text-xs text-gray-700">
                    {draft.returns.map(r => {
                      const p = getProductById(r.productId);
                      return <li key={r.id}>• {p?.name} × {r.quantity} ({r.reason})</li>;
                    })}
                  </ul>
                </div>
              )}

              <div className="space-y-1 border-t pt-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                {savings > 0 && <div className="flex justify-between text-green-700"><span>Scheme savings</span><span>−₹{savings.toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between"><span>Net Order</span><span>₹{net.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Old Dues</span><span>₹{oldDues.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between border-t pt-1 font-bold"><span>Grand Total</span><span>₹{grand.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Payment Promise ({draft.payMode})</span><span>₹{(draft.payAmount ?? 0).toLocaleString('en-IN')}</span></div>
                {balance > 0 && (
                  <div className="flex justify-between text-red-600"><span>Balance Due {draft.collectionDate ? `by ${draft.collectionDate}` : ''}</span><span>₹{balance.toLocaleString('en-IN')}</span></div>
                )}
              </div>

              {draft.remarks && (
                <div className="rounded bg-yellow-50 p-2 text-xs">
                  <p className="font-semibold">Remarks:</p>
                  <p>{draft.remarks}</p>
                </div>
              )}

              <p className="border-t pt-2 text-[10px] text-gray-500">
                Salesman: {user?.name} · Generated by {tenant?.name}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
          <div className="mx-auto max-w-md space-y-2">
            <Button className="w-full gap-2 h-12" onClick={shareInvoice} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              {shared ? 'Re-share Invoice' : 'Share via WhatsApp'}
            </Button>
            <Button
              variant={shared ? 'default' : 'outline'}
              className="w-full gap-2 h-12"
              onClick={completeVisit}
              disabled={!shared}
            >
              <CheckCircle2 className="h-4 w-4" /> Mark Visit Complete
            </Button>
            {!shared && <p className="text-center text-xs text-muted-foreground">Share invoice to complete visit</p>}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
