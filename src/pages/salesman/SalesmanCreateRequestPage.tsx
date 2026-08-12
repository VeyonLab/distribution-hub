import { useMemo, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Store, Package, Plus, Minus, Trash2, Search, ArrowRight, Sparkles, Undo2, Camera } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSalesman } from '@/contexts/SalesmanContext';
import { getVendorById, getProductsByBranch, getProductById } from '@/data/mockData';
import {
  productMeta,
  getProductBrand,
  getProductStock,
  getSchemeForProduct,
  calculateScheme,
  getLastOrderQty,
  returnReasons,
  ProductBrand,
} from '@/data/salesmanMockData';

const BRANDS: ProductBrand[] = ['UDN', 'Sujal', 'Other Principals'];

export default function SalesmanCreateRequestPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { tenant, branch } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { draft, updateDraft } = useSalesman();

  const vendor = vendorId ? getVendorById(vendorId) : null;
  const products = branch ? getProductsByBranch(branch.id).filter(p => p.status === 'active') : [];
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'order' | 'returns'>('order');

  if (!vendor || vendor.tenantId !== tenant?.id) {
    return <Navigate to="/salesman/vendors" replace />;
  }
  if (!draft || draft.vendorId !== vendor.id) {
    return <Navigate to={`/salesman/vendors/${vendor.id}`} replace />;
  }

  const cart = draft.cart;
  const returns = draft.returns;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (productMeta[p.id]?.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const productsByBrand = (b: ProductBrand) =>
    filteredProducts.filter(p => getProductBrand(p.id) === b);

  const setQty = (productId: string, qty: number) => {
    const next = qty <= 0
      ? cart.filter(i => i.productId !== productId)
      : cart.find(i => i.productId === productId)
        ? cart.map(i => i.productId === productId ? { ...i, quantity: qty } : i)
        : [...cart, { productId, quantity: qty }];
    updateDraft({ cart: next });
  };
  const addOne = (id: string) => {
    const cur = cart.find(i => i.productId === id)?.quantity ?? 0;
    setQty(id, cur + 1);
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let savings = 0;
    const applied = cart.map(i => {
      const p = getProductById(i.productId);
      if (!p) return null;
      const line = p.price * i.quantity;
      subtotal += line;
      const sch = calculateScheme(i.productId, i.quantity);
      if (sch) savings += sch.discount;
      return sch;
    }).filter(Boolean);
    return { subtotal, savings, total: subtotal - savings, applied };
  }, [cart]);

  const addReturn = (productId: string) => {
    const id = `r-${Date.now()}`;
    updateDraft({ returns: [...returns, { id, productId, quantity: 1, reason: 'Damaged' }] });
  };
  const updateReturn = (id: string, patch: Partial<{ quantity: number; reason: string; productId: string }>) => {
    updateDraft({ returns: returns.map(r => r.id === id ? { ...r, ...patch } : r) });
  };
  const removeReturn = (id: string) => updateDraft({ returns: returns.filter(r => r.id !== id) });

  const proceedToClosure = () => {
    if (cart.length === 0 && returns.length === 0) {
      toast({ title: 'Empty order', description: 'Add at least one product or return.', variant: 'destructive' });
      return;
    }
    navigate(`/salesman/closure/${vendor.id}`);
  };

  return (
    <MobileLayout
      header={<PageHeader title="New Order" subtitle={vendor.name} showBack showLogout />}
    >
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="flex-1 space-y-4 p-4 pb-40">
          {/* Outlet pill + mode badge */}
          <Card>
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{vendor.name}</p>
                <p className="text-xs text-muted-foreground truncate">{vendor.address}</p>
              </div>
              <Badge variant={draft.mode === 'field' ? 'default' : 'secondary'}>
                {draft.mode === 'field' ? '📍 Field' : '📞 Tele'}
              </Badge>
            </CardContent>
          </Card>

          <Tabs value={tab} onValueChange={(v) => setTab(v as 'order' | 'returns')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="order">Order ({cart.length})</TabsTrigger>
              <TabsTrigger value="returns">Returns / GSA ({returns.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="order" className="space-y-4 pt-3">
              {/* Cart summary */}
              {cart.length > 0 && (
                <Card className="border-accent">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Cart</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {cart.map(i => {
                      const p = getProductById(i.productId);
                      if (!p) return null;
                      const sch = calculateScheme(i.productId, i.quantity);
                      return (
                        <div key={i.productId} className="rounded-lg bg-secondary/50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ₹{p.price} × {i.quantity} = <span className="font-semibold text-accent">₹{(p.price * i.quantity).toLocaleString('en-IN')}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty(i.productId, i.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                              <Input type="number" min={1} value={i.quantity} onChange={(e) => setQty(i.productId, parseInt(e.target.value) || 0)} className="h-8 w-14 text-center" />
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty(i.productId, i.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setQty(i.productId, 0)}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </div>
                          {sch && (
                            <div className="mt-2 flex items-center gap-1 rounded bg-accent/10 px-2 py-1 text-xs text-accent">
                              <Sparkles className="h-3 w-3" /> {sch.description} → save ₹{sch.discount.toLocaleString('en-IN')}{sch.freeQty > 0 ? ` + ${sch.freeQty} free` : ''}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="border-t pt-2 text-sm">
                      <div className="flex justify-between"><span>Subtotal</span><span>₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
                      {totals.savings > 0 && (
                        <div className="flex justify-between text-accent"><span>Scheme savings</span><span>−₹{totals.savings.toLocaleString('en-IN')}</span></div>
                      )}
                      <div className="mt-1 flex justify-between border-t pt-1 font-bold"><span>Net Order</span><span>₹{totals.total.toLocaleString('en-IN')}</span></div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search SKU or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>

              {/* Brand tabs */}
              <Tabs defaultValue="UDN">
                <TabsList className="grid w-full grid-cols-3">
                  {BRANDS.map(b => <TabsTrigger key={b} value={b} className="text-xs">{b}</TabsTrigger>)}
                </TabsList>
                {BRANDS.map(b => (
                  <TabsContent key={b} value={b} className="space-y-2 pt-3">
                    {productsByBrand(b).length === 0 && (
                      <Card><CardContent className="py-8 text-center text-sm text-muted-foreground"><Package className="mx-auto mb-2 h-8 w-8 opacity-50" />No products</CardContent></Card>
                    )}
                    {productsByBrand(b).map(p => {
                      const meta = productMeta[p.id];
                      const inCart = cart.find(i => i.productId === p.id)?.quantity ?? 0;
                      const stock = getProductStock(p.id);
                      const sch = getSchemeForProduct(p.id);
                      const lastQty = getLastOrderQty(vendor.id, p.id);
                      return (
                        <div key={p.id} className={`rounded-lg border p-3 ${inCart ? 'border-accent bg-accent/5' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-2xl">
                              {meta?.imageEmoji ?? '📦'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {meta?.category} · ₹{p.price} · stock {stock}
                              </p>
                              {lastQty > 0 && (
                                <p className="text-[10px] italic text-muted-foreground/70">Last order: {lastQty} {p.unit}</p>
                              )}
                              {sch && (
                                <Badge variant="secondary" className="mt-1 text-[10px] gap-1">
                                  <Sparkles className="h-2.5 w-2.5" /> {sch.description}
                                </Badge>
                              )}
                            </div>
                            {inCart > 0 ? (
                              <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(p.id, inCart - 1)}><Minus className="h-3 w-3" /></Button>
                                <span className="w-6 text-center text-sm font-semibold">{inCart}</span>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(p.id, inCart + 1)}><Plus className="h-3 w-3" /></Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => addOne(p.id)} className="gap-1"><Plus className="h-3 w-3" /> Add</Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>

            <TabsContent value="returns" className="space-y-3 pt-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Undo2 className="h-4 w-4" /> Goods Sales Adjustment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {returns.length === 0 && (
                    <p className="text-sm text-muted-foreground">No returns logged.</p>
                  )}
                  {returns.map(r => (
                    <div key={r.id} className="space-y-2 rounded-lg border p-3">
                      <Select value={r.productId} onValueChange={(v) => updateReturn(r.id, { productId: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" min={1} value={r.quantity} onChange={(e) => updateReturn(r.id, { quantity: parseInt(e.target.value) || 1 })} placeholder="Qty" />
                        <Select value={r.reason} onValueChange={(v) => updateReturn(r.id, { reason: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {returnReasons.map(rn => <SelectItem key={rn} value={rn}>{rn}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-between">
                        <Button variant="ghost" size="sm" className="gap-1 text-xs" type="button">
                          <Camera className="h-3 w-3" /> Photo (optional)
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs text-destructive" onClick={() => removeReturn(r.id)}>
                          <Trash2 className="h-3 w-3" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2" onClick={() => products[0] && addReturn(products[0].id)}>
                    <Plus className="h-4 w-4" /> Add Return
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom action */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 safe-area-pb">
          <div className="mx-auto max-w-md">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{cart.length} items</span>
              <span className="font-bold">₹{totals.total.toLocaleString('en-IN')}</span>
            </div>
            <Button className="w-full gap-2 h-12" onClick={proceedToClosure}>
              Continue to Payment <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
