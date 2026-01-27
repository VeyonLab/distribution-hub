import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import LoginPage from "@/pages/LoginPage";
import SuperAdminDashboard from "@/pages/admin/SuperAdminDashboard";
import ManagerLayout from "@/pages/manager/ManagerLayout";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ManagerRequests from "@/pages/manager/ManagerRequests";
import ManagerTrips from "@/pages/manager/ManagerTrips";
import SalesmanLayout from "@/pages/salesman/SalesmanLayout";
import SalesmanDashboard from "@/pages/salesman/SalesmanDashboard";
import SalesmanCreateRequest from "@/pages/salesman/SalesmanCreateRequest";
import SalesmanMyRequests from "@/pages/salesman/SalesmanMyRequests";
import DriverLayout from "@/pages/driver/DriverLayout";
import DriverDashboard from "@/pages/driver/DriverDashboard";
import DriverRoute from "@/pages/driver/DriverRoute";
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

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Root redirect */}
      <Route 
        path="/" 
        element={
          isAuthenticated && user 
            ? <Navigate to={`/${user.role === 'super_admin' ? 'admin' : user.role}`} replace />
            : <Navigate to="/login" replace />
        } 
      />

      {/* Super Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } 
      />

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
        <Route path="trips" element={<ManagerTrips />} />
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
        <Route path="create" element={<SalesmanCreateRequest />} />
        <Route path="requests" element={<SalesmanMyRequests />} />
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
