// Driver-specific mock data: case-pack sizes, free-good schemes, vendor dues, denominations
import { products, vendors, getProductById } from './mockData';

// Case pack: how many units per case (for scan-to-load)
export const productCaseSize: Record<string, number> = {
  'prod-1': 1,   // Rice 25kg bags – 1 per case
  'prod-2': 4,   // Wheat Flour 10kg – 4 per case
  'prod-3': 12,  // Sugar 5kg – 12 per case
  'prod-4': 6,   // Cooking Oil 5L – 6 per case
  'prod-5': 24,  // Dal 1kg – 24 per case
  'prod-6': 48,  // Salt 1kg – 48 per case
  'prod-7': 24,  // Tea 500g – 24 per case
  'prod-8': 96,  // Soap – 96 per case
  'prod-9': 1,
  'prod-10': 12,
  'prod-11': 6,
};

export const getCaseSize = (productId: string) =>
  productCaseSize[productId] ?? 1;

// Schemes: free-goods auto-apply per (vendor + product)
// e.g. Buy 5 of prod-1 → 1 free
export interface FreeGoodScheme {
  productId: string;
  buyQty: number;
  freeQty: number;
  description: string;
}
export const vendorSchemes: Record<string, FreeGoodScheme[]> = {
  'vendor-1': [
    { productId: 'prod-1', buyQty: 5, freeQty: 1, description: 'Buy 5 Rice get 1 free' },
  ],
  'vendor-2': [
    { productId: 'prod-3', buyQty: 10, freeQty: 1, description: 'Buy 10 Sugar get 1 free' },
  ],
  'vendor-3': [
    { productId: 'prod-7', buyQty: 6, freeQty: 1, description: 'Buy 6 Tea get 1 free' },
  ],
};

export const getFreeGoodsForVendor = (vendorId: string, productId: string, qty: number) => {
  const schemes = vendorSchemes[vendorId] || [];
  const s = schemes.find(x => x.productId === productId);
  if (!s) return 0;
  return Math.floor(qty / s.buyQty) * s.freeQty;
};

// Outstanding dues per vendor (red-alert)
export const vendorOutstanding: Record<string, { amount: number; agingDays: number; billRef: string }> = {
  'vendor-1': { amount: 8500, agingDays: 12, billRef: 'INV-2412-0098' },
  'vendor-3': { amount: 15200, agingDays: 28, billRef: 'INV-2411-0233' },
};

// Cash denominations (INR)
export const cashDenominations = [500, 200, 100, 50, 20, 10, 5, 2, 1];

// Reasons for incidents/issues
export const issueReasons = [
  'Shop Closed',
  'Refused Delivery',
  'Wrong Pricing',
  'Disputed Quantity',
  'Vendor Not Available',
] as const;

export const incidentTypes = [
  'Vehicle Breakdown',
  'Accident',
  'Police Stop',
  'Traffic Diversion',
  'Other',
] as const;

// Helper: build invoice line items with scheme calc
export interface InvoiceLine {
  productId: string;
  name: string;
  unit: string;
  ordered: number;
  delivered: number;
  freeGoods: number;
  unitPrice: number;
  lineTotal: number;
}

export const computeInvoiceLines = (
  vendorId: string,
  items: { productId: string; quantity: number }[],
  deliveredOverride?: Record<string, number>
): InvoiceLine[] => {
  return items.map(it => {
    const product = getProductById(it.productId);
    const delivered = deliveredOverride?.[it.productId] ?? it.quantity;
    const freeGoods = getFreeGoodsForVendor(vendorId, it.productId, delivered);
    const unitPrice = product?.price ?? 0;
    return {
      productId: it.productId,
      name: product?.name || 'Unknown',
      unit: product?.unit || '',
      ordered: it.quantity,
      delivered,
      freeGoods,
      unitPrice,
      lineTotal: delivered * unitPrice,
    };
  });
};

// Mock vehicle info
export const driverVehicle = {
  registration: 'MH-04-DT-7821',
  driver: 'Suresh Yadav',
  warehouseManager: 'Rajesh Kumar',
};

// formatter
export const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export { vendors, products };
