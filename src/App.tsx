import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

// Admin Pages
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminTenantsTab from "@/pages/admin/AdminTenantsTab";
import AdminUsersTab from "@/pages/admin/AdminUsersTab";
import AdminGlobalOverviewPage from "@/pages/admin/AdminGlobalOverviewPage";
import TenantDetailPage from "@/pages/admin/TenantDetailPage";
import UserDetailPage from "@/pages/admin/UserDetailPage";

// Manager Pages
import ManagerLayout from "@/pages/manager/ManagerLayout";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ManagerRequests from "@/pages/manager/ManagerRequests";
import ManagerRequestDetailPage from "@/pages/manager/ManagerRequestDetailPage";
import ManagerConsolidatedPage from "@/pages/manager/ManagerConsolidatedPage";
import ManagerTrips from "@/pages/manager/ManagerTrips";
import ManagerTripDetailPage from "@/pages/manager/ManagerTripDetailPage";
import ManagerCreateTripPage from "@/pages/manager/ManagerCreateTripPage";
import ManagerDeliveryMonitoringPage from "@/pages/manager/ManagerDeliveryMonitoringPage";
import ManagerTripMonitoringDetailPage from "@/pages/manager/ManagerTripMonitoringDetailPage";
import ManagerTeamPage from "@/pages/manager/ManagerTeamPage";
import ManagerInviteUserPage from "@/pages/manager/ManagerInviteUserPage";
import ManagerTeamMemberPage from "@/pages/manager/ManagerTeamMemberPage";
import ManagerProductsPage from "@/pages/manager/ManagerProductsPage";
import ManagerAddProductPage from "@/pages/manager/ManagerAddProductPage";
import ManagerEditProductPage from "@/pages/manager/ManagerEditProductPage";
import ManagerVendorsPage from "@/pages/manager/ManagerVendorsPage";
import ManagerVendorDetailPage from "@/pages/manager/ManagerVendorDetailPage";
import ManagerAddVendorPage from "@/pages/manager/ManagerAddVendorPage";
import ManagerEditVendorPage from "@/pages/manager/ManagerEditVendorPage";
import ManagerRoutesPage from "@/pages/manager/ManagerRoutesPage";
import ManagerRouteDetailPage from "@/pages/manager/ManagerRouteDetailPage";
import ManagerCreateRoutePage from "@/pages/manager/ManagerCreateRoutePage";
import ManagerEditRoutePage from "@/pages/manager/ManagerEditRoutePage";

// Salesman Pages
import SalesmanLayout from "@/pages/salesman/SalesmanLayout";
import SalesmanDashboard from "@/pages/salesman/SalesmanDashboard";
import SalesmanVendorsPage from "@/pages/salesman/SalesmanVendorsPage";
import SalesmanVendorDetailPage from "@/pages/salesman/SalesmanVendorDetailPage";
import SalesmanCreateRequestPage from "@/pages/salesman/SalesmanCreateRequestPage";
import SalesmanRequestsPage from "@/pages/salesman/SalesmanRequestsPage";
import SalesmanRequestDetailPage from "@/pages/salesman/SalesmanRequestDetailPage";

// Driver Pages
import DriverLayout from "@/pages/driver/DriverLayout";
import DriverDashboard from "@/pages/driver/DriverDashboard";
import DriverRoute from "@/pages/driver/DriverRoute";
import DriverStopDetailPage from "@/pages/driver/DriverStopDetailPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RoleBasedRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'super_admin':
      return <Navigate to="/admin" replace />;
    case 'manager':
      return <Navigate to="/manager" replace />;
    case 'salesman':
      return <Navigate to="/salesman" replace />;
    case 'driver':
      return <Navigate to="/driver" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Root redirect based on role */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* Super Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminTenantsTab />} />
        <Route path="overview" element={<AdminGlobalOverviewPage />} />
        <Route path="users" element={<AdminUsersTab />} />
        <Route path="tenant/:tenantId" element={<TenantDetailPage />} />
        <Route path="users/:userId" element={<UserDetailPage />} />
      </Route>

      {/* Manager Routes */}
      <Route 
        path="/manager" 
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="requests" element={<ManagerRequests />} />
        <Route path="requests/consolidated" element={<ManagerConsolidatedPage />} />
        <Route path="requests/:requestId" element={<ManagerRequestDetailPage />} />
        <Route path="trips" element={<ManagerTrips />} />
        <Route path="trips/create" element={<ManagerCreateTripPage />} />
        <Route path="trips/:tripId" element={<ManagerTripDetailPage />} />
        <Route path="monitoring" element={<ManagerDeliveryMonitoringPage />} />
        <Route path="monitoring/:tripId" element={<ManagerTripMonitoringDetailPage />} />
        <Route path="team" element={<ManagerTeamPage />} />
        <Route path="team/invite" element={<ManagerInviteUserPage />} />
        <Route path="team/:userId" element={<ManagerTeamMemberPage />} />
        <Route path="products" element={<ManagerProductsPage />} />
        <Route path="products/add" element={<ManagerAddProductPage />} />
        <Route path="products/:productId" element={<ManagerEditProductPage />} />
        <Route path="vendors" element={<ManagerVendorsPage />} />
        <Route path="vendors/add" element={<ManagerAddVendorPage />} />
        <Route path="vendors/:vendorId" element={<ManagerVendorDetailPage />} />
        <Route path="vendors/:vendorId/edit" element={<ManagerEditVendorPage />} />
        <Route path="routes" element={<ManagerRoutesPage />} />
        <Route path="routes/create" element={<ManagerCreateRoutePage />} />
        <Route path="routes/:routeId" element={<ManagerRouteDetailPage />} />
        <Route path="routes/:routeId/edit" element={<ManagerEditRoutePage />} />
      </Route>

      {/* Salesman Routes */}
      <Route 
        path="/salesman" 
        element={
          <ProtectedRoute allowedRoles={['salesman']}>
            <SalesmanLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SalesmanDashboard />} />
        <Route path="vendors" element={<SalesmanVendorsPage />} />
        <Route path="vendors/:vendorId" element={<SalesmanVendorDetailPage />} />
        <Route path="create/:vendorId" element={<SalesmanCreateRequestPage />} />
        <Route path="requests" element={<SalesmanRequestsPage />} />
        <Route path="requests/:requestId" element={<SalesmanRequestDetailPage />} />
      </Route>

      {/* Driver Routes */}
      <Route 
        path="/driver" 
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DriverDashboard />} />
        <Route path="route" element={<DriverRoute />} />
        <Route path="stop/:stopId" element={<DriverStopDetailPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
