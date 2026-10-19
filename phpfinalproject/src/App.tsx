import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";
import { BASE_PATH } from "@/lib/paths";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminLogin } from "./features/admin/pages/AdminLogin";
import { AdminDashboard } from "./features/admin/pages/AdminDashboard";
import { ManageVehicles } from "./features/admin/pages/ManageVehicles";
import { ManageBookings } from "./features/admin/pages/ManageBookings";
import { CarDetail } from "./features/cars/pages/CarDetail";
import { MyBookings } from "./features/bookings/pages/MyBookings";
import { RequireAdmin } from "./features/auth/components/RequireAdmin";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={BASE_PATH}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/vehicles" element={<ManageVehicles />} />
            <Route path="/admin/bookings" element={<ManageBookings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
