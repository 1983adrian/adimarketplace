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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import Messages from "./pages/Messages";
import SellerProfile from "./pages/SellerProfile";
import SellerAnalytics from "./pages/SellerAnalytics";
// Public pages
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import HelpCenter from "./pages/HelpCenter";
import SafetyTips from "./pages/SafetyTips";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminListings from "./pages/admin/AdminListings";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminFees from "./pages/admin/AdminFees";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminDisputes from "./pages/admin/AdminDisputes";
import OwnerDashboard from "./pages/admin/OwnerDashboard";
import AdminApiSettings from "./pages/admin/AdminApiSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminPlatformSettings from "./pages/admin/AdminPlatformSettings";
import AdminPolicies from "./pages/admin/AdminPolicies";
import AdminHomepageEditor from "./pages/admin/AdminHomepageEditor";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates";
import AdminSEO from "./pages/admin/AdminSEO";
import AdminMaintenance from "./pages/admin/AdminMaintenance";
import AdminAuditLog from "./pages/admin/AdminAuditLog";

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
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/sell" element={<CreateListing />} />
                <Route path="/listing/:id/edit" element={<EditListing />} />
                <Route path="/edit-listing/:id" element={<EditListing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/seller-analytics" element={<SellerAnalytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/seller/:id" element={<SellerProfile />} />
                {/* Public Informational Pages */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/safety" element={<SafetyTips />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/cookies" element={<CookiePolicy />} />
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
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/settings" element={<AdminPlatformSettings />} />
                <Route path="/admin/policies" element={<AdminPolicies />} />
                <Route path="/admin/homepage" element={<AdminHomepageEditor />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/email-templates" element={<AdminEmailTemplates />} />
                <Route path="/admin/seo" element={<AdminSEO />} />
                <Route path="/admin/maintenance" element={<AdminMaintenance />} />
                <Route path="/admin/audit-log" element={<AdminAuditLog />} />
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
