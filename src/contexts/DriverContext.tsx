import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type PaymentMode = 'cash' | 'qr' | 'cheque' | 'credit';

export interface ChequeDetails {
  bank: string;
  chequeNo: string;
  date: string;
  amount: number;
  photoData?: string;
}

export interface DeliveryRecord {
  stopId: string;
  vendorId: string;
  delivered: Record<string, number>;        // productId -> qty actually delivered
  returns: { productId: string; qty: number; reason: string }[];
  freeGoods: Record<string, number>;
  payments: { mode: PaymentMode; amount: number; cheque?: ChequeDetails }[];
  outstandingCleared: number;
  invoiceTotal: number;
  signatureDataUrl?: string;
  note?: string;
  issueTag?: string;
  completedAt: string;
}

export interface IncidentReport {
  id: string;
  type: string;
  description: string;
  gps: { lat: number; lng: number };
  photoData?: string;
  reportedAt: string;
}

interface DriverDayState {
  // Loading phase
  loaded: Record<string, number>;             // productId -> qty loaded (units)
  scannedCases: Record<string, number>;       // productId -> # cases scanned
  gatePassSignedAt?: string;
  gatePassSignedBy?: string;
  startOdometer?: number;

  // Deliveries (executed)
  deliveries: Record<string, DeliveryRecord>; // stopId -> record

  // Tickets / incidents
  incidents: IncidentReport[];

  // EOD
  endOdometer?: number;
  cashDenominations: Record<number, number>;  // denom -> count
  eodHandedOverAt?: string;

  // actions
  setLoadedQty: (productId: string, qty: number) => void;
  scanCase: (productId: string) => void;
  resetLoading: () => void;
  signGatePass: (signedBy: string, odometer: number) => void;

  recordDelivery: (rec: DeliveryRecord) => void;
  resetDelivery: (stopId: string) => void;

  addIncident: (i: IncidentReport) => void;

  setDenomCount: (denom: number, count: number) => void;
  finalizeEOD: (endOdo: number) => void;

  resetDay: () => void;
}

const initialDenoms = { 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0, 1: 0 };

export const useDriverDay = create<DriverDayState>()(
  persist(
    (set) => ({
      loaded: {},
      scannedCases: {},
      deliveries: {},
      incidents: [],
      cashDenominations: initialDenoms,

      setLoadedQty: (productId, qty) =>
        set((s) => ({ loaded: { ...s.loaded, [productId]: qty } })),

      scanCase: (productId) =>
        set((s) => ({
          scannedCases: { ...s.scannedCases, [productId]: (s.scannedCases[productId] || 0) + 1 },
        })),

      resetLoading: () => set({ loaded: {}, scannedCases: {}, gatePassSignedAt: undefined, gatePassSignedBy: undefined, startOdometer: undefined }),

      signGatePass: (signedBy, odometer) =>
        set({
          gatePassSignedAt: new Date().toISOString(),
          gatePassSignedBy: signedBy,
          startOdometer: odometer,
        }),

      recordDelivery: (rec) =>
        set((s) => ({ deliveries: { ...s.deliveries, [rec.stopId]: rec } })),

      resetDelivery: (stopId) =>
        set((s) => {
          const next = { ...s.deliveries };
          delete next[stopId];
          return { deliveries: next };
        }),

      addIncident: (i) => set((s) => ({ incidents: [i, ...s.incidents] })),

      setDenomCount: (denom, count) =>
        set((s) => ({ cashDenominations: { ...s.cashDenominations, [denom]: count } })),

      finalizeEOD: (endOdo) =>
        set({ endOdometer: endOdo, eodHandedOverAt: new Date().toISOString() }),

      resetDay: () =>
        set({
          loaded: {},
          scannedCases: {},
          gatePassSignedAt: undefined,
          gatePassSignedBy: undefined,
          startOdometer: undefined,
          deliveries: {},
          incidents: [],
          cashDenominations: initialDenoms,
          endOdometer: undefined,
          eodHandedOverAt: undefined,
        }),
    }),
    {
      name: 'driver-day-state',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Derived selectors
export const useStockOnWheels = () => {
  const { loaded, deliveries } = useDriverDay();
  const result: Record<string, number> = { ...loaded };
  Object.values(deliveries).forEach((d) => {
    Object.entries(d.delivered).forEach(([pid, qty]) => {
      result[pid] = (result[pid] || 0) - qty;
    });
    // returns add to van
    d.returns.forEach((r) => {
      result[r.productId] = (result[r.productId] || 0) + 0; // returns kept separately, do not put back to sellable
    });
  });
  return result;
};

export const useCashInBag = () => {
  const { deliveries } = useDriverDay();
  let cash = 0;
  Object.values(deliveries).forEach((d) => {
    d.payments.forEach((p) => {
      if (p.mode === 'cash') cash += p.amount;
    });
  });
  return cash;
};

export const useChequesCollected = () => {
  const { deliveries } = useDriverDay();
  const cheques: ChequeDetails[] = [];
  Object.values(deliveries).forEach((d) => {
    d.payments.forEach((p) => {
      if (p.mode === 'cheque' && p.cheque) cheques.push(p.cheque);
    });
  });
  return cheques;
};

export const useReturnsCollected = () => {
  const { deliveries } = useDriverDay();
  const returns: { productId: string; qty: number; reason: string; vendorId: string }[] = [];
  Object.values(deliveries).forEach((d) => {
    d.returns.forEach((r) => returns.push({ ...r, vendorId: d.vendorId }));
  });
  return returns;
};
