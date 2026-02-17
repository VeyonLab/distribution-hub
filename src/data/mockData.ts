import { Tenant, User, Product, Vendor, Route, VendorRequest, Trip, TripStop, Branch, StockTransferRequest } from '@/types';

// === TENANTS ===
export const tenants: Tenant[] = [
  { id: 'tenant-1', name: 'Alpha Distributors', createdAt: new Date('2024-01-15') },
  { id: 'tenant-2', name: 'Beta Distributors', createdAt: new Date('2024-03-20') },
];

// === BRANCHES ===
export const branches: Branch[] = [
  { id: 'branch-1', name: 'Andheri Depot', address: '12 MG Road, Andheri West, Mumbai', tenantId: 'tenant-1', status: 'active', createdAt: new Date('2024-01-20') },
  { id: 'branch-2', name: 'Borivali Depot', address: '78 Station Road, Borivali, Mumbai', tenantId: 'tenant-1', status: 'active', createdAt: new Date('2024-02-10') },
  { id: 'branch-3', name: 'Pune Central', address: '45 FC Road, Pune', tenantId: 'tenant-2', status: 'active', createdAt: new Date('2024-04-01') },
];

// === USERS (with passwords and status for mock auth) ===
export interface MockUser extends User {
  password: string;
  status: 'active' | 'inactive';
}

export const users: MockUser[] = [
  // Super Admin (no tenant)
  { id: 'user-super', name: 'System Admin', email: 'admin@system.com', password: 'admin123', role: 'super_admin', tenantId: '', status: 'active' },
  
  // Tenant Owner (Alpha Distributors - no branch, full tenant access)
  { id: 'user-owner-1', name: 'Anil Mehta', email: 'anil@alpha.com', password: 'owner123', role: 'tenant_owner', tenantId: 'tenant-1', phone: '+91 98765 00000', status: 'active' },

  // Alpha Distributors - Branch 1 (Andheri Depot)
  { id: 'user-mgr-1', name: 'Rajesh Kumar', email: 'rajesh@alpha.com', password: 'manager123', role: 'manager', tenantId: 'tenant-1', branchId: 'branch-1', phone: '+91 98765 43210', status: 'active' },
  { id: 'user-sales-1', name: 'Amit Sharma', email: 'amit@alpha.com', password: 'sales123', role: 'salesman', tenantId: 'tenant-1', branchId: 'branch-1', phone: '+91 98765 43211', status: 'active' },
  { id: 'user-sales-2', name: 'Priya Patel', email: 'priya@alpha.com', password: 'sales123', role: 'salesman', tenantId: 'tenant-1', branchId: 'branch-1', phone: '+91 98765 43212', status: 'active' },
  { id: 'user-driver-1', name: 'Suresh Yadav', email: 'suresh@alpha.com', password: 'driver123', role: 'driver', tenantId: 'tenant-1', branchId: 'branch-1', phone: '+91 98765 43213', status: 'active' },
  
  // Alpha Distributors - Branch 2 (Borivali Depot)
  { id: 'user-mgr-3', name: 'Deepak Joshi', email: 'deepak@alpha.com', password: 'manager123', role: 'manager', tenantId: 'tenant-1', branchId: 'branch-2', phone: '+91 98765 43300', status: 'active' },
  { id: 'user-sales-4', name: 'Ravi Patil', email: 'ravi@alpha.com', password: 'sales123', role: 'salesman', tenantId: 'tenant-1', branchId: 'branch-2', phone: '+91 98765 43301', status: 'active' },
  { id: 'user-driver-2', name: 'Manoj Gupta', email: 'manoj@alpha.com', password: 'driver123', role: 'driver', tenantId: 'tenant-1', branchId: 'branch-2', phone: '+91 98765 43302', status: 'active' },

  // Beta Distributors
  { id: 'user-mgr-2', name: 'Vikram Singh', email: 'vikram@beta.com', password: 'manager123', role: 'manager', tenantId: 'tenant-2', branchId: 'branch-3', status: 'active' },
  { id: 'user-sales-3', name: 'Neha Gupta', email: 'neha@beta.com', password: 'sales123', role: 'salesman', tenantId: 'tenant-2', branchId: 'branch-3', phone: '+91 98765 43220', status: 'inactive' },
];

// === PRODUCTS (with branchId) ===
export const products: Product[] = [
  // Branch 1 products
  { id: 'prod-1', name: 'Rice 25kg', unit: 'bags', price: 1250, tenantId: 'tenant-1', branchId: 'branch-1', status: 'active' },
  { id: 'prod-2', name: 'Wheat Flour 10kg', unit: 'bags', price: 450, tenantId: 'tenant-1', branchId: 'branch-1', status: 'active' },
  { id: 'prod-3', name: 'Sugar 5kg', unit: 'packs', price: 275, tenantId: 'tenant-1', branchId: 'branch-1', status: 'active' },
  { id: 'prod-4', name: 'Cooking Oil 5L', unit: 'cans', price: 680, tenantId: 'tenant-1', branchId: 'branch-1', status: 'active' },
  { id: 'prod-5', name: 'Dal Toor 1kg', unit: 'packs', price: 180, tenantId: 'tenant-1', branchId: 'branch-1', status: 'active' },
  { id: 'prod-6', name: 'Salt 1kg', unit: 'packs', price: 25, tenantId: 'tenant-1', branchId: 'branch-1', status: 'inactive' },
  { id: 'prod-7', name: 'Tea 500g', unit: 'boxes', price: 320, tenantId: 'tenant-1', branchId: 'branch-1', status: 'active' },
  { id: 'prod-8', name: 'Soap Bar', unit: 'pieces', price: 45, tenantId: 'tenant-1', branchId: 'branch-1', status: 'inactive' },
  // Branch 2 products
  { id: 'prod-9', name: 'Rice 25kg', unit: 'bags', price: 1250, tenantId: 'tenant-1', branchId: 'branch-2', status: 'active' },
  { id: 'prod-10', name: 'Sugar 5kg', unit: 'packs', price: 275, tenantId: 'tenant-1', branchId: 'branch-2', status: 'active' },
  { id: 'prod-11', name: 'Cooking Oil 5L', unit: 'cans', price: 680, tenantId: 'tenant-1', branchId: 'branch-2', status: 'active' },
];

// === VENDORS (with branchId) ===
export const vendors: Vendor[] = [
  // Branch 1 vendors
  { id: 'vendor-1', name: 'Sharma General Store', address: '12 MG Road, Andheri West', latitude: 19.1365, longitude: 72.8296, contactPhone: '+91 22 2634 5678', tenantId: 'tenant-1', branchId: 'branch-1' },
  { id: 'vendor-2', name: 'Patel Kirana', address: '45 Link Road, Malad', latitude: 19.1874, longitude: 72.8484, contactPhone: '+91 22 2845 1234', tenantId: 'tenant-1', branchId: 'branch-1' },
  { id: 'vendor-3', name: 'Singh Supermart', address: '78 Station Road, Borivali', latitude: 19.2307, longitude: 72.8567, contactPhone: '+91 22 2891 9876', tenantId: 'tenant-1', branchId: 'branch-1' },
  // Branch 2 vendors
  { id: 'vendor-4', name: 'Gupta Provisions', address: '23 Hill Road, Bandra', latitude: 19.0544, longitude: 72.8250, contactPhone: '+91 22 2640 5432', tenantId: 'tenant-1', branchId: 'branch-2' },
  { id: 'vendor-5', name: 'Mehta Grocery', address: '56 SV Road, Kandivali', latitude: 19.2094, longitude: 72.8371, contactPhone: '+91 22 2867 8765', tenantId: 'tenant-1', branchId: 'branch-2' },
  { id: 'vendor-6', name: 'Joshi Mart', address: '89 Western Express, Goregaon', latitude: 19.1663, longitude: 72.8526, contactPhone: '+91 22 2876 2345', tenantId: 'tenant-1', branchId: 'branch-2' },
];

// === ROUTES (with branchId) ===
export const routes: Route[] = [
  { id: 'route-a', name: 'Route A - North', vendorIds: ['vendor-1', 'vendor-2', 'vendor-3'], tenantId: 'tenant-1', branchId: 'branch-1' },
  { id: 'route-b', name: 'Route B - South', vendorIds: ['vendor-4', 'vendor-5', 'vendor-6'], tenantId: 'tenant-1', branchId: 'branch-2' },
];

// === VENDOR REQUESTS (with branchId) ===
const today = new Date();
export const vendorRequests: VendorRequest[] = [
  {
    id: 'req-1',
    vendorId: 'vendor-1',
    salesmanId: 'user-sales-1',
    items: [
      { id: 'item-1-1', productId: 'prod-1', quantity: 5 },
      { id: 'item-1-2', productId: 'prod-2', quantity: 10 },
      { id: 'item-1-3', productId: 'prod-4', quantity: 8 },
    ],
    status: 'batched',
    createdAt: today,
    tenantId: 'tenant-1',
    branchId: 'branch-1',
  },
  {
    id: 'req-2',
    vendorId: 'vendor-2',
    salesmanId: 'user-sales-1',
    items: [
      { id: 'item-2-1', productId: 'prod-3', quantity: 15 },
      { id: 'item-2-2', productId: 'prod-5', quantity: 20 },
    ],
    status: 'batched',
    createdAt: today,
    tenantId: 'tenant-1',
    branchId: 'branch-1',
  },
  {
    id: 'req-3',
    vendorId: 'vendor-3',
    salesmanId: 'user-sales-2',
    items: [
      { id: 'item-3-1', productId: 'prod-6', quantity: 25 },
      { id: 'item-3-2', productId: 'prod-7', quantity: 12 },
      { id: 'item-3-3', productId: 'prod-8', quantity: 50 },
    ],
    status: 'batched',
    createdAt: today,
    tenantId: 'tenant-1',
    branchId: 'branch-1',
  },
  {
    id: 'req-4',
    vendorId: 'vendor-4',
    salesmanId: 'user-sales-4',
    items: [
      { id: 'item-4-1', productId: 'prod-9', quantity: 8 },
      { id: 'item-4-2', productId: 'prod-11', quantity: 6 },
    ],
    status: 'pending',
    createdAt: today,
    tenantId: 'tenant-1',
    branchId: 'branch-2',
  },
];

// === TRIPS (with branchId) ===
export const trips: Trip[] = [
  {
    id: 'trip-1',
    routeId: 'route-a',
    driverId: 'user-driver-1',
    stops: [
      { id: 'stop-1', vendorId: 'vendor-1', vendorRequestIds: ['req-1'], deliveryStatus: 'pending', order: 1 },
      { id: 'stop-2', vendorId: 'vendor-2', vendorRequestIds: ['req-2'], deliveryStatus: 'pending', order: 2 },
      { id: 'stop-3', vendorId: 'vendor-3', vendorRequestIds: ['req-3'], deliveryStatus: 'pending', order: 3 },
    ],
    status: 'scheduled',
    scheduledDate: today,
    tenantId: 'tenant-1',
    branchId: 'branch-1',
  },
];

// === STOCK TRANSFER REQUESTS ===
export const stockTransferRequests: StockTransferRequest[] = [
  {
    id: 'str-1',
    fromBranchId: 'branch-2',
    toBranchId: 'branch-1',
    items: [
      { productName: 'Rice 25kg', quantity: 10, unit: 'bags' },
      { productName: 'Cooking Oil 5L', quantity: 5, unit: 'cans' },
    ],
    status: 'pending',
    requestedAt: today,
    tenantId: 'tenant-1',
    note: 'Running low on rice, need urgent restock from Borivali depot',
  },
];

// === HELPER FUNCTIONS ===
export const getTenantById = (id: string) => tenants.find(t => t.id === id);
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getVendorById = (id: string) => vendors.find(v => v.id === id);
export const getRouteById = (id: string) => routes.find(r => r.id === id);
export const getVendorRequestById = (id: string) => vendorRequests.find(vr => vr.id === id);
export const getBranchById = (id: string) => branches.find(b => b.id === id);

// Tenant-level queries
export const getUsersByTenant = (tenantId: string) => users.filter(u => u.tenantId === tenantId);
export const getProductsByTenant = (tenantId: string) => products.filter(p => p.tenantId === tenantId);
export const getVendorsByTenant = (tenantId: string) => vendors.filter(v => v.tenantId === tenantId);
export const getRoutesByTenant = (tenantId: string) => routes.filter(r => r.tenantId === tenantId);
export const getVendorRequestsByTenant = (tenantId: string) => vendorRequests.filter(vr => vr.tenantId === tenantId);
export const getTripsByTenant = (tenantId: string) => trips.filter(t => t.tenantId === tenantId);
export const getBranchesByTenant = (tenantId: string) => branches.filter(b => b.tenantId === tenantId);
export const getStockTransfersByTenant = (tenantId: string) => stockTransferRequests.filter(s => s.tenantId === tenantId);

// Branch-level queries
export const getUsersByBranch = (branchId: string) => users.filter(u => u.branchId === branchId);
export const getProductsByBranch = (branchId: string) => products.filter(p => p.branchId === branchId);
export const getVendorsByBranch = (branchId: string) => vendors.filter(v => v.branchId === branchId);
export const getRoutesByBranch = (branchId: string) => routes.filter(r => r.branchId === branchId);
export const getVendorRequestsByBranch = (branchId: string) => vendorRequests.filter(vr => vr.branchId === branchId);
export const getTripsByBranch = (branchId: string) => trips.filter(t => t.branchId === branchId);
export const getStockTransfersByBranch = (branchId: string) => stockTransferRequests.filter(s => s.fromBranchId === branchId || s.toBranchId === branchId);

// Driver/Salesman queries
export const getTripsByDriver = (driverId: string) => trips.filter(t => t.driverId === driverId);
export const getVendorRequestsBySalesman = (salesmanId: string) => vendorRequests.filter(vr => vr.salesmanId === salesmanId);

// Get all non-super-admin users
export const getAllTenantUsers = () => users.filter(u => u.role !== 'super_admin');

// Auth helper
export const authenticateUser = (email: string, password: string): MockUser | null => {
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
};
