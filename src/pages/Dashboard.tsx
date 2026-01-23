import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Package, ShoppingBag, GraduationCap, MessageCircle, 
  Wallet, BarChart3, Heart, Settings, Bell, LogOut, Store, User
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
  { id: 'seller-mode', title: 'Mod Vânzător', url: '/seller-mode', icon: Store, color: 'bg-gradient-to-br from-amber-400 to-orange-500' },
  { id: 'products', title: 'Produsele Mele', url: '/my-products', icon: Package, color: 'bg-gradient-to-br from-violet-500 to-purple-600' },
  { id: 'wallet', title: 'Portofel', url: '/wallet', icon: Wallet, color: 'bg-gradient-to-br from-green-500 to-emerald-600' },
  { id: 'profile', title: 'Setări Profil', url: '/profile-settings', icon: User, color: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
  { id: 'sell', title: 'Adaugă Produs', url: '/sell', icon: Plus, color: 'bg-gradient-to-br from-cyan-400 to-blue-500' },
  { id: 'orders', title: 'Comenzi', url: '/orders', icon: ShoppingBag, color: 'bg-gradient-to-br from-rose-400 to-pink-600' },
  { id: 'messages', title: 'Mesaje', url: '/messages', icon: MessageCircle, color: 'bg-gradient-to-br from-teal-400 to-cyan-600', showBadge: 'messages' },
  { id: 'favorites', title: 'Favorite', url: '/favorites', icon: Heart, color: 'bg-gradient-to-br from-red-400 to-pink-500' },
  { id: 'analytics', title: 'Statistici', url: '/seller-analytics', icon: BarChart3, color: 'bg-gradient-to-br from-indigo-400 to-blue-600' },
  { id: 'tutorial', title: 'Tutorial PRO', url: '/seller-tutorial', icon: GraduationCap, color: 'bg-gradient-to-br from-pink-500 to-rose-600' },
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
              <p className="text-sm text-muted-foreground">Meniu & Cont</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </Link>
            <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-muted transition-colors text-red-500">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-center mb-4">Meniu</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const badgeCount = item.showBadge === 'messages' ? unreadMessages : 0;
              
              return (
                <Link 
                  key={item.id}
                  to={item.url}
                  className="relative flex flex-col items-center p-3 rounded-xl bg-muted/50 hover:bg-muted hover:shadow-md transition-all duration-200"
                >
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                  
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-2 shadow-md", item.color)}>
                    <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>
                  
                  <span className="text-xs font-medium text-foreground text-center leading-tight">
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
