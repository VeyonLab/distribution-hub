import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type VisitMode = 'field' | 'tele';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface ReturnItem {
  id: string;
  productId: string;
  quantity: number;
  reason: string;
}

export interface DraftOrder {
  vendorId: string;
  mode: VisitMode;
  shelfStock?: string;
  teleReason?: string;
  teleReasonOther?: string;
  cart: CartItem[];
  returns: ReturnItem[];
  // financial closure
  payAmount?: number;
  payMode?: 'Cash' | 'QR Code' | 'Cheque';
  collectionDate?: string;
  remarks?: string;
}

export interface VisitRecord {
  id: string;
  vendorId: string;
  mode: VisitMode;
  productive: boolean;
  orderValue: number;
  linesCount: number;
  timestamp: number;
  remarks?: string;
}

export interface CheckInState {
  date: string; // YYYY-MM-DD
  time: number;
  lat: number;
  lng: number;
  selfie?: string; // data URL
}

interface SalesmanCtx {
  checkIn: CheckInState | null;
  doCheckIn: (data: CheckInState) => void;
  resetCheckIn: () => void;

  draft: DraftOrder | null;
  setDraft: (d: DraftOrder | null) => void;
  updateDraft: (patch: Partial<DraftOrder>) => void;

  visits: VisitRecord[];
  addVisit: (v: VisitRecord) => void;
}

const Ctx = createContext<SalesmanCtx | undefined>(undefined);

const todayStr = () => new Date().toISOString().slice(0, 10);

export function SalesmanProvider({ children }: { children: ReactNode }) {
  const [checkIn, setCheckIn] = useState<CheckInState | null>(() => {
    try {
      const raw = localStorage.getItem('sm_checkin');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CheckInState;
      return parsed.date === todayStr() ? parsed : null;
    } catch {
      return null;
    }
  });
  const [draft, setDraftState] = useState<DraftOrder | null>(null);
  const [visits, setVisits] = useState<VisitRecord[]>(() => {
    try {
      const raw = localStorage.getItem('sm_visits');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as VisitRecord[];
      // keep only today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return parsed.filter(v => v.timestamp >= startOfDay.getTime());
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (checkIn) localStorage.setItem('sm_checkin', JSON.stringify(checkIn));
  }, [checkIn]);

  useEffect(() => {
    localStorage.setItem('sm_visits', JSON.stringify(visits));
  }, [visits]);

  const doCheckIn = (data: CheckInState) => setCheckIn(data);
  const resetCheckIn = () => {
    setCheckIn(null);
    localStorage.removeItem('sm_checkin');
  };

  const setDraft = (d: DraftOrder | null) => setDraftState(d);
  const updateDraft = (patch: Partial<DraftOrder>) =>
    setDraftState(prev => (prev ? { ...prev, ...patch } : prev));

  const addVisit = (v: VisitRecord) => setVisits(prev => [...prev, v]);

  return (
    <Ctx.Provider value={{ checkIn, doCheckIn, resetCheckIn, draft, setDraft, updateDraft, visits, addVisit }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSalesman() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSalesman must be used within SalesmanProvider');
  return ctx;
}
