import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import SignOut from "./pages/SignOut";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import Messages from "./pages/Messages";
import SellerProfile from "./pages/SellerProfile";
import SellerAnalytics from "./pages/SellerAnalytics";
import Favorites from "./pages/Favorites";
// New dedicated pages
import SellerMode from "./pages/SellerMode";
import MyProducts from "./pages/MyProducts";
import Wallet from "./pages/Wallet";
import ProfileSettings from "./pages/ProfileSettings";
// Public pages
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import HelpCenter from "./pages/HelpCenter";
import SafetyTips from "./pages/SafetyTips";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import SellerRules from "./pages/SellerRules";
import InstallApp from "./pages/InstallApp";
import SellerTutorial from "./pages/SellerTutorial";
import Feedback from "./pages/Feedback";
import Notifications from "./pages/Notifications";
import HowItWorks from "./pages/HowItWorks";
import FeesAndCommissions from "./pages/FeesAndCommissions";
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
import AdminAISales from "./pages/admin/AdminAISales";
import AdminAIMaintenance from "./pages/admin/AdminAIMaintenance";
import AdminDeliveryManagement from "./pages/admin/AdminDeliveryManagement";
import AdminReturns from "./pages/admin/AdminReturns";
import AdminSellerVerifications from "./pages/admin/AdminSellerVerifications";
import AdminAuctions from "./pages/admin/AdminAuctions";
import AdminBroadcast from "./pages/admin/AdminBroadcast";

import AdminSecuritySettings from "./pages/admin/AdminSecuritySettings";
import AdminPaymentProcessors from "./pages/admin/AdminPaymentProcessors";
import AdminSellerPayouts from "./pages/admin/AdminSellerPayouts";
import AdminCouriers from "./pages/admin/AdminCouriers";
import AdminMobileApp from "./pages/admin/AdminMobileApp";
import AdminInterfaceEditor from "./pages/admin/AdminInterfaceEditor";
import AdminButtonAudit from "./pages/admin/AdminButtonAudit";
import AdminControlCenter from "./pages/admin/AdminControlCenter";
import AdminFraudAlerts from "./pages/admin/AdminFraudAlerts";
import AdminSEODashboard from "./pages/admin/AdminSEODashboard";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <LocationProvider>
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
                <Route path="/sign-out" element={<SignOut />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/sell" element={<CreateListing />} />
                <Route path="/listing/:id/edit" element={<EditListing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/seller-mode" element={<SellerMode />} />
                <Route path="/my-products" element={<MyProducts />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/profile-settings" element={<ProfileSettings />} />
                <Route path="/seller-analytics" element={<SellerAnalytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/seller/:id" element={<SellerProfile />} />
                {/* Public Informational Pages */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/safety" element={<SafetyTips />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/seller-rules" element={<SellerRules />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/install" element={<InstallApp />} />
                <Route path="/seller-tutorial" element={<SellerTutorial />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/cum-functioneaza" element={<HowItWorks />} />
                <Route path="/taxe-si-comisioane" element={<FeesAndCommissions />} />
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/owner" element={<OwnerDashboard />} />
                <Route path="/admin/ai-sales" element={<AdminAISales />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/listings" element={<AdminListings />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/deliveries" element={<AdminDeliveryManagement />} />
                <Route path="/admin/fees" element={<AdminFees />} />
                <Route path="/admin/payments" element={<AdminPaymentProcessors />} />
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
                <Route path="/admin/ai-maintenance" element={<AdminAIMaintenance />} />
                <Route path="/admin/audit-log" element={<AdminAuditLog />} />
                <Route path="/admin/returns" element={<AdminReturns />} />
                <Route path="/admin/seller-verifications" element={<AdminSellerVerifications />} />
                <Route path="/admin/auctions" element={<AdminAuctions />} />
                
                <Route path="/admin/security" element={<AdminSecuritySettings />} />
                <Route path="/admin/seller-payouts" element={<AdminSellerPayouts />} />
                <Route path="/admin/couriers" element={<AdminCouriers />} />
                <Route path="/admin/mobile-app" element={<AdminMobileApp />} />
                <Route path="/admin/broadcast" element={<AdminBroadcast />} />
                <Route path="/admin/interface-editor" element={<AdminInterfaceEditor />} />
                <Route path="/admin/button-audit" element={<AdminButtonAudit />} />
                <Route path="/admin/control-center" element={<AdminControlCenter />} />
                <Route path="/admin/fraud-alerts" element={<AdminFraudAlerts />} />
                <Route path="/admin/seo-dashboard" element={<AdminSEODashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </LocationProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
