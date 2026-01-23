import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Package, ShoppingBag, GraduationCap, MessageCircle, 
  Wallet, BarChart3, Heart, Settings, Bell, LogOut, Store, User,
  Undo2, MailOpen, Receipt
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMyListings } from '@/hooks/useListings';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { cn } from '@/lib/utils';

const menuItems = [
  { id: 'profile', title: 'Setări Profil', url: '/profile-settings', icon: User, color: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
  { id: 'seller-mode', title: 'Mod Vânzător', url: '/seller-mode', icon: Store, color: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  { id: 'sell', title: 'Adaugă Produs', url: '/sell', icon: Plus, color: 'bg-gradient-to-br from-cyan-400 to-blue-500' },
  { id: 'wallet', title: 'Portofel', url: '/wallet', icon: Wallet, color: 'bg-gradient-to-br from-green-500 to-emerald-600' },
  { id: 'messages', title: 'Mesaje', url: '/messages', icon: MessageCircle, color: 'bg-gradient-to-br from-teal-400 to-cyan-600', showBadge: 'messages' },
  { id: 'purchases', title: 'Cumpărăturile Mele', url: '/orders?section=buying', icon: ShoppingBag, color: 'bg-gradient-to-br from-sky-400 to-blue-500' },
  { id: 'sales', title: 'Vânzările Mele', url: '/orders?section=selling', icon: Receipt, color: 'bg-gradient-to-br from-green-400 to-emerald-500' },
  { id: 'my-returns', title: 'Returnările Mele', url: '/orders?section=my-returns', icon: Undo2, color: 'bg-gradient-to-br from-orange-400 to-red-500' },
  { id: 'received-returns', title: 'Returnări Primite', url: '/orders?section=received-returns', icon: MailOpen, color: 'bg-gradient-to-br from-purple-400 to-violet-500' },
  { id: 'products', title: 'Produsele Mele', url: '/my-products', icon: Package, color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
  { id: 'analytics', title: 'Statistici', url: '/seller-analytics', icon: BarChart3, color: 'bg-gradient-to-br from-indigo-400 to-blue-600' },
  { id: 'favorites', title: 'Favorite', url: '/favorites', icon: Heart, color: 'bg-gradient-to-br from-red-400 to-pink-500' },
  { id: 'tutorial', title: 'Tutorial', url: '/seller-tutorial', icon: GraduationCap, color: 'bg-gradient-to-br from-pink-500 to-rose-600' },
];

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const { data: myListings } = useMyListings(user?.id);
  const { data: unreadMessages = 0 } = useUnreadMessages();
  const { data: unreadNotifications = 0 } = useUnreadNotifications();

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

  // Removed earnings display - now only in Wallet

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        
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
              <h1 className="text-lg font-bold">{profile?.display_name || 'Bun venit'}</h1>
              <p className="text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Vânzător Marketplace România
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
            <button 
              onClick={handleSignOut} 
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-500 font-medium text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Ieșire</span>
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="bg-card border-2 border-border rounded-3xl p-4 shadow-lg max-w-md mx-auto">
          <h2 className="text-lg font-bold text-center mb-3">Meniu</h2>
          <div className="grid grid-cols-3 gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const badgeCount = item.showBadge === 'messages' ? unreadMessages : 0;
              
              return (
                <Link 
                  key={item.id}
                  to={item.url}
                  className="relative flex flex-col items-center p-2 rounded-lg bg-muted/50 hover:bg-muted hover:shadow-md transition-all duration-200 min-h-[72px] active:scale-95"
                >
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                  
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-1 shadow-sm", item.color)}>
                    <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </div>
                  
                  <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2">
                    {item.title}
                  </span>
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
