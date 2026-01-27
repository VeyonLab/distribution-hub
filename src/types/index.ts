// Core Types for Distribution System

export type UserRole = 'super_admin' | 'manager' | 'salesman' | 'driver';

export interface Tenant {
  id: string;
  name: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  tenantId: string;
  status: 'active' | 'inactive';
}

export interface Vendor {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contactPhone?: string;
  tenantId: string;
}

export interface Route {
  id: string;
  name: string;
  vendorIds: string[]; // Ordered list of vendor stops
  tenantId: string;
}

export interface VendorRequestItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface VendorRequest {
  id: string;
  vendorId: string;
  salesmanId: string;
  items: VendorRequestItem[];
  status: 'draft' | 'pending' | 'batched' | 'in_transit' | 'delivered';
  createdAt: Date;
  tenantId: string;
}

export interface TripStop {
  id: string;
  vendorId: string;
  vendorRequestIds: string[];
  deliveryStatus: 'pending' | 'delivered' | 'skipped';
  deliveredAt?: Date;
  order: number;
}

export interface Trip {
  id: string;
  routeId: string;
  driverId: string;
  stops: TripStop[];
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduledDate: Date;
  tenantId: string;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
}
