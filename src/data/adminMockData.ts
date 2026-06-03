// Admin/Owner panel mock data: telematics, inventory aging, EOD reconciliation, credit, KPIs

export interface VanTelematic {
  id: string;
  vehicleNo: string;
  driverName: string;
  status: 'in_transit' | 'at_stop' | 'returning' | 'idle';
  latPct: number; // 0-100 (position on placeholder map)
  lngPct: number;
  speedKmh: number;
  stopsDone: number;
  stopsTotal: number;
  cashInBag: number;
  routeName: string;
}

export const liveVans: VanTelematic[] = [
  { id: 'van-1', vehicleNo: 'MH-04-AB-1234', driverName: 'Suresh Yadav', status: 'in_transit', latPct: 32, lngPct: 28, speedKmh: 34, stopsDone: 3, stopsTotal: 8, cashInBag: 18450, routeName: 'Route A - North' },
  { id: 'van-2', vehicleNo: 'MH-04-CD-5678', driverName: 'Manoj Gupta', status: 'at_stop', latPct: 58, lngPct: 62, speedKmh: 0, stopsDone: 5, stopsTotal: 10, cashInBag: 32100, routeName: 'Route B - South' },
  { id: 'van-3', vehicleNo: 'MH-04-EF-9012', driverName: 'Rakesh Verma', status: 'returning', latPct: 74, lngPct: 18, speedKmh: 42, stopsDone: 9, stopsTotal: 9, cashInBag: 41200, routeName: 'Route C - East' },
];

export interface SalesmanPing {
  id: string;
  name: string;
  status: 'visiting' | 'travel' | 'tele' | 'idle';
  outletsVisited: number;
  outletsTotal: number;
  latPct: number;
  lngPct: number;
}

export const liveSalesmen: SalesmanPing[] = [
  { id: 'sm-1', name: 'Amit Sharma', status: 'visiting', outletsVisited: 12, outletsTotal: 22, latPct: 22, lngPct: 70 },
  { id: 'sm-2', name: 'Priya Patel', status: 'travel', outletsVisited: 8, outletsTotal: 18, latPct: 48, lngPct: 40 },
  { id: 'sm-3', name: 'Ravi Patil', status: 'tele', outletsVisited: 5, outletsTotal: 15, latPct: 68, lngPct: 84 },
];

// Daily Pulse KPIs
export const dailyPulse = {
  salesTarget: 850000,
  salesAchieved: 542300,
  productivity: 78, // %
  skuPerCall: 4.2,
  valuePerCall: 2840,
  cashInTransit: 91750,
  digitalCollected: 134200,
};

// Active tickets
export interface AdminTicket {
  id: string;
  type: 'missing_sku' | 'payment_disputed' | 'damaged' | 'refused';
  outlet: string;
  raisedBy: string;
  amount?: number;
  ageMinutes: number;
  severity: 'high' | 'medium' | 'low';
}

export const activeTickets: AdminTicket[] = [
  { id: 'tkt-1', type: 'payment_disputed', outlet: 'Sharma General Store', raisedBy: 'Suresh Yadav', amount: 4200, ageMinutes: 18, severity: 'high' },
  { id: 'tkt-2', type: 'missing_sku', outlet: 'Patel Kirana', raisedBy: 'Amit Sharma', ageMinutes: 42, severity: 'medium' },
  { id: 'tkt-3', type: 'damaged', outlet: 'Gupta Provisions', raisedBy: 'Manoj Gupta', amount: 1800, ageMinutes: 9, severity: 'high' },
  { id: 'tkt-4', type: 'refused', outlet: 'Mehta Grocery', raisedBy: 'Manoj Gupta', amount: 6500, ageMinutes: 65, severity: 'low' },
];

// Inventory aging - FIFO batches
export interface InventoryBatch {
  id: string;
  productId: string;
  productName: string;
  batchNo: string;
  qty: number;
  unit: string;
  daysToExpiry: number;
  location: 'warehouse' | 'van';
  vanId?: string;
}

export const inventoryBatches: InventoryBatch[] = [
  { id: 'b-1', productId: 'prod-7', productName: 'Tea 500g', batchNo: 'TEA-2509A', qty: 240, unit: 'boxes', daysToExpiry: 18, location: 'warehouse' },
  { id: 'b-2', productId: 'prod-5', productName: 'Dal Toor 1kg', batchNo: 'DAL-2510B', qty: 480, unit: 'packs', daysToExpiry: 25, location: 'warehouse' },
  { id: 'b-3', productId: 'prod-4', productName: 'Cooking Oil 5L', batchNo: 'OIL-2511C', qty: 96, unit: 'cans', daysToExpiry: 62, location: 'warehouse' },
  { id: 'b-4', productId: 'prod-1', productName: 'Rice 25kg', batchNo: 'RIC-2602', qty: 320, unit: 'bags', daysToExpiry: 240, location: 'warehouse' },
  { id: 'b-5', productId: 'prod-3', productName: 'Sugar 5kg', batchNo: 'SUG-2509', qty: 144, unit: 'packs', daysToExpiry: 12, location: 'warehouse' },
  { id: 'b-6', productId: 'prod-2', productName: 'Wheat Flour 10kg', batchNo: 'WHT-2604', qty: 200, unit: 'bags', daysToExpiry: 95, location: 'warehouse' },
  { id: 'b-7', productId: 'prod-7', productName: 'Tea 500g', batchNo: 'TEA-2509A', qty: 24, unit: 'boxes', daysToExpiry: 18, location: 'van', vanId: 'van-1' },
  { id: 'b-8', productId: 'prod-3', productName: 'Sugar 5kg', batchNo: 'SUG-2509', qty: 18, unit: 'packs', daysToExpiry: 12, location: 'van', vanId: 'van-2' },
];

// EOD Reconciliation per driver
export interface EODRecord {
  driverId: string;
  driverName: string;
  routeName: string;
  expectedCash: number;     // From digital bills (cash mode)
  physicalCash: number;     // Handed over
  digitalQrSuccess: number; // QR collected
  digitalQrExpected: number;
  status: 'pending' | 'matched' | 'discrepancy' | 'approved';
}

export const eodRecords: EODRecord[] = [
  { driverId: 'user-driver-1', driverName: 'Suresh Yadav', routeName: 'Route A - North', expectedCash: 18450, physicalCash: 18450, digitalQrSuccess: 24200, digitalQrExpected: 24200, status: 'matched' },
  { driverId: 'user-driver-2', driverName: 'Manoj Gupta', routeName: 'Route B - South', expectedCash: 32100, physicalCash: 31200, digitalQrSuccess: 28000, digitalQrExpected: 30000, status: 'discrepancy' },
  { driverId: 'user-driver-3', driverName: 'Rakesh Verma', routeName: 'Route C - East', expectedCash: 41200, physicalCash: 41200, digitalQrSuccess: 18750, digitalQrExpected: 18750, status: 'pending' },
];

// Credit limit / bad payers
export interface CreditOutlet {
  id: string;
  name: string;
  outstanding: number;
  creditDays: number;
  creditLimit: number;
  daysOverdue: number;
  locked: boolean;
}

export const creditOutlets: CreditOutlet[] = [
  { id: 'vendor-1', name: 'Sharma General Store', outstanding: 45200, creditDays: 30, creditLimit: 40000, daysOverdue: 12, locked: false },
  { id: 'vendor-3', name: 'Singh Supermart', outstanding: 78400, creditDays: 15, creditLimit: 60000, daysOverdue: 22, locked: true },
  { id: 'vendor-5', name: 'Mehta Grocery', outstanding: 28500, creditDays: 30, creditLimit: 30000, daysOverdue: 4, locked: false },
  { id: 'vendor-6', name: 'Joshi Mart', outstanding: 92100, creditDays: 21, creditLimit: 75000, daysOverdue: 18, locked: false },
];

// KPI scorecard
export interface StaffKPI {
  id: string;
  name: string;
  role: 'salesman' | 'driver';
  strikeRate: number;       // %
  punctualityMin: number;   // avg minutes to first drop
  cashAccuracy: number;     // 100 - discrepancy %
  discrepancies: number;
  score: number;
}

export const staffKPIs: StaffKPI[] = [
  { id: 'u1', name: 'Suresh Yadav', role: 'driver', strikeRate: 96, punctualityMin: 8, cashAccuracy: 99, discrepancies: 1, score: 94 },
  { id: 'u2', name: 'Amit Sharma', role: 'salesman', strikeRate: 88, punctualityMin: 12, cashAccuracy: 100, discrepancies: 0, score: 92 },
  { id: 'u3', name: 'Priya Patel', role: 'salesman', strikeRate: 82, punctualityMin: 18, cashAccuracy: 98, discrepancies: 2, score: 86 },
  { id: 'u4', name: 'Manoj Gupta', role: 'driver', strikeRate: 78, punctualityMin: 22, cashAccuracy: 94, discrepancies: 5, score: 74 },
  { id: 'u5', name: 'Ravi Patil', role: 'salesman', strikeRate: 71, punctualityMin: 28, cashAccuracy: 100, discrepancies: 0, score: 68 },
];

export const formatINR = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
