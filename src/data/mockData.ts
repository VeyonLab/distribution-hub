import { Tenant, User, Product, Vendor, Route, VendorRequest, Trip, TripStop } from '@/types';

// === TENANTS ===
export const tenants: Tenant[] = [
  { id: 'tenant-1', name: 'Alpha Distributors', createdAt: new Date('2024-01-15') },
  { id: 'tenant-2', name: 'Beta Distributors', createdAt: new Date('2024-03-20') },
];

// === USERS (with passwords for mock auth) ===
export interface MockUser extends User {
  password: string;
}

export const users: MockUser[] = [
  // Super Admin (no tenant)
  { id: 'user-super', name: 'System Admin', email: 'admin@system.com', password: 'admin123', role: 'super_admin', tenantId: '' },
  
  // Alpha Distributors Team
  { id: 'user-mgr-1', name: 'Rajesh Kumar', email: 'rajesh@alpha.com', password: 'manager123', role: 'manager', tenantId: 'tenant-1', phone: '+91 98765 43210' },
  { id: 'user-sales-1', name: 'Amit Sharma', email: 'amit@alpha.com', password: 'sales123', role: 'salesman', tenantId: 'tenant-1', phone: '+91 98765 43211' },
  { id: 'user-sales-2', name: 'Priya Patel', email: 'priya@alpha.com', password: 'sales123', role: 'salesman', tenantId: 'tenant-1', phone: '+91 98765 43212' },
  { id: 'user-driver-1', name: 'Suresh Yadav', email: 'suresh@alpha.com', password: 'driver123', role: 'driver', tenantId: 'tenant-1', phone: '+91 98765 43213' },
  
  // Beta Distributors Team
  { id: 'user-mgr-2', name: 'Vikram Singh', email: 'vikram@beta.com', password: 'manager123', role: 'manager', tenantId: 'tenant-2' },
];

// === PRODUCTS (Alpha Distributors) ===
export const products: Product[] = [
  { id: 'prod-1', name: 'Rice 25kg', unit: 'bags', tenantId: 'tenant-1' },
  { id: 'prod-2', name: 'Wheat Flour 10kg', unit: 'bags', tenantId: 'tenant-1' },
  { id: 'prod-3', name: 'Sugar 5kg', unit: 'packs', tenantId: 'tenant-1' },
  { id: 'prod-4', name: 'Cooking Oil 5L', unit: 'cans', tenantId: 'tenant-1' },
  { id: 'prod-5', name: 'Dal Toor 1kg', unit: 'packs', tenantId: 'tenant-1' },
  { id: 'prod-6', name: 'Salt 1kg', unit: 'packs', tenantId: 'tenant-1' },
  { id: 'prod-7', name: 'Tea 500g', unit: 'boxes', tenantId: 'tenant-1' },
  { id: 'prod-8', name: 'Soap Bar', unit: 'pieces', tenantId: 'tenant-1' },
];

// === VENDORS (Alpha Distributors - 6 vendors) ===
export const vendors: Vendor[] = [
  { id: 'vendor-1', name: 'Sharma General Store', address: '12 MG Road, Andheri West', latitude: 19.1365, longitude: 72.8296, contactPhone: '+91 22 2634 5678', tenantId: 'tenant-1' },
  { id: 'vendor-2', name: 'Patel Kirana', address: '45 Link Road, Malad', latitude: 19.1874, longitude: 72.8484, contactPhone: '+91 22 2845 1234', tenantId: 'tenant-1' },
  { id: 'vendor-3', name: 'Singh Supermart', address: '78 Station Road, Borivali', latitude: 19.2307, longitude: 72.8567, contactPhone: '+91 22 2891 9876', tenantId: 'tenant-1' },
  { id: 'vendor-4', name: 'Gupta Provisions', address: '23 Hill Road, Bandra', latitude: 19.0544, longitude: 72.8250, contactPhone: '+91 22 2640 5432', tenantId: 'tenant-1' },
  { id: 'vendor-5', name: 'Mehta Grocery', address: '56 SV Road, Kandivali', latitude: 19.2094, longitude: 72.8371, contactPhone: '+91 22 2867 8765', tenantId: 'tenant-1' },
  { id: 'vendor-6', name: 'Joshi Mart', address: '89 Western Express, Goregaon', latitude: 19.1663, longitude: 72.8526, contactPhone: '+91 22 2876 2345', tenantId: 'tenant-1' },
];

// === ROUTES (Alpha Distributors - 2 routes) ===
export const routes: Route[] = [
  { id: 'route-a', name: 'Route A - North', vendorIds: ['vendor-1', 'vendor-2', 'vendor-3'], tenantId: 'tenant-1' },
  { id: 'route-b', name: 'Route B - South', vendorIds: ['vendor-4', 'vendor-5', 'vendor-6'], tenantId: 'tenant-1' },
];

// === VENDOR REQUESTS (Today's requests from salesmen) ===
const today = new Date();
export const vendorRequests: VendorRequest[] = [
  // Amit's requests (salesman 1)
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
  },
  // Priya's requests (salesman 2)
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
  },
  {
    id: 'req-4',
    vendorId: 'vendor-4',
    salesmanId: 'user-sales-2',
    items: [
      { id: 'item-4-1', productId: 'prod-1', quantity: 8 },
      { id: 'item-4-2', productId: 'prod-4', quantity: 6 },
    ],
    status: 'pending',
    createdAt: today,
    tenantId: 'tenant-1',
  },
];

// === TRIPS (1 trip assigned to driver) ===
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
  },
];

// === HELPER FUNCTIONS ===
export const getTenantById = (id: string) => tenants.find(t => t.id === id);
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getVendorById = (id: string) => vendors.find(v => v.id === id);
export const getRouteById = (id: string) => routes.find(r => r.id === id);
export const getVendorRequestById = (id: string) => vendorRequests.find(vr => vr.id === id);

export const getUsersByTenant = (tenantId: string) => users.filter(u => u.tenantId === tenantId);
export const getProductsByTenant = (tenantId: string) => products.filter(p => p.tenantId === tenantId);
export const getVendorsByTenant = (tenantId: string) => vendors.filter(v => v.tenantId === tenantId);
export const getRoutesByTenant = (tenantId: string) => routes.filter(r => r.tenantId === tenantId);
export const getVendorRequestsByTenant = (tenantId: string) => vendorRequests.filter(vr => vr.tenantId === tenantId);
export const getTripsByTenant = (tenantId: string) => trips.filter(t => t.tenantId === tenantId);
export const getTripsByDriver = (driverId: string) => trips.filter(t => t.driverId === driverId);
export const getVendorRequestsBySalesman = (salesmanId: string) => vendorRequests.filter(vr => vr.salesmanId === salesmanId);

// Auth helper
export const authenticateUser = (email: string, password: string): MockUser | null => {
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
};
