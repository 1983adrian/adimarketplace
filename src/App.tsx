import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import SellerProfile from "./pages/SellerProfile";
import SellerAnalytics from "./pages/SellerAnalytics";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminListings from "./pages/admin/AdminListings";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminFees from "./pages/admin/AdminFees";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminDisputes from "./pages/admin/AdminDisputes";
import OwnerDashboard from "./pages/admin/OwnerDashboard";
import AdminApiSettings from "./pages/admin/AdminApiSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/sell" element={<CreateListing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/seller-analytics" element={<SellerAnalytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/seller/:id" element={<SellerProfile />} />
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/owner" element={<OwnerDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/listings" element={<AdminListings />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/fees" element={<AdminFees />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/api-settings" element={<AdminApiSettings />} />
                <Route path="/admin/disputes" element={<AdminDisputes />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
