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
import { HreflangTags } from "@/components/seo/HreflangTags";
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
import CheckoutCancel from "./pages/CheckoutCancel";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import Messages from "./pages/Messages";
import SellerAnalytics from "./pages/SellerAnalytics";
import Favorites from "./pages/Favorites";
// New dedicated pages
import SellerMode from "./pages/SellerMode";
import SellerPlans from "./pages/SellerPlans";
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
import StorePage from "./pages/StorePage";
import Feedback from "./pages/Feedback";
import Notifications from "./pages/Notifications";
import HowItWorks from "./pages/HowItWorks";
import FeesAndCommissions from "./pages/FeesAndCommissions";
import SellerPlansPublic from "./pages/SellerPlansPublic";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminListings from "./pages/admin/AdminListings";
import AdminOrders from "./pages/admin/AdminOrders";

import AdminMessages from "./pages/admin/AdminMessages";
import AdminDisputes from "./pages/admin/AdminDisputes";


import AdminPlatformSettings from "./pages/admin/AdminPlatformSettings";
import AdminPolicies from "./pages/admin/AdminPolicies";
import AdminHomepageEditor from "./pages/admin/AdminHomepageEditor";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates";
import AdminSEO from "./pages/admin/AdminSEO";
import AdminMaintenance from "./pages/admin/AdminMaintenance";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import AdminDeliveryManagement from "./pages/admin/AdminDeliveryManagement";
import AdminReturns from "./pages/admin/AdminReturns";
import AdminSellerVerifications from "./pages/admin/AdminSellerVerifications";
import AdminAuctions from "./pages/admin/AdminAuctions";
import AdminBroadcast from "./pages/admin/AdminBroadcast";

import AdminPaymentProcessors from "./pages/admin/AdminPaymentProcessors";
import AdminSellerPayouts from "./pages/admin/AdminSellerPayouts";
import AdminFraudAlerts from "./pages/admin/AdminFraudAlerts";

import AdminSellerSubscriptions from "./pages/admin/AdminSellerSubscriptions";

const queryClient = new QueryClient();

// Define all public routes that need language prefixes
const publicRoutes = [
  { path: "/", element: <Index /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/sign-out", element: <SignOut /> },
  { path: "/browse", element: <Browse /> },
  { path: "/listing/:id", element: <ListingDetail /> },
  { path: "/sell", element: <CreateListing /> },
  { path: "/listing/:id/edit", element: <EditListing /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/seller-mode", element: <SellerMode /> },
  { path: "/seller-plans", element: <SellerPlans /> },
  { path: "/my-products", element: <MyProducts /> },
  { path: "/wallet", element: <Wallet /> },
  { path: "/profile-settings", element: <ProfileSettings /> },
  { path: "/seller-analytics", element: <SellerAnalytics /> },
  { path: "/settings", element: <Settings /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/checkout/success", element: <CheckoutSuccess /> },
  { path: "/checkout/cancel", element: <CheckoutCancel /> },
  { path: "/orders", element: <Orders /> },
  { path: "/messages", element: <Messages /> },
  { path: "/favorites", element: <Favorites /> },
  { path: "/seller/:id", element: <StorePage /> },
  { path: "/store/:id", element: <StorePage /> },
  { path: "/about", element: <AboutUs /> },
  { path: "/contact", element: <Contact /> },
  { path: "/faq", element: <FAQ /> },
  { path: "/help", element: <HelpCenter /> },
  { path: "/safety", element: <SafetyTips /> },
  { path: "/terms", element: <TermsOfService /> },
  { path: "/privacy", element: <PrivacyPolicy /> },
  { path: "/seller-rules", element: <SellerRules /> },
  { path: "/cookies", element: <CookiePolicy /> },
  { path: "/install", element: <InstallApp /> },
  { path: "/seller-tutorial", element: <SellerTutorial /> },
  { path: "/feedback", element: <Feedback /> },
  { path: "/notifications", element: <Notifications /> },
  { path: "/cum-functioneaza", element: <HowItWorks /> },
  { path: "/taxe-si-comisioane", element: <FeesAndCommissions /> },
  { path: "/abonamente-vanzatori", element: <SellerPlansPublic /> },
];

// Admin routes (no language prefix needed)
const adminRoutes = [
  { path: "/admin", element: <AdminDashboard /> },
  { path: "/admin/users", element: <AdminUsers /> },
  { path: "/admin/listings", element: <AdminListings /> },
  { path: "/admin/orders", element: <AdminOrders /> },
  { path: "/admin/deliveries", element: <AdminDeliveryManagement /> },
  { path: "/admin/payments", element: <AdminPaymentProcessors /> },
  { path: "/admin/messages", element: <AdminMessages /> },
  { path: "/admin/disputes", element: <AdminDisputes /> },
  { path: "/admin/settings", element: <AdminPlatformSettings /> },
  { path: "/admin/policies", element: <AdminPolicies /> },
  { path: "/admin/homepage", element: <AdminHomepageEditor /> },
  { path: "/admin/categories", element: <AdminCategories /> },
  { path: "/admin/email-templates", element: <AdminEmailTemplates /> },
  { path: "/admin/seo", element: <AdminSEO /> },
  { path: "/admin/maintenance", element: <AdminMaintenance /> },
  { path: "/admin/audit-log", element: <AdminAuditLog /> },
  { path: "/admin/returns", element: <AdminReturns /> },
  { path: "/admin/seller-verifications", element: <AdminSellerVerifications /> },
  { path: "/admin/auctions", element: <AdminAuctions /> },
  { path: "/admin/seller-payouts", element: <AdminSellerPayouts /> },
  { path: "/admin/broadcast", element: <AdminBroadcast /> },
  { path: "/admin/fraud-alerts", element: <AdminFraudAlerts /> },
  { path: "/admin/seller-subscriptions", element: <AdminSellerSubscriptions /> },
];

// No language prefixes needed - using geo-based auto-detection

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <LocationProvider>
              <LanguageProvider>
                <CurrencyProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <HreflangTags />
                    <Routes>
                      {/* All public routes - no language prefixes, auto-detected via geo */}
                      {publicRoutes.map(({ path, element }) => (
                        <Route key={path} path={path} element={element} />
                      ))}
                      
                      {/* Admin routes (no language prefix) */}
                      {adminRoutes.map(({ path, element }) => (
                        <Route key={path} path={path} element={element} />
                      ))}
                      
                      {/* 404 for all unmatched routes */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TooltipProvider>
                </CurrencyProvider>
              </LanguageProvider>
            </LocationProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
