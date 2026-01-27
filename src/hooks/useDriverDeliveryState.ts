import { create } from 'zustand';

interface DeliveryNote {
  stopId: string;
  note?: string;
  deliveredAt: Date;
}

interface DriverDeliveryState {
  deliveredStops: Map<string, DeliveryNote>;
  markDelivered: (stopId: string, note?: string) => void;
  getStopStatus: (stopId: string) => 'pending' | 'delivered' | 'partial' | 'skipped';
  getDeliveryNote: (stopId: string) => string | undefined;
  resetDeliveries: () => void;
}

// Using Zustand for simple state management
export const useDriverDeliveryState = create<DriverDeliveryState>((set, get) => ({
  deliveredStops: new Map(),
  
  markDelivered: (stopId: string, note?: string) => {
    set((state) => {
      const newMap = new Map(state.deliveredStops);
      newMap.set(stopId, {
        stopId,
        note,
        deliveredAt: new Date(),
      });
      return { deliveredStops: newMap };
    });
  },
  
  getStopStatus: (stopId: string) => {
    const { deliveredStops } = get();
    if (deliveredStops.has(stopId)) {
      return 'delivered';
    }
    return 'pending';
  },
  
  getDeliveryNote: (stopId: string) => {
    const { deliveredStops } = get();
    return deliveredStops.get(stopId)?.note;
  },
  
  resetDeliveries: () => {
    set({ deliveredStops: new Map() });
  },
}));
