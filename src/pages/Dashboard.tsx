import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Package, ShoppingBag, GraduationCap, MessageCircle, 
  Wallet, BarChart3, Heart, Bell, Store, User,
  Undo2, Receipt, Moon, Sun, CreditCard
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SubscriptionAlerts } from '@/components/subscriptions/SubscriptionAlerts';
import { useMyListings } from '@/hooks/useListings';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useDashboardBadges } from '@/hooks/useDashboardBadges';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

type BadgeType = 'messages' | 'purchases' | 'sales' | 'my-returns' | null;

interface MenuItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ElementType;
  color: string;
  showBadge?: BadgeType;
}

const menuItemsConfig: MenuItem[] = [
  { id: 'profile', title: 'Setări Profil', description: 'Editează cont', url: '/profile-settings', icon: User, color: 'bg-gradient-to-br from-blue-500 to-blue-700' },
  { id: 'seller-mode', title: 'Mod Vânzător', description: 'Activează card', url: '/seller-mode', icon: Store, color: 'bg-gradient-to-br from-amber-400 to-amber-600' },
  { id: 'subscriptions', title: 'Abonamente', description: 'Planuri & plăți', url: '/seller-plans', icon: CreditCard, color: 'bg-gradient-to-br from-purple-500 to-purple-700' },
  { id: 'sell', title: 'Vinde Produs', description: 'Publică anunț', url: '/sell', icon: Plus, color: 'bg-gradient-to-br from-emerald-500 to-emerald-700' },
  { id: 'wallet', title: 'Portofel', description: 'Vezi sold', url: '/wallet', icon: Wallet, color: 'bg-gradient-to-br from-violet-500 to-violet-700' },
  { id: 'messages', title: 'Mesaje', description: 'Conversații', url: '/messages', icon: MessageCircle, color: 'bg-gradient-to-br from-cyan-400 to-cyan-600', showBadge: 'messages' },
  { id: 'purchases', title: 'Cumpărături', description: 'Produse comandate', url: '/orders?section=buying', icon: ShoppingBag, color: 'bg-gradient-to-br from-rose-500 to-rose-700', showBadge: 'purchases' },
  { id: 'sales', title: 'Vânzări', description: 'Comenzi clienți', url: '/orders?section=selling', icon: Receipt, color: 'bg-gradient-to-br from-lime-500 to-lime-700', showBadge: 'sales' },
  { id: 'returns', title: 'Retururi', description: 'Toate returnările', url: '/orders?section=my-returns', icon: Undo2, color: 'bg-gradient-to-br from-orange-500 to-orange-700', showBadge: 'my-returns' },
  { id: 'products', title: 'Produsele Mele', description: 'Anunțuri active', url: '/my-products', icon: Package, color: 'bg-gradient-to-br from-teal-500 to-teal-700' },
  { id: 'analytics', title: 'Statistici', description: 'Vizualizări', url: '/seller-analytics', icon: BarChart3, color: 'bg-gradient-to-br from-indigo-500 to-indigo-700' },
  { id: 'favorites', title: 'Favorite', description: 'Produse salvate', url: '/favorites', icon: Heart, color: 'bg-gradient-to-br from-red-500 to-red-700' },
  { id: 'tutorial', title: 'Tutorial', description: 'Pas cu pas', url: '/seller-tutorial', icon: GraduationCap, color: 'bg-gradient-to-br from-yellow-600 to-yellow-800' },
];

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  
  const { data: myListings } = useMyListings(user?.id);
  const { data: unreadMessages = 0 } = useUnreadMessages();
  const { data: unreadNotifications = 0 } = useUnreadNotifications();
  const { pendingPurchases, pendingSales, myPendingReturns } = useDashboardBadges();

  // Handle dark mode toggle
  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">{t('common.loading')}</p>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        
        {/* Subscription Alerts */}
        <div className="mb-4">
          <SubscriptionAlerts />
        </div>

        {/* PayPal Setup Banner for sellers without PayPal */}
        {(profile as any)?.is_seller && !(profile as any)?.paypal_email && (
          <div className="mb-4 p-4 rounded-xl border-2 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <Wallet className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  ⚠️ Configurează PayPal pentru a primi plăți
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Ai modul vânzător activ, dar nu ai conectat un cont PayPal. Fără PayPal, nu poți primi banii din vânzări.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="https://www.paypal.com/ro/webapps/mpp/account-selection"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
                  >
                    Deschide Cont PayPal →
                  </a>
                  <Link
                    to="/seller-mode"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    Conectează PayPal Existent
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PayPal Email Status for sellers */}
        {(profile as any)?.is_seller && (profile as any)?.paypal_email && (
          <div className="mb-4 p-3 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15">
              <Wallet className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Email PayPal salvat</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 truncate">{(profile as any).paypal_email}</p>
              <p className="text-[10px] text-amber-500 dark:text-amber-500 mt-0.5">⚠️ Neverificat — asigură-te că email-ul corespunde contului tău PayPal real.</p>
            </div>
            <Link to="/seller-mode" className="text-xs text-amber-600 hover:text-amber-700 font-medium whitespace-nowrap">
              Modifică →
            </Link>
          </div>
        )}
        {/* Header: Avatar + Name + Balance + Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10">
                {profile?.display_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{profile?.display_name || 'Bine ai venit'}</h1>
                {(profile as any)?.short_id && (
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono font-bold">
                    #{(profile as any).short_id}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Marketplace România
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative p-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 transition-colors">
              <Bell className="h-5 w-5 text-amber-500" fill="currentColor" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="bg-card border-2 border-border rounded-3xl p-4 shadow-lg max-w-md mx-auto">
          {/* Header with Meniu title and Dark Mode toggle */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Meniu</h2>
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-amber-400"
              />
              <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {menuItemsConfig.map((item) => {
              const Icon = item.icon;
              
              // Calculate badge count based on badge type
              let badgeCount = 0;
              if (item.showBadge === 'messages') badgeCount = unreadMessages;
              else if (item.showBadge === 'purchases') badgeCount = pendingPurchases;
              else if (item.showBadge === 'sales') badgeCount = pendingSales;
              else if (item.showBadge === 'my-returns') badgeCount = myPendingReturns;
              
              // Format notification text
              const notificationText = badgeCount === 1 
                ? '1 notificare' 
                : badgeCount > 1 
                  ? `${badgeCount > 99 ? '99+' : badgeCount} notificări`
                  : null;
              
              return (
                <Link 
                  key={item.id}
                  to={item.url}
                  className={cn(
                    "relative flex flex-col items-center p-2 rounded-lg bg-muted/50 hover:bg-muted hover:shadow-md transition-all duration-200 min-h-[88px] active:scale-95",
                    item.id === 'sell' && "col-span-3 flex-row justify-center gap-3 min-h-[56px] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center mb-1 shadow-sm",
                    item.color,
                    item.id === 'sell' && "w-10 h-10 mb-0 bg-white/20"
                  )}>
                    <Icon className={cn("h-4 w-4 text-white", item.id === 'sell' && "h-5 w-5")} strokeWidth={2.5} />
                  </div>
                  
                  <span className={cn(
                    "text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2",
                    item.id === 'sell' && "text-sm font-bold text-white"
                  )}>
                    {item.title}
                  </span>
                  
                  <span className={cn(
                    "text-[8px] text-muted-foreground text-center leading-tight opacity-70 line-clamp-1",
                    item.id === 'sell' && "text-[9px] text-white/80"
                  )}>
                    {item.description}
                  </span>
                  
                  {notificationText && (
                    <span className="mt-1 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold animate-pulse shadow-sm">
                      {notificationText}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;