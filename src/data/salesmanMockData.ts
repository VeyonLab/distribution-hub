// Mock data extensions for salesman module (UI demo only)
import { getProductById, getVendorById } from './mockData';

export type ProductBrand = 'UDN' | 'Sujal' | 'Other Principals';

export interface ProductMeta {
  brand: ProductBrand;
  category: string;
  stock: number;
  imageEmoji: string;
}

export const productMeta: Record<string, ProductMeta> = {
  'prod-1': { brand: 'UDN', category: 'Grains', stock: 120, imageEmoji: '🌾' },
  'prod-2': { brand: 'UDN', category: 'Grains', stock: 80, imageEmoji: '🍞' },
  'prod-3': { brand: 'Sujal', category: 'Sweetener', stock: 200, imageEmoji: '🍬' },
  'prod-4': { brand: 'Sujal', category: 'Oil', stock: 60, imageEmoji: '🛢️' },
  'prod-5': { brand: 'Other Principals', category: 'Pulses', stock: 150, imageEmoji: '🫘' },
  'prod-6': { brand: 'Other Principals', category: 'Spices', stock: 40, imageEmoji: '🧂' },
  'prod-7': { brand: 'UDN', category: 'Beverages', stock: 90, imageEmoji: '🍵' },
  'prod-8': { brand: 'Sujal', category: 'Personal Care', stock: 70, imageEmoji: '🧼' },
  'prod-9': { brand: 'UDN', category: 'Grains', stock: 110, imageEmoji: '🌾' },
  'prod-10': { brand: 'Sujal', category: 'Sweetener', stock: 180, imageEmoji: '🍬' },
  'prod-11': { brand: 'Sujal', category: 'Oil', stock: 50, imageEmoji: '🛢️' },
};

export const getProductBrand = (productId: string): ProductBrand =>
  productMeta[productId]?.brand ?? 'Other Principals';

export const getProductStock = (productId: string): number =>
  productMeta[productId]?.stock ?? 0;

export interface Scheme {
  id: string;
  productId: string;
  type: 'BXGY' | 'DISCOUNT';
  description: string;
  buyQty?: number;
  freeQty?: number;
  discountPerUnit?: number;
}

export const schemes: Scheme[] = [
  { id: 'sch-1', productId: 'prod-1', type: 'BXGY', description: 'Buy 5, Get 1 Free', buyQty: 5, freeQty: 1 },
  { id: 'sch-2', productId: 'prod-4', type: 'DISCOUNT', description: '₹50 off per can', discountPerUnit: 50 },
  { id: 'sch-3', productId: 'prod-7', type: 'BXGY', description: 'Buy 10, Get 2 Free', buyQty: 10, freeQty: 2 },
  { id: 'sch-4', productId: 'prod-3', type: 'DISCOUNT', description: '₹25 off per pack', discountPerUnit: 25 },
];

export const getSchemeForProduct = (productId: string): Scheme | undefined =>
  schemes.find(s => s.productId === productId);

export interface SchemeApplied {
  productId: string;
  description: string;
  freeQty: number;
  discount: number;
}

export function calculateScheme(productId: string, qty: number): SchemeApplied | null {
  const sch = getSchemeForProduct(productId);
  if (!sch) return null;
  const product = getProductById(productId);
  if (!product) return null;
  if (sch.type === 'BXGY' && sch.buyQty && sch.freeQty) {
    const sets = Math.floor(qty / sch.buyQty);
    if (sets <= 0) return null;
    const free = sets * sch.freeQty;
    return { productId, description: sch.description, freeQty: free, discount: free * product.price };
  }
  if (sch.type === 'DISCOUNT' && sch.discountPerUnit) {
    return { productId, description: sch.description, freeQty: 0, discount: qty * sch.discountPerUnit };
  }
  return null;
}

// === Outlet dues (per vendor) ===
export const vendorDues: Record<string, number> = {
  'vendor-1': 4500,
  'vendor-2': 0,
  'vendor-3': 12300,
  'vendor-4': 800,
  'vendor-5': 0,
  'vendor-6': 6700,
};

export const getVendorDues = (vendorId: string): number => vendorDues[vendorId] ?? 0;

// Last order ghost text — simulated last items per vendor
export const lastOrders: Record<string, { productId: string; quantity: number }[]> = {
  'vendor-1': [
    { productId: 'prod-1', quantity: 3 },
    { productId: 'prod-4', quantity: 2 },
  ],
  'vendor-2': [{ productId: 'prod-3', quantity: 10 }],
  'vendor-3': [{ productId: 'prod-7', quantity: 5 }],
  'vendor-4': [{ productId: 'prod-9', quantity: 4 }],
  'vendor-5': [{ productId: 'prod-10', quantity: 6 }],
  'vendor-6': [{ productId: 'prod-11', quantity: 2 }],
};

export const getLastOrderQty = (vendorId: string, productId: string): number =>
  lastOrders[vendorId]?.find(i => i.productId === productId)?.quantity ?? 0;

// Salesman targets / commission (mock per salesman)
export interface SalesmanTarget {
  monthlyTarget: number;
  achieved: number;
  commissionEarned: number;
  commissionTarget: number;
}

export const salesmanTargets: Record<string, SalesmanTarget> = {
  'user-sales-1': { monthlyTarget: 500000, achieved: 312000, commissionEarned: 8400, commissionTarget: 15000 },
  'user-sales-2': { monthlyTarget: 400000, achieved: 145000, commissionEarned: 3200, commissionTarget: 12000 },
  'user-sales-4': { monthlyTarget: 450000, achieved: 220000, commissionEarned: 5800, commissionTarget: 13000 },
};

export const getSalesmanTarget = (id: string): SalesmanTarget =>
  salesmanTargets[id] ?? { monthlyTarget: 0, achieved: 0, commissionEarned: 0, commissionTarget: 0 };

// Focus SKUs (top priority products)
export interface FocusSKU {
  productId: string;
  bonus: string;
}

export const focusSKUs: FocusSKU[] = [
  { productId: 'prod-1', bonus: 'Sell 10 bags → ₹500 bonus' },
  { productId: 'prod-4', bonus: 'Sell 5 cans → ₹300 bonus' },
  { productId: 'prod-7', bonus: 'Sell 8 boxes → ₹200 bonus' },
  { productId: 'prod-3', bonus: 'Sell 15 packs → ₹250 bonus' },
  { productId: 'prod-2', bonus: 'Sell 12 bags → ₹400 bonus' },
];

// Tele-call reason codes
export const teleCallReasons = [
  'Rain/Strike',
  'Shop Closed',
  'Owner on Phone',
  'Pre-order Request',
  'Other',
] as const;

// Returns
export const returnReasons = ['Expiry', 'Damaged', 'Other'] as const;

// Distance util (Haversine, meters)
export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
