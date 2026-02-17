// Core Types for Distribution System

export type UserRole = 'super_admin' | 'tenant_owner' | 'manager' | 'salesman' | 'driver';

export interface Tenant {
  id: string;
  name: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  logo?: string;
  createdAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  tenantId: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  branchId?: string; // null/undefined for tenant_owner and super_admin
  phone?: string;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  tenantId: string;
  branchId: string;
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
  branchId: string;
}

export interface Route {
  id: string;
  name: string;
  vendorIds: string[]; // Ordered list of vendor stops
  tenantId: string;
  branchId: string;
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
  branchId: string;
}

export interface TripStop {
  id: string;
  vendorId: string;
  vendorRequestIds: string[];
  deliveryStatus: 'pending' | 'partial' | 'delivered' | 'skipped';
  deliveredAt?: Date;
  order: number;
}

export interface Trip {
  id: string;
  routeId: string;
  driverId: string | null; // null for draft trips
  stops: TripStop[];
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed';
  scheduledDate: Date;
  tenantId: string;
  branchId: string;
}

export type StockTransferStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled';

export interface StockTransferRequest {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  items: { productName: string; quantity: number; unit: string }[];
  status: StockTransferStatus;
  requestedAt: Date;
  respondedAt?: Date;
  tenantId: string;
  note?: string;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
}
